import React from "react";
import Header from "./components/Header";
import AttendanceTable from "./components/AttendanceTable";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AttendanceTable />
    </div>
  );
}

export default App;
