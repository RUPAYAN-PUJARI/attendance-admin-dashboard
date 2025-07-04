import React from "react";

export default function Header() {
  return (
    <header className="bg-blue-600 text-white py-4 shadow-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-semibold tracking-wide">
          🗓 Attendance Admin Dashboard
        </h1>
      </div>
    </header>
  );
}
