import React, { useEffect, useState } from "react";
import Paragrapher from "../components/helpers/Paragrapher";

const About: React.FC = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("/aboutMe.txt")
      .then((res) => res.text())
      .then(setText);
  }, []);

  return (
      <Paragrapher text={text} />
  );
};

export default About;
