import { useState } from "react";
import { SearchBarBuilder } from "../component/seachBarBuilder.jsx";
import WeeklySchedule from "../component/WeeklySchedule.jsx";

export default function Builder() {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [pinnedCourses, setPinnedCourses] = useState([]);

  const variableCourses = selectedCourses.filter(
    (c) => !pinnedCourses.find((p) => p.title === c.title)
  );

  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      <div className="w-96">
        <SearchBarBuilder
          selectedCourses={selectedCourses}
          setSelectedCourses={setSelectedCourses}
          pinnedCourses={pinnedCourses}
          setPinnedCourses={setPinnedCourses}
        />
      </div>
      <div className="flex-1">
        <WeeklySchedule
          pinnedCourses={pinnedCourses}
          variableCourses={variableCourses}
          selectedCourses={selectedCourses}
          setSelectedCourses={setSelectedCourses}
        />
      </div>
    </div>
  );
}
