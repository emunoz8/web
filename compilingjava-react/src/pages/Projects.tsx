// src/pages/Projects.tsx
import React from "react";
import { Link } from "react-router-dom";

const Projects: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Our Projects</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Here’s a list of what we’ve been working on recently. These are private and require authentication.
      </p>
      <Link
        to="/"
        className="text-blue-600 hover:underline"
      >
        ← Back to Home
      </Link>
    </div>
  );
};

export default Projects;
