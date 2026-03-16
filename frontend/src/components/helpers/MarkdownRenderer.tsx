// src/components/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface MarkdownRendererProps {
  content: string;
}

const MARKDOWN_COMPONENTS: Components = {
  a: ({ href, children, ...props }) => (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-brand-contrast underline underline-offset-4 transition hover:text-brand-frame"
    >
      {children}
    </a>
  ),
};

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeHighlight];

const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-stone max-w-none pt-6 text-brand-muted prose-headings:font-semibold prose-headings:text-brand-contrast prose-p:text-brand-muted prose-li:text-brand-muted prose-strong:text-brand-contrast prose-code:text-brand-contrast prose-pre:rounded-[1.25rem] prose-pre:border prose-pre:border-brand-line/16 prose-pre:bg-brand-surface prose-pre:text-brand-contrast prose-img:rounded-[1.25rem]">
      <ReactMarkdown
        children={content}
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={MARKDOWN_COMPONENTS}
      />
    </div>
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";

export default MarkdownRenderer;
