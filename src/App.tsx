import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TextEditor } from './components/TextEditor';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { DocumentHistory } from './components/DocumentHistory';
import { analyzeText, applySuggestion, GrammarError } from './services/grammarChecker';

function App() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [selectedError, setSelectedError] = useState<GrammarError | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);

    if (session) {
      loadDocument();
    }
  };

  const loadDocument = async () => {
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (documents) {
      setCurrentDocument(documents);
      setTitle(documents.title);
      setContent(documents.content);
      loadVersions(documents.id);
    }
  };

  const loadVersions = async (documentId: string) => {
    const { data } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (data) {
      setVersions(data);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const newErrors = analyzeText(content);
      setErrors(newErrors);
    }, 500);

    return () => clearTimeout(timer);
  }, [content]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save documents');
      return;
    }

    setIsSaving(true);

    try {
      if (currentDocument) {
        const { error: updateError } = await supabase
          .from('documents')
          .update({
            title,
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentDocument.id);

        if (updateError) throw updateError;

        const { data: versions } = await supabase
          .from('document_versions')
          .select('version_number')
          .eq('document_id', currentDocument.id)
          .order('version_number', { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextVersion = (versions?.version_number || 0) + 1;

        await supabase.from('document_versions').insert({
          document_id: currentDocument.id,
          content,
          version_number: nextVersion,
        });

        loadVersions(currentDocument.id);
      } else {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) throw new Error('Not authenticated');

        const { data: newDoc, error: insertError } = await supabase
          .from('documents')
          .insert({
            title,
            content,
            user_id: session.session.user.id,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newDoc) {
          setCurrentDocument(newDoc);

          await supabase.from('document_versions').insert({
            document_id: newDoc.id,
            content,
            version_number: 1,
          });

          loadVersions(newDoc.id);
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplySuggestion = (error: GrammarError, suggestion: string) => {
    const newContent = applySuggestion(content, { ...error, suggestion });
    setContent(newContent);
    setErrors(errors.filter(e => e !== error));
    setSelectedError(null);
  };

  const handleDismiss = (error: GrammarError) => {
    setErrors(errors.filter(e => e !== error));
    if (selectedError === error) {
      setSelectedError(null);
    }
  };

  const handleRestore = async (version: DocumentVersion) => {
    setContent(version.content);
    setShowHistory(false);

    if (currentDocument) {
      await supabase
        .from('documents')
        .update({
          content: version.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentDocument.id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✍️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">GrammarAI</h1>
          <p className="text-gray-600 mb-6">
            Your AI-powered writing assistant for perfect grammar and style
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-800">
              Demo Mode: Experience the full interface without authentication.
              All features are available for testing!
            </p>
          </div>
          <button
            onClick={() => setIsAuthenticated(true)}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Continue to Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        title={title}
        onTitleChange={setTitle}
        onSave={handleSave}
        onShowHistory={() => setShowHistory(true)}
        isSaving={isSaving}
        errorCount={errors.length}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <TextEditor
            content={content}
            onChange={setContent}
            errors={errors}
            selectedError={selectedError}
            onErrorClick={setSelectedError}
          />
        </div>

        <SuggestionsPanel
          errors={errors}
          selectedError={selectedError}
          onErrorSelect={setSelectedError}
          onApplySuggestion={handleApplySuggestion}
          onDismiss={handleDismiss}
        />
      </div>

      {showHistory && (
        <DocumentHistory
          versions={versions}
          onClose={() => setShowHistory(false)}
          onRestore={handleRestore}
        />
      )}
    </div>
  );
}

export default App;
