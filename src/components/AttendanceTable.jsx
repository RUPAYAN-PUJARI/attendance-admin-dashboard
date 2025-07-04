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

  const groupByDate = (timestamps) => {
    const grouped = {};

    timestamps.forEach((ts) => {
      const dateObj = new Date(ts);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(time);
    });

    // Sort the dates in descending order
    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]) - new Date(a[0])
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Attendance Records
      </h2>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b">#</th>
                <th className="px-4 py-3 border-b text-left">User ID</th>
                <th className="px-4 py-3 border-b text-left">Status</th>
                <th className="px-4 py-3 border-b text-left">Last Ping</th>
                <th className="px-4 py-3 border-b text-left">Absent Times</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, index) => (
                <React.Fragment key={index}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 border-b text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border-b font-medium text-gray-800">
                      {rec.userId}
                    </td>
                    <td
                      className={`px-4 py-2 border-b font-semibold ${
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
                      className="px-4 py-2 border-b text-blue-600 cursor-pointer hover:underline"
                      onClick={() => toggleExpand(index)}
                    >
                      {rec.absentTimestamps?.length
                        ? expandedRows[index]
                          ? "Hide ▲"
                          : "Show ▼"
                        : "—"}
                    </td>
                  </tr>

                  {expandedRows[index] && rec.absentTimestamps?.length > 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-50 border-b">
                        <div className="space-y-6">
                          {groupByDate(rec.absentTimestamps).map(
                            ([date, times], i) => (
                              <div key={i}>
                                <div className="font-semibold text-gray-700 mb-2">
                                  {date}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {times.map((time, j) => (
                                    <span
                                      key={j}
                                      className="bg-white border border-gray-300 text-gray-800 px-3 py-1 rounded shadow-sm"
                                    >
                                      {time}
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
