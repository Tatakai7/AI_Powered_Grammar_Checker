import { useRef, useEffect } from 'react';
import { type GrammarError } from '../services/grammarChecker';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  errors: GrammarError[];
  selectedError: GrammarError | null;
  onErrorClick: (error: GrammarError) => void;
}

export function TextEditor({
  content,
  onChange,
  errors,
  selectedError,
  onErrorClick,
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [content]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const getHighlightedText = () => {
    if (!content) return '';

    let lastIndex = 0;
    const parts: JSX.Element[] = [];

    const sortedErrors = [...errors].sort((a, b) => a.start - b.start);

    sortedErrors.forEach((error, index) => {
      if (error.start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>{content.substring(lastIndex, error.start)}</span>
        );
      }

      const isSelected = selectedError?.start === error.start && selectedError?.end === error.end;
      const colorClass =
        error.type === 'grammar' ? 'bg-red-100 border-b-2 border-red-500' :
        error.type === 'spelling' ? 'bg-orange-100 border-b-2 border-orange-500' :
        error.type === 'style' ? 'bg-blue-100 border-b-2 border-blue-500' :
        error.type === 'punctuation' ? 'bg-yellow-100 border-b-2 border-yellow-500' :
        'bg-purple-100 border-b-2 border-purple-500';

      parts.push(
        <mark
          key={`error-${index}`}
          className={`${colorClass} ${isSelected ? 'ring-2 ring-offset-1 ring-emerald-500' : ''} cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => onErrorClick(error)}
        >
          {content.substring(error.start, error.end)}
        </mark>
      );

      lastIndex = error.end;
    });

    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end">{content.substring(lastIndex)}</span>
      );
    }

    return parts;
  };

  return (
    <div className="relative h-full bg-white">
      <div
        ref={highlightRef}
        className="absolute inset-0 p-6 overflow-auto whitespace-pre-wrap break-words font-mono text-base leading-relaxed"
        style={{ wordWrap: 'break-word', color: 'transparent' }}
      >
        <div className="pointer-events-auto select-none">
          {getHighlightedText()}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        className="absolute inset-0 p-6 w-full h-full bg-transparent resize-none outline-none font-mono text-base leading-relaxed text-gray-900"
        placeholder="Start typing or paste your text here..."
        spellCheck={false}
        style={{
          wordWrap: 'break-word',
          color: 'transparent',
          caretColor: '#111827',
          WebkitTextFillColor: 'transparent'
        }}
      />

      <div
        className="absolute inset-0 p-6 pointer-events-none whitespace-pre-wrap break-words font-mono text-base leading-relaxed text-gray-900"
        style={{ wordWrap: 'break-word' }}
      >
        {content}
      </div>
    </div>
  );
}
