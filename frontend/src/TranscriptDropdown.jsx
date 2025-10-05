import React, { useState } from "react";

export default function TranscriptDropdown() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const MAX_SIZE_MB = 5;

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleFileSelect(e) {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  }

  function handleFile(file) {
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      alert(`File size exceeds ${MAX_SIZE_MB} MB.`);
      return;
    }

    // Add the new file to the list
    setFiles((prev) => [...prev, file]);
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start w-full min-h-screen gap-6 p-6">
      {/* Drag-and-drop box */}
      <div className="flex justify-center items-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center border-4 border-dashed rounded-xl cursor-pointer
            w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 transition-all duration-300
            ${isDragging ? "border-blue-500 bg-blue-50 shadow-lg" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"}`}
        >
          {files.length > 0 ? (
            <p className="text-gray-700 font-medium text-center">{files[files.length - 1].name}</p>
          ) : (
            <>
              <p className="text-gray-400 font-semibold mb-2 text-center">Drag & drop a PDF file here</p>
              <p className="text-gray-400 text-sm text-center">
                or click to select a file (max {MAX_SIZE_MB} MB)
              </p>
            </>
          )}
        </label>
      </div>

      {/* File list on the right */}
      <div className="flex flex-col w-full max-w-sm bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Uploaded Files</h2>
        {files.length === 0 ? (
          <p className="text-gray-400 text-sm">No files uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file, idx) => (
              <li key={idx} className="text-gray-700 bg-white p-2 rounded border border-gray-200">
                {file.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}




