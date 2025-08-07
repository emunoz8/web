// src/pages/Projects.tsx
import React, { useEffect, useState } from "react";
import MarkdownRenderer from "../components/helpers/MarkdownRenderer";
import TicTacToe from "./TicTacToe";

const Projects: React.FC = () => {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (!markdown) {
      fetch("/project0_tictactoe.md")
        .then((res) => res.text())
        .then(setMarkdown)
        .catch(console.error);
    }
  }, [markdown]);

  return( 
    <>
    <MarkdownRenderer content={markdown} />
    <TicTacToe/>
    </>
    );
};

export default Projects;
