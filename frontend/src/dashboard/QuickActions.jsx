import React from 'react';

const actions = [
  { id: 'plan', label: 'Plan Semester', helper: 'Build out course roadmap' },
  { id: 'enroll', label: 'Browse Courses', helper: 'Add electives or requirements' },
  { id: 'meeting', label: 'Advisor Meeting', helper: 'Schedule a check-in' },
];

const QuickActions = () => (
  <section className="quick-actions">
    <header className="quick-actions__header">
      <h3>Quick Actions</h3>
      <button type="button" className="quick-actions__more" aria-label="More actions">
        ···
      </button>
    </header>
    <ul className="quick-actions__list">
      {actions.map((action) => (
        <li key={action.id} className="quick-actions__item">
          <button type="button" className="quick-actions__button">
            <span className="quick-actions__label">{action.label}</span>
            <span className="quick-actions__helper">{action.helper}</span>
          </button>
        </li>
      ))}
    </ul>
  </section>
);

export default QuickActions;
