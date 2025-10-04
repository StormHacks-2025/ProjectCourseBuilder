import React from 'react';

const mentorSpotlight = {
  name: 'Becky Lin',
  subtitle: 'Rating: 4.6',
  cta: 'Book Online',
};

const scheduleItems = [
  { id: 1, date: '12', day: 'Mon', label: 'Data Ethics', time: '10:00AM – 12:00PM' },
  { id: 2, date: '13', day: 'Tue', label: 'Systems Design', time: '02:00PM – 04:00PM', active: true },
  { id: 3, date: '14', day: 'Wed', label: 'Machine Learning', time: '08:00AM – 10:00AM' },
];

const Schedule = () => (
  <section className="schedule-card">
    <header className="schedule-card__header">
      <h3>Schedule</h3>
      <button type="button" className="schedule-card__filter" aria-label="Select mentor">
        Professor ▾
      </button>
    </header>

    <div className="schedule-card__mentor">
      <div className="schedule-card__mentor-avatar" aria-hidden>
      </div>
      <div className="schedule-card__mentor-copy">
        <p className="schedule-card__mentor-name">{mentorSpotlight.name}</p>
        <p className="schedule-card__mentor-subtitle">{mentorSpotlight.subtitle}</p>
        <button type="button" className="schedule-card__mentor-cta">
          {mentorSpotlight.cta}
        </button>
      </div>
    </div>

    <ul className="schedule-card__list">
      {scheduleItems.map((session) => (
        <li
          key={session.id}
          className={[
            'schedule-card__item',
            session.active ? 'schedule-card__item--active' : undefined,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="schedule-card__pill">
            <span className="schedule-card__date">{session.date}</span>
            <span className="schedule-card__day">{session.day}</span>
          </div>
          <div className="schedule-card__details">
            <p className="schedule-card__label">{session.label}</p>
            <p className="schedule-card__time">{session.time}</p>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

export default Schedule;
