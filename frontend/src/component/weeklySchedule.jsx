import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const hours = Array.from({ length: 12 }, (_, i) => 8 + i);
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function WeeklySchedule({
  pinnedCourses = [],
  variableCourses = [],
  selectedCourses = [],
  setSelectedCourses,
}) {
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  const [allSchedules, setAllSchedules] = useState([]);

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
    const restSchedules = generateSchedules(rest, pinnedSlots);
    const result = [];

    for (let variation of first.variations) {
      const conflictsWithPinned = hasConflict(variation, pinnedSlots);
      if (conflictsWithPinned) continue;

      for (let restSchedule of restSchedules) {
        const allSlotsInRest = restSchedule.flat();
        const conflictsWithRest = hasConflict(variation, allSlotsInRest);

        if (!conflictsWithRest) {
          result.push([variation, ...restSchedule]);
        }
      }
    }

    return result;
  };

  useEffect(() => {
    const pinnedSlots = pinnedCourses.flatMap((c) => c.variations[0]);
    const schedules = generateSchedules(variableCourses, pinnedSlots);
    setAllSchedules(schedules);
    setCurrentScheduleIndex(0);
  }, [variableCourses, pinnedCourses]);

  const currentEvents = useMemo(() => {
    const pinnedEvents = pinnedCourses.flatMap((course) =>
      course.variations[0].map((slot) => ({
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
      setCurrentScheduleIndex((prev) => (prev + 1) % allSchedules.length);
    }
  };

  const prevSchedule = () => {
    if (allSchedules.length > 0) {
      setCurrentScheduleIndex(
        (prev) => (prev - 1 + allSchedules.length) % allSchedules.length
      );
    }
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
      if (selectedCourses.find((c) => c.title === course.title)) return;

      const pinnedSlots = pinnedCourses.flatMap((c) => c.variations[0]);
      const existingSlots = currentEvents.map((e) => ({
        day: e.day,
        startHour: e.startHour,
        endHour: e.endHour,
      }));

      for (let variation of course.variations) {
        const conflicts = hasConflict(variation, [
          ...pinnedSlots,
          ...existingSlots,
        ]);
        if (!conflicts) {
          setSelectedCourses([...selectedCourses, course]);
          return;
        }
      }

      alert(
        `Cannot add ${course.title} - all time slots conflict with existing courses`
      );
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-3xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Weekly Schedule</h2>
        {allSchedules.length > 1 && (
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl">
            <span className="text-sm font-medium text-gray-700">
              Schedule Variation
            </span>
            <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      <div
        className="overflow-x-auto border-2 border-gray-200 rounded-2xl"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 bg-blue-50 border-b-2 border-gray-200">
            <div className="p-3 font-semibold text-gray-600 border-r border-gray-200">
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
            <div className="flex flex-col border-r border-gray-200">
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-16 px-2 py-1 text-sm text-gray-600 border-b border-gray-100 flex items-center"
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
                          {course.startHour}:00 - {course.endHour}:00
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
            Drag and drop courses here or click "Enroll Now"
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
    </div>
  );
}
