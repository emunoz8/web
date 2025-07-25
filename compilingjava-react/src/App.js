import React, { useEffect, useState } from "react";

function App() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetch("/api/greeting")
      .then((res) => res.text())
      .then((text) => setGreeting(text))
      .catch(console.error);
  }, []);

  return (
    <div className="App">
      <h1>React + Spring Boot Example</h1>
      <p>{greeting || "Loading..."}</p>
    </div>
  );
}

export default App;
