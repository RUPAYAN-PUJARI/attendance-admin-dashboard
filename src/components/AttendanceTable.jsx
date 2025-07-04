import React, { useEffect, useState } from "react";
import api from "../api";

export default function AttendanceTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    api
      .get("/attendance")
      .then((res) => {
        setRecords(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const groupTimestampsByDate = (timestamps) => {
    return timestamps.reduce((acc, ts) => {
      const date = new Date(ts).toLocaleDateString();
      acc[date] = acc[date] || [];
      acc[date].push(ts);
      return acc;
    }, {});
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Attendance Records
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border">
          <table className="min-w-full table-auto">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 border-b">#</th>
                <th className="px-4 py-3 border-b text-left">User ID</th>
                <th className="px-4 py-3 border-b text-left">Status</th>
                <th className="px-4 py-3 border-b text-left">Time</th>
                <th className="px-4 py-3 border-b text-left">
                  Absent Timestamps
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => {
                const groupedAbsents = groupTimestampsByDate(
                  rec.absentTimestamps || []
                );
                return (
                  <React.Fragment key={i}>
                    <tr className="hover:bg-gray-50">
                      <td className="border p-3 text-center">{i + 1}</td>
                      <td className="border p-3">{rec.userId}</td>
                      <td
                        className={`border p-3 font-medium ${
                          rec.status === "Present"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {rec.status}
                      </td>
                      <td className="border p-3 text-gray-700">
                        {new Date(
                          rec.timestamp._seconds * 1000
                        ).toLocaleString()}
                      </td>
                      <td
                        className="border p-3 text-blue-600 cursor-pointer underline"
                        onClick={() => toggleExpand(i)}
                      >
                        {rec.absentTimestamps?.length
                          ? expandedRows[i]
                            ? "Hide Timestamps ▲"
                            : "Show Timestamps ▼"
                          : "—"}
                      </td>
                    </tr>

                    {expandedRows[i] && rec.absentTimestamps?.length > 0 && (
                      <tr>
                        <td colSpan="5" className="p-4 bg-gray-50 border-t">
                          <div className="text-sm text-gray-800 space-y-3">
                            {Object.entries(groupedAbsents).map(
                              ([date, timestamps], index) => (
                                <div key={index}>
                                  <div className="font-semibold mb-1">
                                    {date}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {timestamps.map((ts, idx) => (
                                      <span
                                        key={idx}
                                        className="bg-red-100 text-red-700 rounded px-2 py-1 text-xs"
                                      >
                                        {new Date(ts).toLocaleTimeString()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
