import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const hours = Array.from({ length: 10 }, (_, i) => 8 + i); // 8AM-17PM
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function WeeklySchedule({
  fixedCourses = [],
  variableCourses = [],
}) {
  const [variationIndexes, setVariationIndexes] = useState(
    variableCourses.map(() => 0)
  );

  // Merge fixed courses with current variations of variable courses
  const currentEvents = useMemo(() => {
    const variableEvents = variableCourses.map((course, i) => ({
      ...course.variations[variationIndexes[i]],
      title: course.title,
    }));
    return [...fixedCourses, ...variableEvents];
  }, [fixedCourses, variableCourses, variationIndexes]);

  const nextVariation = (courseIndex) => {
    setVariationIndexes((prev) =>
      prev.map((v, i) =>
        i === courseIndex ? (v + 1) % variableCourses[i].variations.length : v
      )
    );
  };

  const prevVariation = (courseIndex) => {
    setVariationIndexes((prev) =>
      prev.map((v, i) =>
        i === courseIndex
          ? (v - 1 + variableCourses[i].variations.length) %
            variableCourses[i].variations.length
          : v
      )
    );
  };

  return (
    <div className="p-4">
      {/* Header with variation controls */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Weekly Schedule</h2>
        <div className="flex gap-2 flex-wrap">
          {variableCourses.map((course, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="font-medium">{course.title}:</span>
              <button
                onClick={() => prevVariation(i)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                ⬅
              </button>
              <span className="text-sm">
                {variationIndexes[i] + 1}/{course.variations.length}
              </span>
              <button
                onClick={() => nextVariation(i)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                ➡
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg p-2">
        <div className="grid grid-cols-6 border-b border-gray-300">
          <div className="border-r border-gray-300 px-2 py-1">Time</div>
          {days.map((day) => (
            <div
              key={day}
              className="border-r border-gray-300 px-2 py-1 text-center font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-6">
          {/* Time column */}
          <div className="flex flex-col border-r border-gray-300">
            {hours.map((h) => (
              <div key={h} className="h-14 border-b border-gray-200 px-1">
                {h}:00
              </div>
            ))}
          </div>

          {/* Schedule grid */}
          {days.map((day) => (
            <div
              key={day}
              className="relative col-span-1 border-r border-gray-300"
            >
              {currentEvents
                .filter((c) => c.day === day)
                .map((course, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    className="absolute left-1 right-1 bg-blue-500 text-white rounded-md p-1 text-sm shadow cursor-move"
                    style={{
                      top: (course.startHour - 8) * 56,
                      height: (course.endHour - course.startHour) * 56,
                    }}
                  >
                    {course.title}
                  </motion.div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
