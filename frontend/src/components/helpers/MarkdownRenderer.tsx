// src/components/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface MarkdownRendererProps {
  content: string;  // markdown content to render
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose sm:prose-lg lg:prose-xl dark:prose-invert max-w-none p-3 sm:p-4 md:p-8">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, ...props }) => (
            <a
              {...props}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-indigo-600 underline underline-offset-4 hover:text-indigo-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              {children}
            </a>
          ),
        }}
      />
    </div>
  );
};

export default MarkdownRenderer;
