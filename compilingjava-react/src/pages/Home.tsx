// src/pages/Home.tsx
import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-4xl font-bold mb-4 text-center">Welcome to My Website</h1>
      <p className="text-lg text-gray-600 mb-6 text-center max-w-md">
        This is a demo homepage built with React and React Router. Feel free to explore the projects, contact us, or learn more about what we do.
      </p>

      <Link
        to="/projects"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        View Projects
      </Link>
    </div>
  );
};

export default Home;
