import { BrowserRouter as Router } from "react-router-dom";
import './styles/index.css';
import { ThemeProvider } from "./context/ThemeProvider";
import Theme from "./context/Theme";

function App() {
  return (
    <ThemeProvider>
      <Theme/>
    </ThemeProvider>
  );
}

export default App;
