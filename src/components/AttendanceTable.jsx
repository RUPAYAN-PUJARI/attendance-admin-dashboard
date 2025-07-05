import React, { useEffect, useState } from "react";

export default function AttendanceTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [company, setCompany] = useState(
    () => localStorage.getItem("selectedCompany") || ""
  );
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [alt, setAlt] = useState("");

  const fetchData = async (companyName) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/attendance/${companyName}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error("Fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company) {
      fetchData(company);
    }
  }, [company]);

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

    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]) - new Date(a[0])
    );
  };

  const handleCreateDashboard = async (e) => {
    e.preventDefault();
    if (!company || !lat || !lon) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/company`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: company.trim(),
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          altitude: parseFloat(alt) || 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to create company");

      localStorage.setItem("selectedCompany", company.trim());
      fetchData(company.trim());
    } catch (error) {
      console.error("Company creation failed:", error.message);
    }
  };

  const clearCompany = () => {
    localStorage.removeItem("selectedCompany");
    setCompany("");
    setLat("");
    setLon("");
    setAlt("");
    setRecords([]);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Attendance Dashboard
      </h2>

      {!localStorage.getItem("selectedCompany") ? (
        <form
          onSubmit={handleCreateDashboard}
          className="bg-white shadow-md rounded p-6 mb-6 border border-gray-200 max-w-xl"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Altitude (optional)"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Dashboard
          </button>
        </form>
      ) : (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Viewing: <span className="text-blue-600">{company}</span>
          </h3>
          <button
            onClick={clearCompany}
            className="text-sm text-blue-600 hover:underline"
          >
            Switch Company
          </button>
        </div>
      )}

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
