import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

export default function Slider() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setMessage("");
    setIsLoading(true);
    setLoadingProgress(0);

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    setTimeout(() => {
      setIsLoading(false);
      setLoadingProgress(0);
      setMessages((prev) => [
        ...prev,
        {
          text: "Here are some recommended courses based on your query!",
          sender: "bot",
        },
      ]);
    }, 1200);
  };

  const CircleLoader = ({ percent }) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width="40" height="40" className="transform -rotate-90">
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="#DBEAFE"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="#3B82F6"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
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
            className="absolute right-0 top-0 h-full bg-white shadow-2xl flex"
            style={{ width: "30vw", minWidth: "320px" }}
          >
            <div className="flex-1 flex flex-col">
              <div className="p-4 bg-blue-500 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="font-semibold">Course Assistant</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-blue-50">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-8">
                    <p className="text-sm">Ask me anything about courses!</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 shadow-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                      <CircleLoader percent={loadingProgress} />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-4 border-t border-blue-100 bg-white">
                <div className="flex gap-2">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-6 rounded-l-2xl shadow-lg hover:bg-blue-600 transition-colors"
        style={{ transformOrigin: "right center" }}
      >
        <div className="flex flex-col items-center gap-1">
          <MessageCircle className="w-5 h-5" />
          <span
            className="text-xs font-medium writing-mode-vertical"
            style={{ writingMode: "vertical-rl" }}
          >
            Recommended
          </span>
        </div>
      </motion.button>
    </div>
  );
}
