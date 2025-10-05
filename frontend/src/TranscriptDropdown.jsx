import  { useState, useEffect } from "react";
import axios from "axios";

export default function TranscriptDropdown() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(""); // notification text
  const MAX_SIZE_MB = 5;

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000); // hide after 3s
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      setNotification("Please upload a PDF file.");
      return;
    }

    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      setNotification(`File size exceeds ${MAX_SIZE_MB} MB.`);
      return;
    }

    setFiles([file]);
    setNotification("File added!");
  }

  async function handleUpload() {
    if (!files.length) {
      setNotification("No file to upload.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", files[0]);

      const res = await axios.post("/api/pdf/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setNotification("PDF uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      setNotification("Failed to upload PDF.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start w-full min-h-screen gap-6 p-6">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 opacity-100">
          {notification}
        </div>
      )}

      <div className="flex flex-col items-center">
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
            ${
              isDragging
                ? "border-blue-500 bg-blue-50 shadow-lg"
                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
            }`}
        >
          {files.length > 0 ? (
            <p className="text-gray-700 font-medium text-center">
              {files[0].name}
            </p>
          ) : (
            <>
              <p className="text-gray-400 font-semibold mb-2 text-center">
                Drag & drop a PDF file here
              </p>
              <p className="text-gray-400 text-sm text-center">
                or click to select a file (max {MAX_SIZE_MB} MB)
              </p>
            </>
          )}
        </label>

        <button
          onClick={handleUpload}
          disabled={uploading || !files.length}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      <div className="flex flex-col w-full max-w-sm bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Uploaded File</h2>
        {files.length === 0 ? (
          <p className="text-gray-400 text-sm">No files uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file, idx) => (
              <li
                key={idx}
                className="text-gray-700 bg-white p-2 rounded border border-gray-200"
              >
                {file.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
