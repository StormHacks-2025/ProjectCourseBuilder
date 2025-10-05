import  { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./sortable.jsx";

const hours = Array.from({ length: 10 }, (_, i) => 8 + i); // 8:00 - 17:00
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const WeeklySchedule = ({ fixedCourses = [], variableCourses = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [courses, setCourses] = useState([
    ...fixedCourses,
    ...variableCourses.flat(),
  ]);

  const currentCombination = useMemo(() => {
    if (variableCourses.length === 0) return fixedCourses;
    return variableCourses
      .map((v) => v[currentIndex % v.length] || null)
      .filter(Boolean)
      .concat(fixedCourses);
  }, [variableCourses, currentIndex, fixedCourses]);

  const nextVariation = () => setCurrentIndex((i) => i + 1);
  const prevVariation = () => setCurrentIndex((i) => i - 1);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = courses.findIndex((c) => c.id === active.id);
      const newIndex = courses.findIndex((c) => c.id === over.id);
      setCourses((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
        <button
          onClick={prevVariation}
          className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
        >
          ⬅ Prev
        </button>
        <span className="font-semibold text-gray-700">
          Variation {currentIndex + 1} / {variableCourses.length || 1}
        </span>
        <button
          onClick={nextVariation}
          className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
        >
          Next ➡
        </button>
      </div>

      {/* Schedule Table */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-200 px-2 py-1 w-14 bg-gray-50">
                Time
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="border border-gray-200 px-2 py-1 bg-gray-50"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour} className="h-16">
                <td className="border border-gray-200 px-2 py-1 text-sm font-medium bg-gray-50">
                  {hour}:00
                </td>
                {days.map((day) => {
                  const events = currentCombination.filter(
                    (c) =>
                      c.day === day && c.startHour <= hour && c.endHour > hour
                  );
                  return (
                    <td
                      key={day + hour}
                      className="border border-gray-200 p-1 align-top"
                    >
                      <SortableContext
                        items={events.map((e) => e.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {events.map((event) => (
                          <SortableItem key={event.id} {...event} />
                        ))}
                      </SortableContext>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </DndContext>
    </div>
  );
};

export default WeeklySchedule;
