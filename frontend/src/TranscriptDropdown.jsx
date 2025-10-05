import { useState, useEffect } from "react";
import axios from "axios";

export default function TranscriptDropdown() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState("");
  const [profile, setProfile] = useState(null);
  const [transcriptSet, setTranscriptSet] = useState(null);
  const [majorInput, setMajorInput] = useState("");
  const [photoInput, setPhotoInput] = useState("");
  const MAX_SIZE_MB = 5;

  // Fetch profile & transcript status on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user?.email) return;

    // Profile
    axios
      .get("/api/profile", { headers: { "x-user-email": user.email } })
      .then((res) => {
        setProfile(res.data.user);
        setMajorInput(res.data.user.major || "");
        setPhotoInput(res.data.user.profile_pic || "");
      })
      .catch(() => setProfile(null));

    // Transcript status
    axios
      .get("/api/transcripts", { params: { email: user.email } })
      .then((res) => setTranscriptSet(res.data.set))
      .catch(() => setTranscriptSet(null));
  }, []);

  // Auto-clear notifications
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleFileSelect(e) {
    handleFile(e.target.files[0]);
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
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user?.email) {
      setNotification("User email not found.");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pdf", files[0]);

      // Upload PDF
      const res = await axios.post("/api/pdf/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-user-email": user.email,
        },
      });

      if (res.data.success) {
        setNotification(
          `PDF uploaded successfully! ${res.data.coursesCount} courses saved.`
        );

        // Refresh transcript status
        const transcriptRes = await axios.get("/api/transcripts", {
          params: { email: user.email },
        });
        setTranscriptSet(transcriptRes.data.set);

        // Set default profile pic if none exists
        if (!profile?.profile_pic) {
          const defaultPic =
            "https://ui-avatars.com/api/?name=User&background=cccccc&color=ffffff";

          const photoRes = await axios.post("/api/profile/pic", {
            email: user.email,
            profile_pic: defaultPic,
          });

          if (photoRes.data.success) {
            setProfile((prev) => ({ ...prev, profile_pic: defaultPic }));
          }
        }
      }
    } catch (err) {
      console.error(err);
      setNotification("Failed to upload PDF.");
    } finally {
      setUploading(false);
    }
  }

  async function handleMajorUpdate() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!majorInput || !user?.email) return;

    try {
      await axios.post("/api/profile/major", {
        email: user.email,
        major: majorInput,
      });
      setNotification("Major updated!");
      setProfile((prev) => ({ ...prev, major: majorInput }));
    } catch {
      setNotification("Failed to update major.");
    }
  }

  async function handlePhotoUpdate() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!photoInput || !user?.email) return;

    try {
      await axios.post("/api/profile/pic", {
        email: user.email,
        profile_pic: photoInput,
      });
      setNotification("Profile photo updated!");
      setProfile((prev) => ({ ...prev, profile_pic: photoInput }));
    } catch {
      setNotification("Failed to update photo.");
    }
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start w-full min-h-screen gap-6 p-6">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          {notification}
        </div>
      )}

      {/* File Upload */}
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
          {files.length ? (
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

      {/* Profile & Transcript */}
      {profile && (
        <div className="flex flex-col w-full max-w-sm bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Profile Info</h2>
          <div className="flex items-center gap-3 mb-2">
            <img
              src={
                profile.profile_pic ||
                "https://ui-avatars.com/api/?name=User&background=cccccc&color=ffffff"
              }
              alt="Profile"
              className="w-10 h-10 rounded-full border"
            />
            <span>{profile.name}</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={photoInput}
              onChange={(e) => setPhotoInput(e.target.value)}
              placeholder="Profile pic URL"
              className="border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={handlePhotoUpdate}
              className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Update Photo
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={majorInput}
              onChange={(e) => setMajorInput(e.target.value)}
              placeholder="Major"
              className="border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={handleMajorUpdate}
              className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Update Major
            </button>
          </div>

          <div className="text-gray-700 text-sm mb-1">
            <strong>Major:</strong> {profile.major || "Not set"}
          </div>
          <div className="text-gray-700 text-sm mb-1">
            <strong>Transcript:</strong>{" "}
            {transcriptSet === null
              ? "Checking..."
              : transcriptSet
              ? "Set"
              : "Not set"}
          </div>
        </div>
      )}
    </div>
  );
}
