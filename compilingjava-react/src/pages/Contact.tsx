// src/pages/Contact.tsx
import React from "react";
import { Link } from "react-router-dom";

const Contact: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Have a question or want to work together? Get in touch through our form or reach out directly.
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

export default Contact;
