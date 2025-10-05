import { useState } from "react";
import { SearchBarBuilder } from "../component/SearchBarBuilder.jsx";
import WeeklySchedule from "../component/WeeklySchedule.jsx";

export default function Builder() {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [pinnedCourses, setPinnedCourses] = useState([]);

  return (
    <div className="flex gap-6 p-6">
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
          variableCourses={selectedCourses.filter(
            (c) => !pinnedCourses.includes(c)
          )}
        />
      </div>
    </div>
  );
}
