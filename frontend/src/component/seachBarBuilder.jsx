import { useState, useEffect } from "react";
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
  Users,
  TrendingDown,
} from "lucide-react";

const API_BASE = "https://projectcoursebuilder-1.onrender.com/api";

export const SearchBarBuilder = () => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [pinnedCourses, setPinnedCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("current");
  const [term, setTerm] = useState("current");
  const [userId] = useState("user-123"); // You'll want to get this from your auth system

  const [filters, setFilters] = useState({
    campus: [],
    days: [],
    hours: [],
    year: [],
    breadth: [],
    ratingSort: null,
    friendsSort: null,
  });

  // Fetch course stats from database
  const fetchCourseStats = async (courseId) => {
    try {
      const response = await fetch(
        `${API_BASE}/course-stats/stats/${courseId}/${userId}`
      );
      if (response.ok) {
        const stats = await response.json();
        return stats;
      }
    } catch (error) {
      console.error("Error fetching course stats:", error);
    }
    return { rating: 3.5, friendsCount: 0, dropPercent: 15 }; // Default values
  };

  // Find course ID in database based on department and number
  const findCourseId = async (department, courseNumber) => {
    try {
      const response = await fetch(
        `${API_BASE}/courses/find-id?department=${encodeURIComponent(
          department
        )}&number=${encodeURIComponent(courseNumber)}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.courseId;
      }
    } catch (error) {
      console.error("Error finding course ID:", error);
    }
    return null;
  };

  useEffect(() => {
    const fetchCourses = async () => {
      if (!search || search.length < 2) {
        setCourses([]);
        return;
      }

      setLoading(true);
      try {
        const currentYear = year || "current";
        const currentTerm = term || "current";

        const response = await fetch(
          `${API_BASE}/courses/search/${currentYear}/${currentTerm}?q=${encodeURIComponent(
            search
          )}`
        );

        if (!response.ok) {
          console.error(`Fetch failed with status: ${response.status}`);
          setCourses([]);
          return;
        }

        const data = await response.json();

        // Transform courses and fetch stats for each
        const transformedCourses = await Promise.all(
          data.map(async (course) => {
            const courseId = await findCourseId(
              course.department,
              course.value
            );
            let stats = { rating: 3.5, friendsCount: 0, dropPercent: 15 };

            if (courseId) {
              stats = await fetchCourseStats(courseId);
            }

            return {
              id: courseId,
              title: `${course.department?.toUpperCase()} ${course.value}`,
              fullTitle: course.title,
              level:
                course.value >= 400
                  ? "Advanced"
                  : course.value >= 200
                  ? "Intermediate"
                  : "Beginner",
              department: course.department,
              courseNumber: course.value,
              days: ["Mon", "Wed"], // Will be updated in handleSelect
              hours: "TBD",
              prof: "TBD",
              rating: stats.rating,
              prereqs: [],
              campus: "Burnaby",
              year:
                course.value >= 400
                  ? "4th Year"
                  : course.value >= 300
                  ? "3rd Year"
                  : course.value >= 200
                  ? "2nd Year"
                  : "1st Year",
              breadth: "B-Sci",
              friendsInCourse: stats.friendsCount,
              dropPercent: stats.dropPercent,
              variations: [],
            };
          })
        );

        setCourses(transformedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCourses, 300);
    return () => clearTimeout(debounce);
  }, [search, year, term, userId]);

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
    let result = courses;

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

  const filteredCourses = getFilteredAndSortedCourses().slice(0, 4);

  const handleSelect = async (course) => {
    setSelectedCourse({ ...course, loading: true });

    try {
      const sectionsResponse = await fetch(
        `${API_BASE}/courses/sections/${year}/${term}/${course.department}/${course.courseNumber}`
      );

      if (!sectionsResponse.ok) {
        setSelectedCourse(course);
        return;
      }

      const sections = await sectionsResponse.json();
      const enrollmentSections = sections.filter((s) => s.classType === "e");

      if (enrollmentSections.length === 0) {
        setSelectedCourse({ ...course, sections });
        return;
      }

      // Fetch outline for first section to get schedule details
      const firstSection = enrollmentSections[0];
      const outlineResponse = await fetch(
        `${API_BASE}/courses/outline/${year}/${term}/${course.department}/${course.courseNumber}/${firstSection.value}`
      );

      if (outlineResponse.ok) {
        const outline = await outlineResponse.json();

        const instructor = outline.instructor?.[0];
        const schedules = outline.courseSchedule || [];

        // Convert schedule data to variations format
        const variations = schedules
          .map((schedule) => {
            const daysMap = {
              Mo: "Mon",
              Tu: "Tue",
              We: "Wed",
              Th: "Thu",
              Fr: "Fri",
            };
            const daysString = schedule.days || "";
            const days = [];

            for (let i = 0; i < daysString.length; i += 2) {
              const dayCode = daysString.substr(i, 2);
              if (daysMap[dayCode]) days.push(daysMap[dayCode]);
            }

            const parseTime = (timeStr) => {
              if (!timeStr) return 0;
              const [hours, minutes] = timeStr.split(":").map(Number);
              return hours + minutes / 60;
            };

            const startHour = parseTime(schedule.startTime);
            const endHour = parseTime(schedule.endTime);

            return days.map((day) => ({
              day,
              startHour,
              endHour,
            }));
          })
          .filter((v) => v.length > 0);

        if (variations.length === 0) {
          variations.push([{ day: "Mon", startHour: 9, endHour: 10.5 }]);
        }

        const enrichedCourse = {
          ...course,
          sections: enrollmentSections,
          prof: instructor?.name || "TBD",
          days: schedules[0]?.days
            ? (() => {
                const daysMap = {
                  Mo: "Mon",
                  Tu: "Tue",
                  We: "Wed",
                  Th: "Thu",
                  Fr: "Fri",
                };
                const daysString = schedules[0].days;
                const days = [];
                for (let i = 0; i < daysString.length; i += 2) {
                  const dayCode = daysString.substr(i, 2);
                  if (daysMap[dayCode]) days.push(daysMap[dayCode]);
                }
                return days;
              })()
            : ["TBD"],
          hours:
            schedules[0]?.startTime && schedules[0]?.endTime
              ? `${schedules[0].startTime} - ${schedules[0].endTime}`
              : "TBD",
          campus: schedules[0]?.campus || "TBD",
          prereqs: outline.info?.prerequisites
            ? [outline.info.prerequisites]
            : [],
          description: outline.info?.description || "",
          breadth: outline.info?.designation || "N/A",
          units: outline.info?.units || "3",
          variations: variations,
          loading: false,
        };

        setSelectedCourse(enrichedCourse);
        setCourses((prevCourses) =>
          prevCourses.map((c) =>
            c.title === course.title ? enrichedCourse : c
          )
        );
      } else {
        setSelectedCourse({ ...course, sections, loading: false });
      }
    } catch (err) {
      console.error("Error fetching course details:", err);
      setSelectedCourse({ ...course, loading: false });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredCourses.length > 0)
      handleSelect(filteredCourses[0]);
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
      setPinnedCourses([...pinnedCourses, { ...course }]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "none";
  };

  const handleDrop = (e) => {
    e.preventDefault();
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
    <div
      className="relative w-full min-h-screen p-6 bg-white shadow-xl flex flex-col rounded-3xl"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="relative mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
          <input
            type="text"
            placeholder="Search courses (e.g., CMPT 120)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-4 py-3 bg-blue-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-700 placeholder-blue-300"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-2xl transition-colors ${
            showFilters
              ? "bg-blue-500 text-white"
              : "bg-blue-50 text-blue-500 hover:bg-blue-100"
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
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
                <button
                  onClick={() => handlePinCourse(course)}
                  className={`p-1 rounded ${
                    pinnedCourses.find((c) => c.title === course.title)
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveCourse(course.title)}
                  className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFilters && (
        <div className="mb-4 overflow-hidden">
          <div className="bg-blue-50 rounded-2xl p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Filter content remains the same */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">Filters</h4>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Campus</p>
              <div className="flex flex-wrap gap-2">
                {campusOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleFilter("campus", option)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.campus.includes(option)
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Days</p>
              <div className="flex flex-wrap gap-2">
                {daysOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleFilter("days", option)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.days.includes(option)
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Hours</p>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                {hoursOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleFilter("hours", option)}
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.hours.includes(option)
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Year</p>
              <div className="flex flex-wrap gap-2">
                {yearOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleFilter("year", option)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.year.includes(option)
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Breadth
              </p>
              <div className="flex flex-wrap gap-2">
                {breadthOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleFilter("breadth", option)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.breadth.includes(option)
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Sort by Rating
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortFilter("ratingSort", "asc")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.ratingSort === "asc"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                  Low to High
                </button>
                <button
                  onClick={() => setSortFilter("ratingSort", "desc")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.ratingSort === "desc"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                  High to Low
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Sort by Friends
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortFilter("friendsSort", "asc")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.friendsSort === "asc"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                  Fewer First
                </button>
                <button
                  onClick={() => setSortFilter("friendsSort", "desc")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.friendsSort === "desc"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                  More First
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {search.length === 0 ? (
          <div className="text-center py-12 text-blue-300">
            <p className="text-sm">Start typing to search courses</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course, idx) => (
            <div
              key={idx}
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
                    className={`flex items-center gap-1 text-xs ${
                      selectedCourse?.title === course.title
                        ? "text-blue-100"
                        : "text-gray-600"
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>{course.friendsInCourse} friends</span>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1 text-xs ${
                    selectedCourse?.title === course.title
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  <TrendingDown className="w-3 h-3" />
                  <span>{course.dropPercent}% drop rate</span>
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
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-blue-300">
            <p className="text-sm">No courses found</p>
          </div>
        )}
      </div>

      {selectedCourse && (
        <div className="border-t border-blue-100 pt-4">
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
            <div className="flex items-center gap-1 text-xs">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{selectedCourse.friendsInCourse} friends</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <TrendingDown className="w-4 h-4 text-blue-500" />
            <span>{selectedCourse.dropPercent}% drop rate</span>
          </div>

          <div className="text-xs text-gray-600 mb-3 space-y-1">
            <div>{selectedCourse.campus}</div>
            <div>{selectedCourse.breadth}</div>
            <div>{selectedCourse.year}</div>
            <div>{selectedCourse.hours}</div>
            {selectedCourse.fullTitle && (
              <div className="font-medium mt-2">{selectedCourse.fullTitle}</div>
            )}
          </div>

          <button
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
          </button>

          <div>
            <h4 className="font-semibold mb-2 text-gray-700">Prerequisites</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {selectedCourse.prereqs && selectedCourse.prereqs.length > 0 ? (
                selectedCourse.prereqs.map((pre, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-blue-50 rounded-xl text-gray-700 text-sm border border-blue-100"
                  >
                    {pre}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No prerequisites</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
