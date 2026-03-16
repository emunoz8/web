import React from "react";

interface ParagrapherProps {
  text: string;
}

const PARAGRAPH_BREAK_PATTERN = /\n\s*\n/;

const Paragrapher: React.FC<ParagrapherProps> = React.memo(function Paragrapher({ text }) {
  const paragraphs = text.split(PARAGRAPH_BREAK_PATTERN);

  return (
    <div className="text-area">
      {paragraphs.map((para, i) => (
        <p key={i} className="mb-4 whitespace-pre-wrap leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  );
});

Paragrapher.displayName = "Paragrapher";

export default Paragrapher;
