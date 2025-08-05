import React, { useEffect, useState } from "react";
import MarkdownRenderer from "../components/helpers/MarkdownRenderer";

const Home: React.FC = () => {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (!markdown) {
      fetch("/home.md")
        .then((res) => res.text())
        .then(setMarkdown)
        .catch(console.error);
    }
  }, [markdown]);

  return <MarkdownRenderer content={markdown} />;
};

export default Home;
