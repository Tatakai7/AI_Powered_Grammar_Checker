import { AlertCircle, CheckCircle, Lightbulb, X } from 'lucide-react';
import { GrammarError } from '../services/grammarChecker';

interface SuggestionsPanelProps {
  errors: GrammarError[];
  selectedError: GrammarError | null;
  onErrorSelect: (error: GrammarError) => void;
  onApplySuggestion: (error: GrammarError, suggestion: string) => void;
  onDismiss: (error: GrammarError) => void;
}

export function SuggestionsPanel({
  errors,
  selectedError,
  onErrorSelect,
  onApplySuggestion,
  onDismiss,
}: SuggestionsPanelProps) {
  const errorsByType = {
    grammar: errors.filter((e) => e.type === 'grammar'),
    spelling: errors.filter((e) => e.type === 'spelling'),
    style: errors.filter((e) => e.type === 'style'),
    punctuation: errors.filter((e) => e.type === 'punctuation'),
    clarity: errors.filter((e) => e.type === 'clarity'),
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grammar':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'spelling':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'style':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'punctuation':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'clarity':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grammar':
      case 'spelling':
        return <AlertCircle className="w-4 h-4" />;
      case 'style':
      case 'clarity':
        return <Lightbulb className="w-4 h-4" />;
      case 'punctuation':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const renderErrorCard = (error: GrammarError, index: number) => {
    const isSelected = selectedError === error;
    const colorClass = getTypeColor(error.type);

    return (
      <div
        key={index}
        onClick={() => onErrorSelect(error)}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected ? 'border-emerald-500 bg-emerald-50' : `border-gray-200 bg-white hover:bg-gray-50`
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
            {getTypeIcon(error.type)}
            {error.type.charAt(0).toUpperCase() + error.type.slice(1)}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(error);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-1">Found:</p>
          <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {error.original}
          </p>
        </div>

        {error.suggestion && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">Suggestion:</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono bg-emerald-100 px-2 py-1 rounded flex-1">
                {error.suggestion}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApplySuggestion(error, error.suggestion);
                }}
                className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {error.alternatives && error.alternatives.length > 0 && (
          <div className="mb-2">
            <p className="text-sm text-gray-600 mb-2">Alternatives:</p>
            <div className="flex flex-wrap gap-2">
              {error.alternatives.map((alt, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplySuggestion(error, alt);
                  }}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 hover:border-emerald-500 transition-colors"
                >
                  {alt}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-700 mt-2">{error.explanation}</p>
      </div>
    );
  };

  return (
    <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Suggestions</h2>

        {errors.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No issues found!</p>
            <p className="text-sm text-gray-500 mt-1">Your text looks great.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {errorsByType.grammar.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Grammar ({errorsByType.grammar.length})
                </h3>
                <div className="space-y-3">
                  {errorsByType.grammar.map((error, i) => renderErrorCard(error, i))}
                </div>
              </div>
            )}

            {errorsByType.spelling.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Spelling ({errorsByType.spelling.length})
                </h3>
                <div className="space-y-3">
                  {errorsByType.spelling.map((error, i) => renderErrorCard(error, i))}
                </div>
              </div>
            )}

            {errorsByType.punctuation.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Punctuation ({errorsByType.punctuation.length})
                </h3>
                <div className="space-y-3">
                  {errorsByType.punctuation.map((error, i) => renderErrorCard(error, i))}
                </div>
              </div>
            )}

            {errorsByType.style.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Style ({errorsByType.style.length})
                </h3>
                <div className="space-y-3">
                  {errorsByType.style.map((error, i) => renderErrorCard(error, i))}
                </div>
              </div>
            )}

            {errorsByType.clarity.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Clarity ({errorsByType.clarity.length})
                </h3>
                <div className="space-y-3">
                  {errorsByType.clarity.map((error, i) => renderErrorCard(error, i))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
