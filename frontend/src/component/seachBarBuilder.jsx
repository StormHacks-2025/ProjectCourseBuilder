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
  Pin,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SearchBarBuilder = ({
  selectedCourses,
  setSelectedCourses,
  pinnedCourses,
  setPinnedCourses,
}) => {
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
      variations: [
        [
          { day: "Mon", startHour: 9, endHour: 10.5 },
          { day: "Wed", startHour: 9, endHour: 10.5 },
        ],
        [
          { day: "Tue", startHour: 14, endHour: 15.5 },
          { day: "Thu", startHour: 14, endHour: 15.5 },
        ],
        [{ day: "Fri", startHour: 10, endHour: 12 }],
      ],
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
      variations: [
        [
          { day: "Tue", startHour: 14, endHour: 15.5 },
          { day: "Thu", startHour: 14, endHour: 15.5 },
        ],
        [
          { day: "Mon", startHour: 11, endHour: 12.5 },
          { day: "Wed", startHour: 11, endHour: 12.5 },
        ],
        [{ day: "Fri", startHour: 13, endHour: 15.5 }],
      ],
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
      variations: [
        [
          { day: "Mon", startHour: 11, endHour: 12 },
          { day: "Wed", startHour: 11, endHour: 12 },
          { day: "Fri", startHour: 11, endHour: 12 },
        ],
        [
          { day: "Tue", startHour: 13, endHour: 14 },
          { day: "Thu", startHour: 13, endHour: 14 },
        ],
      ],
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
      variations: [
        [
          { day: "Tue", startHour: 16, endHour: 17.5 },
          { day: "Thu", startHour: 16, endHour: 17.5 },
        ],
        [
          { day: "Mon", startHour: 15, endHour: 16.5 },
          { day: "Wed", startHour: 15, endHour: 16.5 },
        ],
      ],
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
      variations: [
        [
          { day: "Mon", startHour: 10, endHour: 11.5 },
          { day: "Wed", startHour: 10, endHour: 11.5 },
        ],
        [
          { day: "Tue", startHour: 9, endHour: 10.5 },
          { day: "Thu", startHour: 9, endHour: 10.5 },
        ],
        [{ day: "Fri", startHour: 14, endHour: 16.5 }],
      ],
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
      variations: [
        [
          { day: "Tue", startHour: 13, endHour: 14.5 },
          { day: "Thu", startHour: 13, endHour: 14.5 },
        ],
        [
          { day: "Mon", startHour: 8, endHour: 9.5 },
          { day: "Wed", startHour: 8, endHour: 9.5 },
        ],
        [{ day: "Fri", startHour: 9, endHour: 11.5 }],
      ],
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

  const handleEnroll = () => {
    if (
      selectedCourse &&
      !selectedCourses.find((c) => c.title === selectedCourse.title)
    ) {
      setSelectedCourses([...selectedCourses, selectedCourse]);
    }
  };

  const handleRemoveCourse = (courseTitle) => {
    setSelectedCourses(selectedCourses.filter((c) => c.title !== courseTitle));
    setPinnedCourses(pinnedCourses.filter((c) => c.title !== courseTitle));
  };

  const handlePinCourse = (course) => {
    if (pinnedCourses.find((c) => c.title === course.title)) {
      setPinnedCourses(pinnedCourses.filter((c) => c.title !== course.title));
    } else {
      const courseWithCurrentSlots = { ...course };
      setPinnedCourses([...pinnedCourses, courseWithCurrentSlots]);
    }
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
    <div className="relative w-full min-h-screen p-6 bg-white shadow-xl flex flex-col rounded-3xl">
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

      {selectedCourses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Enrolled Courses
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedCourses.map((course, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
              >
                <span className="flex-1 text-sm font-medium">
                  {course.title}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePinCourse(course)}
                  className={`p-1 rounded ${
                    pinnedCourses.find((c) => c.title === course.title)
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveCourse(course.title)}
                  className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {search.length === 0 ? (
          <div className="text-center py-12 text-blue-300">
            <p className="text-sm">Start typing to search courses</p>
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
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("course", JSON.stringify(course));
                e.dataTransfer.effectAllowed = "copy";
              }}
              className={`p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-200 ${
                selectedCourse?.title === course.title
                  ? "bg-blue-500 text-white shadow-lg ring-2 ring-blue-400"
                  : "bg-blue-50 hover:bg-blue-100 text-gray-700"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-base">{course.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    selectedCourse?.title === course.title
                      ? "bg-white/20 text-white"
                      : "bg-blue-200 text-blue-700"
                  }`}
                >
                  {course.level}
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                <div
                  className={`flex items-center gap-2 ${
                    selectedCourse?.title === course.title
                      ? "text-blue-100"
                      : "text-gray-600"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    {course.days.join(", ")} • {course.hours}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    selectedCourse?.title === course.title
                      ? "text-blue-100"
                      : "text-gray-600"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{course.prof}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center gap-1 ${
                      selectedCourse?.title === course.title
                        ? "text-blue-100"
                        : "text-gray-600"
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                    <span>{course.rating}</span>
                  </div>

                  <div
                    className={`text-xs ${
                      selectedCourse?.title === course.title
                        ? "text-blue-100"
                        : "text-gray-600"
                    }`}
                  >
                    {course.friendsInCourse} friends
                  </div>
                </div>

                <div
                  className={`flex gap-2 text-xs pt-1 ${
                    selectedCourse?.title === course.title
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  <span
                    className={`px-2 py-0.5 rounded-md ${
                      selectedCourse?.title === course.title
                        ? "bg-white/20"
                        : "bg-blue-100"
                    }`}
                  >
                    {course.campus}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md ${
                      selectedCourse?.title === course.title
                        ? "bg-white/20"
                        : "bg-blue-100"
                    }`}
                  >
                    {course.breadth}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md ${
                      selectedCourse?.title === course.title
                        ? "bg-white/20"
                        : "bg-blue-100"
                    }`}
                  >
                    {course.year}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-blue-300">
            <p className="text-sm">No courses found</p>
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
              {selectedCourse.friendsInCourse} friends
            </div>
          </div>

          <div className="text-xs text-gray-600 mb-3 space-y-1">
            <div>{selectedCourse.campus}</div>
            <div>{selectedCourse.breadth}</div>
            <div>{selectedCourse.year}</div>
            <div>{selectedCourse.hours}</div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEnroll}
            disabled={selectedCourses.find(
              (c) => c.title === selectedCourse.title
            )}
            className={`w-full py-3 mb-4 rounded-xl font-medium transition-all duration-200 ${
              selectedCourses.find((c) => c.title === selectedCourse.title)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg"
            }`}
          >
            {selectedCourses.find((c) => c.title === selectedCourse.title)
              ? "Already Enrolled"
              : "Enroll Now"}
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
};
