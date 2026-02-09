import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../../../shared/components/ui/button';

interface CodeExampleProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeExample({ code, language = 'text', title }: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="my-4 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {title}
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            className="h-6 gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-xs bg-white dark:bg-gray-950">
          <code className={`language-${language}`}>{code}</code>
        </pre>
        {!title && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            className="absolute top-2 right-2 h-6 gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
