import React, { useEffect, useState } from "react";

export default function AttendanceTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/attendance`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setRecords(data);
      } catch (error) {
        console.error("Fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleExpand = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Attendance Records
      </h2>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b">#</th>
                <th className="px-4 py-3 border-b text-left">User ID</th>
                <th className="px-4 py-3 border-b text-left">Status</th>
                <th className="px-4 py-3 border-b text-left">Timestamp</th>
                <th className="px-4 py-3 border-b text-left">Absent Times</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, index) => (
                <React.Fragment key={index}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border-b">{rec.userId}</td>
                    <td
                      className={`px-4 py-2 border-b font-medium ${
                        rec.status === "Present"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {rec.status}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-700">
                      {new Date(rec.timestamp).toLocaleString()}
                    </td>
                    <td
                      className="px-4 py-2 border-b text-blue-600 cursor-pointer"
                      onClick={() => toggleExpand(index)}
                    >
                      {rec.absentTimestamps?.length
                        ? expandedRows[index]
                          ? "Hide Times ▲"
                          : "Show Times ▼"
                        : "—"}
                    </td>
                  </tr>

                  {expandedRows[index] && rec.absentTimestamps?.length > 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-2 border-b bg-gray-50 text-sm"
                      >
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          {rec.absentTimestamps.map((ts, i) => (
                            <li key={i}>{new Date(ts).toLocaleString()}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {records.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-4 text-center text-gray-500"
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
