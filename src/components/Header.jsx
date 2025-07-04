import React from "react";

export default function Header() {
  return (
    <header className="bg-blue-600 shadow-md py-5 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          🧾 Attendance Admin Dashboard
        </h1>
        <p className="text-white text-sm sm:text-base mt-2 sm:mt-0">
          Monitor employee presence in real time
        </p>
      </div>
    </header>
  );
}
