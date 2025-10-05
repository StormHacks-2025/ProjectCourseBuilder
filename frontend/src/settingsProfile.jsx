import React, { useState } from "react";

export default function SettingsProfile() {
  const [profilePic, setProfilePic] = useState(null);
  const [major, setMajor] = useState("");
  const [completedUnits, setCompletedUnits] = useState(0);
  const totalUnits = 120; // Example total units for a degree

  // Handle profile picture upload
  function handlePicUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    setProfilePic(URL.createObjectURL(file));
  }

  // Example majors
  const majors = ["Computer Science", "Engineering", "Biology", "Business", "Psychology"];

  return (
    <div className="bg-white rounded-xl p-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Profile picture */}
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center hover:shadow-lg transition-shadow">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">No picture</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePicUpload}
            className="hidden"
            id="profilePicInput"
          />
          <label
            htmlFor="profilePicInput"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Upload Picture
          </label>
        </div>

        {/* Profile info */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          {/* Modern Major selection */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Major</label>
            <div className="relative w-full max-w-sm">
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="block w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select your major</option>
                {majors.map((m, idx) => (
                  <option key={idx} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {/* Custom arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Degree progress */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Degree Progress</label>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-blue-600 h-6 transition-all duration-500"
                style={{ width: `${(completedUnits / totalUnits) * 100}%` }}
              />
            </div>
            <p className="text-gray-600 mt-1">
              {completedUnits} / {totalUnits} units completed
            </p>

            <input
              type="number"
              min="0"
              max={totalUnits}
              value={completedUnits}
              onChange={(e) => setCompletedUnits(Number(e.target.value))}
              className="mt-2 border border-gray-300 rounded-lg p-1 w-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

