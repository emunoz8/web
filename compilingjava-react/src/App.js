import React, { useEffect, useState } from "react";

function App() {
  const [home, setHome] = useState("");

  useEffect(() => {
    fetch("/api/home")
      .then((res) => res.text())
      .then((text) => setHome(text))
      .catch(console.error);
  }, []);

  return (
    <div className="App">
      <h1>React + Spring Boot Example</h1>
      <p>{home || "Loading..."}</p>
    </div>
  );
}

export default App;
