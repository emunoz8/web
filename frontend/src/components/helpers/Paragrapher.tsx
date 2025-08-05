interface ParagrapherProps {
  text: string;
}

const Paragrapher: React.FC<ParagrapherProps> = ({ text }) => {
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="text-area">
      {paragraphs.map((para, i) => (
        <p key={i} className="mb-4 whitespace-pre-wrap">
          {para}
        </p>
      ))}
      
    </div>
  );
};

export default Paragrapher;
