import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  FolderOpen,
  X,
} from "lucide-react";

const hours = Array.from({ length: 12 }, (_, i) => 8 + i);
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function WeeklySchedule({
  pinnedCourses = [],
  variableCourses = [],
  selectedCourses = [],
  setSelectedCourses,
  setPinnedCourses,
  setCurrentScheduleIndex: setParentScheduleIndex,
  setAllSchedules: setParentAllSchedules,
}) {
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  const [allSchedules, setAllSchedules] = useState([]);
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [showSavedSchedules, setShowSavedSchedules] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [scheduleToLoad, setScheduleToLoad] = useState(null);

  const hasConflict = (slots1, slots2) => {
    for (let s1 of slots1) {
      for (let s2 of slots2) {
        if (s1.day === s2.day) {
          if (
            (s1.startHour < s2.endHour && s1.endHour > s2.startHour) ||
            (s2.startHour < s1.endHour && s2.endHour > s1.startHour)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const generateSchedules = (courses, pinnedSlots) => {
    if (courses.length === 0) return [[]];

    const [first, ...rest] = courses;

    // Check if course has valid variations
    if (!first.variations || first.variations.length === 0) {
      console.warn(`Course ${first.title} has no valid variations`);
      return []; // Return empty if no variations
    }

    const restSchedules = generateSchedules(rest, pinnedSlots);
    const result = [];

    for (let variation of first.variations) {
      // Skip invalid variations
      if (!variation || variation.length === 0) continue;

      const conflictsWithPinned = hasConflict(variation, pinnedSlots);
      if (conflictsWithPinned) continue;

      if (restSchedules.length === 0) {
        // Base case: if no more courses, just add this variation
        result.push([variation]);
      } else {
        for (let restSchedule of restSchedules) {
          const allSlotsInRest = restSchedule.flat();
          const conflictsWithRest = hasConflict(variation, allSlotsInRest);

          if (!conflictsWithRest) {
            result.push([variation, ...restSchedule]);
          }
        }
      }
    }

    return result;
  };

  useEffect(() => {
    const pinnedSlots = pinnedCourses.flatMap(
      (c) => c.currentSlots || c.variations?.[0] || []
    );

    // Filter out courses without valid variations
    const validVariableCourses = variableCourses.filter(
      (c) => c.variations && c.variations.length > 0
    );

    if (validVariableCourses.length < variableCourses.length) {
      console.warn("Some courses are missing variation data");
    }

    const schedules = generateSchedules(validVariableCourses, pinnedSlots);
    setAllSchedules(schedules);
    setCurrentScheduleIndex(0);

    if (setParentScheduleIndex) setParentScheduleIndex(0);
    if (setParentAllSchedules) setParentAllSchedules(schedules);
  }, [variableCourses, pinnedCourses]);

  const currentEvents = useMemo(() => {
    const pinnedEvents = pinnedCourses.flatMap((course) =>
      (course.currentSlots || course.variations?.[0] || []).map((slot) => ({
        ...slot,
        title: course.title,
        isPinned: true,
      }))
    );

    if (allSchedules.length === 0 || !allSchedules[currentScheduleIndex]) {
      return pinnedEvents;
    }

    const variableEvents = allSchedules[currentScheduleIndex].flatMap(
      (variation, idx) =>
        variation.map((slot) => ({
          ...slot,
          title: variableCourses[idx]?.title || "Unknown",
          isPinned: false,
        }))
    );

    return [...pinnedEvents, ...variableEvents];
  }, [pinnedCourses, variableCourses, allSchedules, currentScheduleIndex]);

  const nextSchedule = () => {
    if (allSchedules.length > 0) {
      const newIndex = (currentScheduleIndex + 1) % allSchedules.length;
      setCurrentScheduleIndex(newIndex);
      if (setParentScheduleIndex) setParentScheduleIndex(newIndex);
    }
  };

  const prevSchedule = () => {
    if (allSchedules.length > 0) {
      const newIndex =
        (currentScheduleIndex - 1 + allSchedules.length) % allSchedules.length;
      setCurrentScheduleIndex(newIndex);
      if (setParentScheduleIndex) setParentScheduleIndex(newIndex);
    }
  };

  const handleSaveSchedule = () => {
    const scheduleData = {
      id: Date.now(),
      name: `Schedule ${savedSchedules.length + 1}`,
      timestamp: new Date().toLocaleString(),
      pinnedCourses: pinnedCourses,
      selectedCourses: selectedCourses,
      currentScheduleIndex: currentScheduleIndex,
      events: currentEvents,
    };
    setSavedSchedules([...savedSchedules, scheduleData]);
  };

  const handleLoadSchedule = (schedule) => {
    if (selectedCourses.length > 0 || pinnedCourses.length > 0) {
      setScheduleToLoad(schedule);
      setShowSavedSchedules(false);
      setShowSaveConfirm(true);
    } else {
      loadSchedule(schedule);
    }
  };

  const loadSchedule = (schedule) => {
    setSelectedCourses(schedule.selectedCourses);
    setPinnedCourses(schedule.pinnedCourses);
    setCurrentScheduleIndex(schedule.currentScheduleIndex || 0);
    setShowSavedSchedules(false);
    setShowSaveConfirm(false);
    setScheduleToLoad(null);
  };

  const handleClear = () => {
    setSelectedCourses([]);
    setPinnedCourses([]);
    setShowClearConfirm(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const courseData = e.dataTransfer.getData("course");
    if (!courseData) return;

    try {
      const course = JSON.parse(courseData);

      // Check if already enrolled
      if (selectedCourses.find((c) => c.title === course.title)) {
        alert(`${course.title} is already enrolled`);
        return;
      }

      // Check if course has valid variations
      if (!course.variations || course.variations.length === 0) {
        alert(
          `${course.title} doesn't have schedule data yet. Please click on it first to load the schedule information.`
        );
        return;
      }

      const pinnedSlots = pinnedCourses.flatMap(
        (c) => c.currentSlots || c.variations?.[0] || []
      );
      const existingSlots = currentEvents.map((e) => ({
        day: e.day,
        startHour: e.startHour,
        endHour: e.endHour,
      }));

      // Check if any variation works
      let hasValidVariation = false;
      for (let variation of course.variations) {
        const conflicts = hasConflict(variation, [
          ...pinnedSlots,
          ...existingSlots,
        ]);
        if (!conflicts) {
          hasValidVariation = true;
          break;
        }
      }

      if (hasValidVariation) {
        setSelectedCourses([...selectedCourses, course]);
      } else {
        alert(
          `Cannot add ${course.title} - all time slots conflict with existing courses`
        );
      }
    } catch (err) {
      console.error("Drop error:", err);
      alert("Error adding course. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-3xl shadow-xl relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Weekly Schedule</h2>
        <div className="flex items-center gap-3">
          {allSchedules.length > 1 && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
              <span className="text-sm font-medium text-gray-700">
                Variation
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSchedule}
                className="p-2 bg-white rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-blue-600" />
              </motion.button>
              <span className="text-sm font-semibold text-blue-600 min-w-[50px] text-center">
                {currentScheduleIndex + 1} / {allSchedules.length}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSchedule}
                className="p-2 bg-white rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </motion.button>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSavedSchedules(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            <FolderOpen className="w-5 h-5" />
            Saved ({savedSchedules.length})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveSchedule}
            disabled={currentEvents.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Save
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowClearConfirm(true)}
            disabled={currentEvents.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            Clear
          </motion.button>
        </div>
      </div>

      <div
        className="overflow-x-auto border-2 border-gray-200 rounded-2xl"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="min-w-full">
          <div className="grid grid-cols-6 bg-blue-50 border-b-2 border-gray-200">
            <div className="p-3 font-semibold text-gray-600 border-r border-gray-200 w-20">
              Time
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="p-3 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-6">
            <div className="flex flex-col border-r border-gray-200 w-20">
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-16 px-2 py-1 text-xs text-gray-600 border-b border-gray-100 flex items-center"
                >
                  {h}:00
                </div>
              ))}
            </div>

            {days.map((day) => (
              <div
                key={day}
                className="relative border-r border-gray-200 last:border-r-0"
              >
                {hours.map((h) => (
                  <div key={h} className="h-16 border-b border-gray-100" />
                ))}

                {currentEvents
                  .filter((c) => c.day === day)
                  .map((course, idx) => (
                    <motion.div
                      key={`${course.title}-${idx}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`absolute left-1 right-1 rounded-xl p-2 text-white text-xs font-semibold shadow-lg ${
                        course.isPinned
                          ? "bg-gradient-to-br from-purple-500 to-purple-600 ring-2 ring-purple-300"
                          : "bg-gradient-to-br from-blue-500 to-blue-600"
                      }`}
                      style={{
                        top: (course.startHour - 8) * 64 + 4,
                        height: (course.endHour - course.startHour) * 64 - 8,
                      }}
                    >
                      <div className="flex flex-col h-full justify-center">
                        <div className="font-bold">{course.title}</div>
                        <div className="text-xs opacity-90">
                          {Math.floor(course.startHour)}:
                          {String(
                            Math.round((course.startHour % 1) * 60)
                          ).padStart(2, "0")}{" "}
                          - {Math.floor(course.endHour)}:
                          {String(
                            Math.round((course.endHour % 1) * 60)
                          ).padStart(2, "0")}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {pinnedCourses.length === 0 && variableCourses.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No courses enrolled yet. Start searching and enrolling courses!</p>
          <p className="text-sm mt-2">
            Drag and drop courses here or click Enroll Now
          </p>
        </div>
      )}

      {allSchedules.length === 0 && variableCourses.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm font-medium">
            No valid schedule found - all course combinations have time
            conflicts
          </p>
        </div>
      )}

      {/* Rest of modals remain the same... */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Clear Schedule?
              </h3>
              <p className="text-gray-600 mb-6">
                This will remove all courses from your schedule. This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSaveConfirm && scheduleToLoad && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSaveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Save Current Schedule?
              </h3>
              <p className="text-gray-600 mb-6">
                You have an unsaved schedule. Do you want to save it before
                loading another?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSaveConfirm(false);
                    setScheduleToLoad(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => loadSchedule(scheduleToLoad)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Don't Save
                </button>
                <button
                  onClick={() => {
                    handleSaveSchedule();
                    loadSchedule(scheduleToLoad);
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  Save & Load
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSavedSchedules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setShowSavedSchedules(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Saved Schedules
                </h3>
                <button
                  onClick={() => setShowSavedSchedules(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {savedSchedules.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No saved schedules yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => handleLoadSchedule(schedule)}
                    >
                      <h4 className="font-bold text-lg text-gray-800 mb-1">
                        {schedule.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-3">
                        {schedule.timestamp}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          {schedule.selectedCourses.length} courses
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {schedule.events.slice(0, 4).map((event, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                            >
                              {event.title}
                            </span>
                          ))}
                          {schedule.events.length > 4 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              +{schedule.events.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
