import React from "react";
import { useTheme } from "../../context/ThemeProvider";


const ThemeToggle: React.FC = React.memo(() => {
     const { isDark, toggleTheme } = useTheme();

     return(    <button onClick={toggleTheme}>
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>


     );
  

});

export default ThemeToggle;
