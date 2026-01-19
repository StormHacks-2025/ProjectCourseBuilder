import axios from "axios";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Clock,
  User,
  Star,
  Check,
  Trash2,
} from "lucide-react";

export const Slider = ({ onLoadCourses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState("chat");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [promptText, setPromptText] = useState("");
  const [finalSignal, setFinalSignal] = useState(false);

  const [courses, setCourses] = useState([]);

  const handleSend = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { text: message, sender: "user" }]);
    setMessage("");

    setStage("loading");
    setFinalSignal(false);
    setLoadingProgress(0);

    try {
      const response = await fetch(
        "https://projectcoursebuilder-1.onrender.com//api/generate-courses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPrompt: message,
            transcript: ["CMPT 102", "CMPT 125"],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);

      const recommendations = Array.isArray(data.recommendations)
        ? data.recommendations
        : [];

      if (recommendations.length === 0) {
        setMessages((prev) => [
          ...prev,
          { text: "No course recommendations found.", sender: "bot" },
        ]);
        setStage("chat");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { text: "Here are your recommended courses:", sender: "bot" },
      ]);

      const mappedCourses = recommendations.map((course) => ({
        title: course.title || "Untitled Course",
        fullTitle: course.fullTitle || "",
        level: course.level || "N/A",
        days: course.days || ["Mon", "Wed"],
        timeDisplay: course.timeDisplay || "TBD",
        prof: course.prof || "TBA",
        rating: course.rating || 0,
        campus: course.campus || "TBD",
        year: course.year || "N/A",
        breadth: course.breadth || "N/A",
        friendsInCourse: course.friendsInCourse || 0,
        variations: course.variations || [],
        department: course.department || "",
        courseNumber: course.courseNumber || "",
        sections: course.sections || [],
        prereqs: course.prereqs || [],
        description: course.description || "",
        units: course.units || "3",
        dropPercent: course.dropPercent || 15,
        keep: null,
      }));

      setCourses(mappedCourses);
      setStage("results");
      setFinalSignal(true);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setMessages((prev) => [
        ...prev,
        { text: "Failed to contact server.", sender: "bot" },
      ]);
      setStage("chat");
    }
  };

  useEffect(() => {
    if (stage === "loading" && finalSignal) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) {
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [stage, finalSignal]);

  const toggleKeep = (idx, action) => {
    setCourses((prev) =>
      prev.map((c, i) => {
        if (i === idx) {
          setPromptText(
            action ? "Added to Schedule ✅" : "Removed from Schedule ❌"
          );
          setTimeout(() => setPromptText(""), 1000);
          return { ...c, keep: action };
        }
        return c;
      })
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    setStage("chat");
    setMessages([]);
    setCourses((prev) => prev.map((c) => ({ ...c, keep: null })));
    setFinalSignal(false);
  };

  const handleLoadCourses = () => {
    const coursesToLoad = courses.filter((c) => c.keep === true);

    if (coursesToLoad.length === 0) {
      alert("Please select at least one course to add by clicking 'Keep'");
      return;
    }

    if (onLoadCourses) {
      onLoadCourses(coursesToLoad);
    }

    handleClose();
  };

  const CircleLoader = ({ percent }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" className="transform -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="#DBEAFE"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="#3B82F6"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <span className="absolute text-2xl font-bold text-blue-600">
          {Math.round(percent)}%
        </span>
      </div>
    );
  };

  return (
    <div className="fixed right-0 top-0 h-screen z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full bg-white shadow-2xl flex flex-col"
            style={{ width: "30vw", minWidth: "400px" }}
          >
            <div className="p-4 bg-blue-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">Course Recommendations</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-1 hover:bg-blue-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              {stage === "chat" && (
                <div className="flex flex-col flex-1">
                  <div className="flex-1 overflow-y-auto space-y-3 bg-blue-50 p-4 rounded-2xl">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-400 mt-8 text-sm">
                        Ask me for course recommendations!
                      </p>
                    ) : (
                      messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            msg.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl ${
                              msg.sender === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-700 shadow-sm"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 bg-blue-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-blue-300"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              )}

              {stage === "loading" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <CircleLoader percent={loadingProgress} />
                  <div className="text-center">
                    <p className="text-gray-700 font-medium mb-2">
                      Finding best courses for you...
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">
                      {loadingProgress < 30 && "Analyzing your transcript..."}
                      {loadingProgress >= 30 &&
                        loadingProgress < 60 &&
                        "Consulting AI advisor..."}
                      {loadingProgress >= 60 &&
                        loadingProgress < 90 &&
                        "Fetching course details..."}
                      {loadingProgress >= 90 && "Almost done..."}
                    </p>
                  </div>
                </div>
              )}

              {stage === "results" && finalSignal && (
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 relative">
                  <div className="mb-3 text-center text-gray-600 font-medium">
                    Based on your responses, these are the recommended courses:
                  </div>

                  <div className="flex-1 flex flex-col gap-3 pb-24 overflow-y-auto">
                    {courses.map((course, idx) => (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer
                                  ${
                                    course.keep === true
                                      ? "bg-green-50 border-green-400 shadow-md"
                                      : course.keep === false
                                      ? "bg-red-50 border-red-400 shadow-md opacity-60"
                                      : "bg-white border-blue-100 hover:border-blue-300 shadow-sm"
                                  }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-base text-gray-800">
                              {course.title}
                            </h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium inline-block mt-1">
                              {course.level}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            {course.days.join(", ")} • {course.timeDisplay}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />
                            {course.prof}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                              {course.rating}
                            </div>
                            <span className="text-xs">
                              👥 {course.friendsInCourse} friends
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleKeep(idx, true)}
                            disabled={course.keep === true}
                            className={`flex-1 py-2 rounded-xl font-medium flex items-center justify-center gap-2
                                         ${
                                           course.keep === true
                                             ? "bg-green-500 text-white cursor-not-allowed"
                                             : "bg-green-100 text-green-700 hover:bg-green-200"
                                         }`}
                          >
                            <Check className="w-4 h-4" />
                            {course.keep === true ? "Added" : "Keep"}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleKeep(idx, false)}
                            disabled={course.keep === false}
                            className={`flex-1 py-2 rounded-xl font-medium flex items-center justify-center gap-2
                                         ${
                                           course.keep === false
                                             ? "bg-red-500 text-white cursor-not-allowed"
                                             : "bg-red-100 text-red-700 hover:bg-red-200"
                                         }`}
                          >
                            <Trash2 className="w-4 h-4" />
                            {course.keep === false ? "Removed" : "Remove"}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="fixed bottom-4 left-0 right-0 px-4 flex gap-2 bg-gradient-to-t from-white via-white to-transparent pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLoadCourses}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-lg"
                    >
                      Load Courses
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        animate={{ x: isOpen ? "-30vw" : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-8 rounded-l-2xl shadow-lg hover:bg-blue-600 transition-colors"
      >
        <div className="flex flex-col items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span
            className="text-xs font-medium"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            Recommended
          </span>
        </div>
      </motion.button>
    </div>
  );
};
