import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TextEditor } from './components/TextEditor';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { DocumentHistory } from './components/DocumentHistory';
import { Login } from './components/Login';
import { analyzeText, applySuggestion } from './services/grammarChecker';
import { apiService } from './services/api';
import type { GrammarError } from './services/grammarChecker';
import type { Document, DocumentVersion } from './services/api';

function App() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [selectedError, setSelectedError] = useState<GrammarError | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      loadDocument();
    }
  };

  const loadDocument = async () => {
    try {
      const documents = await apiService.getDocuments();
      if (documents.length > 0) {
        const doc = documents[0];
        setCurrentDocument(doc);
        setTitle(doc.title);
        setContent(doc.content);
        loadVersions(doc._id);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    }
  };

  const loadVersions = async (documentId: string) => {
    try {
      const data = await apiService.getVersions(documentId);
      setVersions(data);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const newErrors = await analyzeText(content);
      setErrors(newErrors);
    }, 500);

    return () => clearTimeout(timer);
  }, [content]);

  const handleSave = async () => {
    if (!isLoggedIn) {
      alert('Please sign in to save documents');
      return;
    }

    setIsSaving(true);

    try {
      if (currentDocument) {
        await apiService.updateDocument(currentDocument._id, title, content);
        loadVersions(currentDocument._id);
      } else {
        const newDoc = await apiService.createDocument(title, content);
        setCurrentDocument(newDoc);
        loadVersions(newDoc._id);
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
      await apiService.restoreVersion(currentDocument._id, version._id);
      await apiService.updateDocument(currentDocument._id, title, version.content);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    loadDocument();
  };

  const handleLogout = () => {
    apiService.logout();
    setIsLoggedIn(false);
    setCurrentDocument(null);
    setVersions([]);
    setContent('');
    setTitle('Untitled Document');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        title={title}
        onTitleChange={setTitle}
        onSave={handleSave}
        onShowHistory={() => setShowHistory(true)}
        onLogout={handleLogout}
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
