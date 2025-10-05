import { Slider } from "../component/slider.jsx";
import { SearchBarBuilder } from "../component/seachBarBuilder.jsx";
import WeeklySchedule from "../component/WeeklySchedule.jsx";

export default function Builder() {
  const fixedCourses = [
    { id: "physics", title: "Physics", day: "Tue", startHour: 10, endHour: 12 },
    { id: "chem", title: "Chemistry", day: "Wed", startHour: 14, endHour: 16 },
  ];

  const variableCourses = [
    {
      title: "Math",
      variations: [
        { day: "Mon", startHour: 9, endHour: 11 },
        { day: "Mon", startHour: 11, endHour: 13 },
      ],
    },
    {
      title: "English",
      variations: [
        { day: "Tue", startHour: 10, endHour: 12 },
        { day: "Wed", startHour: 14, endHour: 16 },
      ],
    },
  ];


  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      <div className="flex-1">
        <SearchBarBuilder />
      </div>

      <div className="flex-2">
        <WeeklySchedule
          fixedCourses={fixedCourses}
          variableCourses={variableCourses}
        />
      </div>

      <div className="hidden md:block">
        <Slider />
      </div>
    </div>
  );
}
