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

  // Example majors (you can replace with your own list)
  const majors = ["Computer Science", "Engineering", "Biology", "Business", "Psychology"];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
      <p className="text-gray-600 mb-6">
        Update your profile information so we can tailor your experience.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Profile picture upload */}
        <div className="flex flex-col items-center">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-300 bg-gray-100 flex items-center justify-center mb-4">
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
            className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Upload Picture
          </label>
        </div>

        {/* Right: Major and degree progress */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Major selection */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Major</label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your major</option>
              {majors.map((m, idx) => (
                <option key={idx} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Degree progress */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Degree Progress</label>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-blue-500 h-6"
                style={{ width: `${(completedUnits / totalUnits) * 100}%` }}
              />
            </div>
            <p className="text-gray-600 mt-1">
              {completedUnits} / {totalUnits} units completed
            </p>

            {/* Optional: allow user to update completed units */}
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
