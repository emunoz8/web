// src/pages/About.tsx
import React from "react";
import { Link } from "react-router-dom";

const About: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Learn more about our mission, values, and what drives our work. We’re passionate about building great software.
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

export default About;
