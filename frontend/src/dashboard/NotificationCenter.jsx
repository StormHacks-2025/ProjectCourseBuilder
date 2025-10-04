import React from 'react';

const notifications = [
  {
    id: 1,
    title: 'English Course',
    detail: '20 hours • 4 tasks due',
    icon: '📘',
  },
  {
    id: 2,
    title: 'Spoken Course',
    detail: '40 hours • 1 live session',
    icon: '🗣️',
  },
  {
    id: 3,
    title: 'Writing Course',
    detail: '20 hours • Essay draft',
    icon: '✍️',
  },
  {
    id: 4,
    title: 'Language Course',
    detail: '20 hours • Quiz on Friday',
    icon: '🌐',
  },
];

const NotificationCenter = () => (
  <section className="notification-center">
    <header className="notification-center__header">
      <div>
        <h3>My Courses</h3>
        <p>Keep tabs on your active learning.</p>
      </div>
      <button type="button" className="notification-center__more" aria-label="Manage courses">
        ···
      </button>
    </header>

    <ul className="notification-center__list">
      {notifications.map((item) => (
        <li key={item.id} className="notification-center__item">
          <div className="notification-center__icon" aria-hidden>
            <span>{item.icon}</span>
          </div>
          <div className="notification-center__copy">
            <p className="notification-center__title">{item.title}</p>
            <p className="notification-center__detail">{item.detail}</p>
          </div>
          <button type="button" className="notification-center__dot" aria-label={`More options for ${item.title}`}>
            ···
          </button>
        </li>
      ))}
    </ul>
  </section>
);

export default NotificationCenter;
