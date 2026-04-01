"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onSave?: (title: string, content: string) => void;
  onAutoSave?: (title: string, content: string) => void;
  autoSaveInterval?: number;
}

export default function MarkdownEditor({
  initialContent = "",
  initialTitle = "",
  onSave,
  onAutoSave,
  autoSaveInterval = 5000,
}: MarkdownEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaved, setIsSaved] = useState(true);

  // Auto-save effect
  useEffect(() => {
    if (!onAutoSave || !autoSaveInterval) return;

    const timeout = setTimeout(() => {
      if (title || content) {
        onAutoSave(title, content);
        setIsSaved(true);
      }
    }, autoSaveInterval);

    return () => clearTimeout(timeout);
  }, [title, content, onAutoSave, autoSaveInterval]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleManualSave = async () => {
    if (onSave) {
      await onSave(title, content);
      setIsSaved(true);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Post title..."
          className="flex-1 px-4 py-2 text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
        <button
          onClick={handleManualSave}
          disabled={isSaved}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Editor */}
        <div className="flex flex-col border border-gray-300 rounded-lg overflow-hidden dark:border-gray-600">
          <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Markdown Editor
            </h3>
          </div>
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Write your post in Markdown..."
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col border border-gray-300 rounded-lg overflow-hidden dark:border-gray-600">
          <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Preview
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-900">
            {content ? (
              <article className="prose dark:prose-invert max-w-none prose-a:text-blue-500 hover:prose-a:underline">
                <ReactMarkdown
                  components={{
                    h1: ({ ...props }) => (
                      <h1 className="text-3xl font-bold mt-4 mb-2" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="text-2xl font-bold mt-3 mb-2" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-xl font-bold mt-3 mb-2" {...props} />
                    ),
                    p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc list-inside mb-4" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4" {...props} />,
                    li: ({ ...props }) => <li className="mb-1" {...props} />,
                    blockquote: ({ ...props }) => (
                      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
                    ),
                    code: (props: any) =>
                      props.inline ? (
                        <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm" {...props} />
                      ) : (
                        <code className="block bg-gray-200 dark:bg-gray-700 p-4 rounded my-4 overflow-auto" {...props} />
                      ),
                    pre: ({ ...props }) => <pre className="mb-4" {...props} />,
                    a: ({ ...props }) => (
                      <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Your rendered content will appear here...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
