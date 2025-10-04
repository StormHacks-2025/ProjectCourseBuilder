import { SearchBarBuilder } from '../component/seachBarBuilder.jsx';
import WeeklySchedule from '../component/weeklySchedule.jsx';

export default function Builder() {
  // Courses that stay the same for all variations
  const fixedCourses = [
    { title: 'Physics', day: 'Tue', startHour: 10, endHour: 12 },
    { title: 'Chemistry', day: 'Wed', startHour: 14, endHour: 16 },
  ];

  // Variations of a single course (e.g., different Math sections)
  const variableCourses = [
    [ { title: 'Math A', day: 'Mon', startHour: 9, endHour: 11 } ],
    [ { title: 'Math B', day: 'Mon', startHour: 11, endHour: 13 } ]
  ];

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <div style={{ flex: 1 }}>
        <SearchBarBuilder />
      </div>

      <div style={{ flex: 2 }}>
        <WeeklySchedule fixedCourses={fixedCourses} variableCourses={variableCourses} />
      </div>
    </div>
  );
}
