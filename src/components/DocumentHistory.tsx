import { X, Clock, RotateCcw } from 'lucide-react';
import { DocumentVersion } from '../lib/supabase';

interface DocumentHistoryProps {
  versions: DocumentVersion[];
  onClose: () => void;
  onRestore: (version: DocumentVersion) => void;
}

export function DocumentHistory({ versions, onClose, onRestore }: DocumentHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getPreview = (content: string) => {
    const lines = content.split('\n');
    const preview = lines.slice(0, 3).join(' ');
    return preview.length > 150 ? preview.substring(0, 150) + '...' : preview;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Version History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No version history yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Versions are created when you save your document
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          Version {version.version_number}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{formatDate(version.created_at)}</p>
                    </div>

                    {index !== 0 && (
                      <button
                        onClick={() => onRestore(version)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700 font-mono leading-relaxed">
                      {getPreview(version.content)}
                    </p>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {version.content.length} characters
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
