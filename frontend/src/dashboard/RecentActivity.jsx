import React from 'react';

const activityItems = [
  { id: 1, label: 'Completed "Data Structures"', detail: '4 credit course', timestamp: '2 days ago' },
  { id: 2, label: 'Enrolled in "Advanced Algorithms"', detail: 'Spring 2025', timestamp: '1 week ago' },
  { id: 3, label: 'Met academic advisor', detail: 'Planning Fall schedule', timestamp: '2 weeks ago' },
];

const RecentActivity = () => (
  <section className="activity-card">
    <header className="activity-card__header">
      <h3>Recent Activity</h3>
      <button className="icon-button" type="button" aria-label="See all activity">
        ···
      </button>
    </header>
    <ul className="activity-card__list">
      {activityItems.map((activity) => (
        <li key={activity.id} className="activity-card__item">
          <div className="activity-icon" aria-hidden>
            <span>✓</span>
          </div>
          <div className="activity-copy">
            <p className="activity-title">{activity.label}</p>
            <p className="activity-detail">{activity.detail}</p>
          </div>
          <span className="activity-timestamp">{activity.timestamp}</span>
        </li>
      ))}
    </ul>
  </section>
);

export default RecentActivity;
