import React from "react";
import TranscriptDropdown from "../TranscriptDropdown";
import SettingsProfile from "../settingsProfile";

export default function Settings() {
  const transcriptFiles = ["Transcript1.pdf", "Transcript2.pdf", "Transcript3.pdf"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <SettingsProfile />
      <p className="text-gray-600 mb-6 text-center">
        Upload your transcript (PDF) so the app can tailor course recommendations based on your courses and grades.
      </p>
      <TranscriptDropdown files={transcriptFiles} />

      
    </div>
  );
}
