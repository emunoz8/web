import React from "react";
import { useTheme } from "../../context/ThemeProvider";

const ThemeToggle: React.FC = React.memo(() => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className="border rounded-md min-h-11 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      onClick={toggleTheme}
      type="button"
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
});

export default ThemeToggle;
