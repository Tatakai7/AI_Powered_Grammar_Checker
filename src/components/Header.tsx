import { Save, Clock, FileText, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onShowHistory: () => void;
  onLogout: () => void;
  isSaving: boolean;
  errorCount: number;
}

export function Header({
  title,
  onTitleChange,
  onSave,
  onShowHistory,
  onLogout,
  isSaving,
  errorCount,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2 text-emerald-600">
            <FileText className="w-8 h-8" />
            <span className="text-xl font-bold">GrammarAI</span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-lg font-medium text-gray-800 bg-transparent border-none outline-none focus:bg-gray-50 px-3 py-1 rounded transition-colors"
            placeholder="Untitled Document"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${errorCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              {errorCount} {errorCount === 1 ? 'issue' : 'issues'}
            </span>
          </div>

          <button
            onClick={onShowHistory}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Version History"
          >
            <Clock className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          <button
            onClick={onLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
