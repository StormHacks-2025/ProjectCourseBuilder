import React from 'react';

const teachers = [
  { id: 1, name: 'Prof. David', subtitle: '4 hour lecture', rate: '$100/hr', avatar: 'https://i.pravatar.cc/60?img=56' },
  { id: 2, name: 'Prof. Lily', subtitle: '2 hour lecture', rate: '$120/hr', avatar: 'https://i.pravatar.cc/60?img=47' },
  { id: 3, name: 'Prof. Alex', subtitle: '4 hour lecture', rate: '$150/hr', avatar: 'https://i.pravatar.cc/60?img=60' },
];

const mentorSpotlight = {
  name: 'Prof. Lily',
  subtitle: '5 years Experience\nMasters in Language',
  cta: 'Book Online',
  avatar: 'https://i.pravatar.cc/80?img=47',
};

const scheduleItems = [
  { id: 1, date: '12', day: 'Monday', label: 'Data Ethics', time: '10:00AM – 12:00PM' },
  { id: 2, date: '13', day: 'Tuesday', label: 'Systems Design', time: '02:00PM – 04:00PM', active: true },
  { id: 3, date: '14', day: 'Wednesday', label: 'Machine Learning', time: '08:00AM – 10:00AM' },
];

const Schedule = () => (
  <section className="schedule-card">
    <div className="flex items-center justify-between">
      <h3>Find your teacher</h3>
      <button className="schedule-card__filter" type="button">English ▾</button>
    </div>

    <ul className="space-y-3">
      {teachers.map((teacher) => (
        <li key={teacher.id} className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={teacher.avatar} alt={teacher.name} className="size-10 rounded-full" />
            <div>
              <p className="font-medium text-sm">{teacher.name}</p>
              <p className="text-xs text-gray-500">{teacher.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{teacher.rate}</span>
            <button className="text-gray-400" type="button">···</button>
          </div>
        </li>
      ))}
    </ul>

    <div className="schedule-card__mentor">
      <div className="schedule-card__mentor-avatar" aria-hidden>
        <img src={mentorSpotlight.avatar} alt={mentorSpotlight.name} />
      </div>
      <div className="schedule-card__mentor-copy">
        <p className="schedule-card__mentor-name">{mentorSpotlight.name}</p>
        <p className="schedule-card__mentor-subtitle">{mentorSpotlight.subtitle}</p>
        <button type="button" className="schedule-card__mentor-cta">
          {mentorSpotlight.cta}
        </button>
      </div>
    </div>

    <header className="schedule-card__header">
      <h3>Schedule</h3>
      <button type="button" className="schedule-card__filter">Oct 08, 2020 ▾</button>
    </header>

    <ul className="schedule-card__list">
      {scheduleItems.map((session) => (
        <li
          key={session.id}
          className={`schedule-card__item ${session.active ? 'schedule-card__item--active' : ''}`}
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
