import { useState } from "react";
import {
  Search,
  Filter,
  Clock,
  User,
  Star,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SearchBarBuilder = () => {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    campus: [],
    days: [],
    hours: [],
    year: [],
    breadth: [],
    ratingSort: null,
    friendsSort: null,
  });

  const courses = [
    {
      title: "React Basics",
      level: "Beginner",
      days: ["Mon", "Wed"],
      hours: "9:00 AM - 10:30 AM",
      prof: "John Doe",
      rating: 4.5,
      prereqs: ["HTML Basics", "CSS Basics"],
      campus: "Burnaby",
      year: "2nd Year",
      breadth: "B-Hum",
      friendsInCourse: 3,
    },
    {
      title: "Advanced JS",
      level: "Advanced",
      days: ["Tue", "Thu"],
      hours: "2:00 PM - 3:30 PM",
      prof: "Jane Smith",
      rating: 4.8,
      prereqs: ["JS Basics", "React Basics"],
      campus: "Surrey",
      year: "3rd Year",
      breadth: "B-Sci",
      friendsInCourse: 1,
    },
    {
      title: "Tailwind CSS",
      level: "Intermediate",
      days: ["Mon", "Wed", "Fri"],
      hours: "11:00 AM - 12:00 PM",
      prof: "Alice Lee",
      rating: 4.7,
      prereqs: ["CSS Basics"],
      campus: "Online",
      year: "2nd Year",
      breadth: "B-Soc",
      friendsInCourse: 5,
    },
    {
      title: "Node.js API",
      level: "Intermediate",
      days: ["Tue", "Thu"],
      hours: "4:00 PM - 5:30 PM",
      prof: "Bob Brown",
      rating: 4.6,
      prereqs: ["JS Basics", "Express Basics"],
      campus: "Burnaby",
      year: "3rd Year",
      breadth: "B-Sci",
      friendsInCourse: 2,
    },
    {
      title: "Python Basics",
      level: "Beginner",
      days: ["Mon", "Wed"],
      hours: "10:00 AM - 11:30 AM",
      prof: "Sarah Wilson",
      rating: 4.9,
      prereqs: [],
      campus: "Surrey",
      year: "1st Year",
      breadth: "B-Hum",
      friendsInCourse: 7,
    },
    {
      title: "Data Structures",
      level: "Intermediate",
      days: ["Tue", "Thu"],
      hours: "1:00 PM - 2:30 PM",
      prof: "Mike Chen",
      rating: 4.4,
      prereqs: ["Python Basics"],
      campus: "Online",
      year: "2nd Year",
      breadth: "B-Sci",
      friendsInCourse: 4,
    },
  ];

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const setSortFilter = (category, direction) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category] === direction ? null : direction,
    }));
  };

  const getFilteredAndSortedCourses = () => {
    let result = courses.filter((course) =>
      course.title.toLowerCase().includes(search.toLowerCase())
    );

    if (filters.campus.length > 0) {
      result = result.filter((c) => filters.campus.includes(c.campus));
    }
    if (filters.days.length > 0) {
      result = result.filter((c) =>
        filters.days.some((day) => c.days.includes(day))
      );
    }
    if (filters.hours.length > 0) {
      result = result.filter((c) => filters.hours.includes(c.hours));
    }
    if (filters.year.length > 0) {
      result = result.filter((c) => filters.year.includes(c.year));
    }
    if (filters.breadth.length > 0) {
      result = result.filter((c) => filters.breadth.includes(c.breadth));
    }

    if (filters.ratingSort === "asc") {
      result.sort((a, b) => a.rating - b.rating);
    } else if (filters.ratingSort === "desc") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (filters.friendsSort === "asc") {
      result.sort((a, b) => a.friendsInCourse - b.friendsInCourse);
    } else if (filters.friendsSort === "desc") {
      result.sort((a, b) => b.friendsInCourse - a.friendsInCourse);
    }

    return result;
  };

  const filteredCourses = getFilteredAndSortedCourses();

  const handleSelect = (course) => setSelectedCourse(course);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredCourses.length > 0)
      setSelectedCourse(filteredCourses[0]);
  };

  const campusOptions = ["Burnaby", "Surrey", "Online"];
  const daysOptions = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const hoursOptions = [
    "9:00 AM - 10:30 AM",
    "10:00 AM - 11:30 AM",
    "11:00 AM - 12:00 PM",
    "1:00 PM - 2:30 PM",
    "2:00 PM - 3:30 PM",
    "4:00 PM - 5:30 PM",
  ];
  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const breadthOptions = ["B-Hum", "B-Sci", "B-Soc"];

  return (
    <div className="relative w-96 min-h-screen p-6 bg-white shadow-xl flex flex-col rounded-3xl">
      <div className="relative mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-4 py-3 bg-blue-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-700 placeholder-blue-300"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-2xl transition-colors ${
            showFilters
              ? "bg-blue-500 text-white"
              : "bg-blue-50 text-blue-500 hover:bg-blue-100"
          }`}
        >
          <Filter className="w-5 h-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-blue-50 rounded-2xl p-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">Filters</h4>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Campus
                </p>
                <div className="flex flex-wrap gap-2">
                  {campusOptions.map((option) => (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter("campus", option)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filters.campus.includes(option)
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 hover:bg-blue-100"
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Days</p>
                <div className="flex flex-wrap gap-2">
                  {daysOptions.map((option) => (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter("days", option)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filters.days.includes(option)
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 hover:bg-blue-100"
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Hours
                </p>
                <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                  {hoursOptions.map((option) => (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleFilter("hours", option)}
                      className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.hours.includes(option)
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 hover:bg-blue-100"
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Year</p>
                <div className="flex flex-wrap gap-2">
                  {yearOptions.map((option) => (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter("year", option)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filters.year.includes(option)
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 hover:bg-blue-100"
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Breadth
                </p>
                <div className="flex flex-wrap gap-2">
                  {breadthOptions.map((option) => (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter("breadth", option)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filters.breadth.includes(option)
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 hover:bg-blue-100"
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Sort by Rating
                </p>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSortFilter("ratingSort", "asc")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.ratingSort === "asc"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    <ChevronUp className="w-4 h-4" />
                    Low to High
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSortFilter("ratingSort", "desc")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.ratingSort === "desc"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                    High to Low
                  </motion.button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Sort by Friends
                </p>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSortFilter("friendsSort", "asc")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.friendsSort === "asc"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    <ChevronUp className="w-4 h-4" />
                    Fewer First
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSortFilter("friendsSort", "desc")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.friendsSort === "desc"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                    More First
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {search.length === 0 ? (
          <div className="text-center py-12 text-blue-300">
            Start typing to search courses
          </div>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(course)}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                selectedCourse?.title === course.title
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-blue-50 hover:bg-blue-100 text-gray-700"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold">{course.title}</span>
                <span className="text-xs">{course.level}</span>
              </div>
              <div className="text-xs opacity-80">
                {course.days.join(", ")} • {course.hours}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-blue-300">
            No courses found
          </div>
        )}
      </div>

      {selectedCourse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-blue-100 pt-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xl text-gray-800">
              {selectedCourse.title}
            </h3>
            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
              {selectedCourse.level}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs">{selectedCourse.days.join(", ")}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-blue-500" />
              <span className="text-xs">{selectedCourse.prof}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
              <span className="text-xs">{selectedCourse.rating}</span>
            </div>
            <div className="text-xs">
              👥 {selectedCourse.friendsInCourse} friends
            </div>
          </div>

          <div className="text-xs text-gray-600 mb-3 space-y-1">
            <div>📍 {selectedCourse.campus}</div>
            <div>📚 {selectedCourse.breadth}</div>
            <div>🎓 {selectedCourse.year}</div>
            <div>⏰ {selectedCourse.hours}</div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 mb-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
          >
            Enroll Now
          </motion.button>

          <div>
            <h4 className="font-semibold mb-2 text-gray-700">Prerequisites</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {selectedCourse.prereqs.length > 0 ? (
                selectedCourse.prereqs.map((pre, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 bg-blue-50 rounded-xl text-gray-700 text-sm border border-blue-100"
                  >
                    {pre}
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No prerequisites</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
