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
      const res = await fetch("https://projectcoursebuilder-1.onrender.com/api/upload-pdf", {
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

          {/* Goodness Score */}
          <div className="mt-10 flex flex-col items-center">
            
            

            {/* Optional debug info */}
            {lastResponse && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-center w-full">
                Last response:{" "}
                {lastResponse.success ? "✅ Success" : "❌ Failed"} <br />
                Goodness: {lastResponse.goodnessScore} <br />
                Courses processed: {lastResponse.coursesCount}
              </div>
            )}
          </div>

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
