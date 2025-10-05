import React from "react";
import TranscriptDropdown from "../TranscriptDropdown";
import SettingsProfile from "../settingsProfile";
import { FaFilePdf } from "react-icons/fa"; // for PDF icon

export default function Settings() {
  const transcriptFiles = ["Transcript1.pdf", "Transcript2.pdf", "Transcript3.pdf"];
  const degreeProgress = 0; // example progress
  const totalUnits = 120;

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

        {/* Profile + Degree Progress with light purple-blue gradient */}
        <div
          className="p-6 rounded-2xl shadow-lg"
          style={{
            background: "linear-gradient(160deg, #f6f7ff, #e9ecff 65%, #f8f9ff 100%)",
          }}
        >
          <SettingsProfile />

          {/* Degree Progress */}
          <div className="mt-6 flex flex-col items-center w-full">
            <h2 className="text-xl font-bold mb-2 text-gray-900">Degree Progress</h2>
            <p className="text-gray-700 mb-2">
              {degreeProgress} / {totalUnits} units completed
            </p>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black"
                style={{ width: `${(degreeProgress / totalUnits) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Transcript Section */}
        <div>
          <div className="flex flex-col items-center mb-4">
            <p className="text-gray-700 mb-2 text-center flex items-center gap-2">
              <FaFilePdf className="text-red-500" />
              Add your transcript to help us personalize your course recommendations.
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <TranscriptDropdown files={transcriptFiles} showPdfIcon />
          </div>
        </div>
      </div>
    </div>
  );
}







