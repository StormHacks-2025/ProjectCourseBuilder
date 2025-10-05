import React, { useState } from 'react';

const hours = Array.from({ length: 10 }, (_, i) => 8 + i); // 8:00 to 17:00
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const WeeklySchedule = ({ fixedCourses = [], variableCourses = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentVariable = variableCourses[currentIndex] || [];
  const currentEvents = [...fixedCourses, ...currentVariable];

  const getEvent = (day, hour) => {
    return currentEvents.find(
      e => e.day === day && e.startHour <= hour && e.endHour > hour
    );
  };

  const prevVariation = () => {
    setCurrentIndex((prev) => (prev === 0 ? variableCourses.length - 1 : prev - 1));
  };

  const nextVariation = () => {
    setCurrentIndex((prev) => (prev === variableCourses.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #ccc', fontFamily: 'sans-serif' }}>
      {/* Header with arrows */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px' }}>
        <button onClick={prevVariation}>⬅ Prev</button>
        <span>Course Variation {currentIndex + 1} / {variableCourses.length}</span>
        <button onClick={nextVariation}>Next ➡</button>
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', width: '60px', padding: '5px' }}>Time</th>
            {days.map(day => (
              <th key={day} style={{ border: '1px solid #ccc', padding: '5px' }}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour} style={{ height: '60px' }}>
              <td style={{ border: '1px solid #ccc', padding: '5px' }}>{hour}:00</td>
              {days.map(day => {
                const event = getEvent(day, hour);
                return (
                  <td
                    key={day + hour}
                    style={{
                      border: '1px solid #ccc',
                      padding: '5px',
                      background: event ? '#007bff' : 'white',
                      color: event ? 'white' : 'black',
                      verticalAlign: 'top',
                      fontWeight: event ? 'bold' : 'normal'
                    }}
                  >
                    {event ? event.title : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklySchedule;
