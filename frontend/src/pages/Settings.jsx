import React, { useState } from "react";
import TranscriptDropdown from "../TranscriptDropdown";
import SettingsProfile from "../settingsProfile";
import { FaFilePdf } from "react-icons/fa";

export default function Settings({ userEmail }) {
  const transcriptFiles = [
    "Transcript1.pdf",
    "Transcript2.pdf",
    "Transcript3.pdf",
  ];
  const [goodnessScore, setGoodnessScore] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  const handlePDFUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("https://projectcoursebuilder-1.onrender.com/api/pdf/upload", {
        method: "POST",
        headers: { "x-user-email": userEmail },
        body: formData,
      });
      const data = await res.json();
      setLastResponse(data);

      if (data.success) {
        const displayScore = Number(data.goodnessScore ?? 0) * 100;
        console.log("Setting Goodness Score:", displayScore);
        setGoodnessScore(displayScore);
      } else {
        setGoodnessScore(50); // fallback
      }
    } catch (err) {
      console.error("Upload error:", err);
      setGoodnessScore(25); // network error fallback
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Title */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account details and academic information.
          </p>
        </div>

        {/* Profile */}
        <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
          <SettingsProfile />

          {/* Goodness Score Display */}
          {goodnessScore > 0 && (
            <div className="mt-10 flex flex-col items-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Transcript Quality Score
              </h3>
              <div className="relative w-full max-w-md">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out flex items-center justify-center"
                    style={{ width: `${goodnessScore}%` }}
                  >
                    <span className="text-white font-bold text-sm">
                      {goodnessScore.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Score Description */}
                <p className="text-center text-gray-600 mt-3">
                  {goodnessScore >= 80 && "Excellent transcript quality!"}
                  {goodnessScore >= 60 && goodnessScore < 80 && "Good transcript quality"}
                  {goodnessScore >= 40 && goodnessScore < 60 && "Fair transcript quality"}
                  {goodnessScore < 40 && "Low transcript quality - consider uploading a clearer version"}
                </p>
              </div>
            </div>
          )}

          {/* Optional debug info */}
          {lastResponse && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-center w-full">
              Last response:{" "}
              {lastResponse.success ? "✅ Success" : "❌ Failed"} <br />
              Goodness: {lastResponse.goodnessScore} <br />
              Courses processed: {lastResponse.coursesCount}
            </div>
          )}

          {/* Transcript Upload */}
          <div className="mt-10">
            <div className="flex flex-col items-center mb-4 text-center gap-2">
              <p className="text-gray-700 flex items-center gap-2">
                <FaFilePdf className="text-red-500" />
                Add your transcript to help us personalize your course
                recommendations.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <TranscriptDropdown
                files={transcriptFiles}
                showPdfIcon
                onUpload={handlePDFUpload}
                uploading={uploading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
