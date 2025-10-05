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

export const  Slider =() => {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState("chat"); // chat | loading | results
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [promptText, setPromptText] = useState("");
  const [finalSignal, setFinalSignal] = useState(false); // only render results after true

  const [courses, setCourses] = useState([
    {
      title: "React Basics",
      level: "Beginner",
      days: ["Mon", "Wed"],
      timeDisplay: "9:00 AM - 10:30 AM",
      prof: "John Doe",
      rating: 4.5,
      campus: "Burnaby",
      year: "2nd Year",
      breadth: "B-Hum",
      friendsInCourse: 3,
      keep: null,
    },
    {
      title: "Advanced JS",
      level: "Advanced",
      days: ["Tue", "Thu"],
      timeDisplay: "2:00 PM - 3:30 PM",
      prof: "Jane Smith",
      rating: 4.8,
      campus: "Surrey",
      year: "3rd Year",
      breadth: "B-Sci",
      friendsInCourse: 1,
      keep: null,
    },
    {
      title: "Tailwind CSS",
      level: "Intermediate",
      days: ["Mon", "Wed", "Fri"],
      timeDisplay: "11:00 AM - 12:00 PM",
      prof: "Alice Lee",
      rating: 4.7,
      campus: "Online",
      year: "2nd Year",
      breadth: "B-Soc",
      friendsInCourse: 5,
      keep: null,
    },
    {
      title: "Node.js API",
      level: "Intermediate",
      days: ["Tue", "Thu"],
      timeDisplay: "4:00 PM - 5:30 PM",
      prof: "Bob Brown",
      rating: 4.6,
      campus: "Burnaby",
      year: "3rd Year",
      breadth: "B-Sci",
      friendsInCourse: 2,
      keep: null,
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

 
    setMessages((prev) => [...prev, { text: message, sender: "user" }]);
    setMessage("");

   
    const botAsksMore = Math.random() < 0.5;
    if (botAsksMore) {
      setMessages((prev) => [
        ...prev,
        { text: "Can you tell me your preferred campus?", sender: "bot" },
      ]);
      setStage("chat"); 
      setFinalSignal(false);
    } else {
      // final signal
      setStage("loading");
      setFinalSignal(true);
      setLoadingProgress(0);
    }
  };

  useEffect(() => {
    if (stage === "loading" && finalSignal) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStage("results");
            return 100;
          }
          return prev + 2;
        });
      }, 20);
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
          />
        </svg>
        <span className="absolute text-2xl font-bold text-blue-600">
          {percent}%
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
            {/* Header */}
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

              {stage === "loading" && finalSignal && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <CircleLoader percent={loadingProgress} />
                  <p className="text-gray-500 text-sm">
                    Finding best courses for you...
                  </p>
                </div>
              )}

              {stage === "results" && finalSignal && (
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 relative">
                  {/* Top info */}
                  <div className="mb-3 text-center text-gray-600 font-medium">
                    Based on your responses, these are the recommended courses:
                  </div>

                  {/* Courses */}
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

                        {/* Course info */}
                        <div className="space-y-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />{" "}
                            {course.days.join(", ")} • {course.timeDisplay}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />{" "}
                            {course.prof}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-blue-500 fill-blue-500" />{" "}
                              {course.rating}
                            </div>
                            <span className="text-xs">
                              👥 {course.friendsInCourse} friends
                            </span>
                          </div>
                        </div>

                        {/* Buttons */}
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
                            <Check className="w-4 h-4" />{" "}
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
                            <Trash2 className="w-4 h-4" />{" "}
                            {course.keep === false ? "Removed" : "Remove"}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom buttons */}
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
                      onClick={handleClose}
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

      {/* Fixed tab */}
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
}
