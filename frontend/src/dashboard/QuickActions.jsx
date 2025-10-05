import React from "react";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    id: "builder",
    label: "Go to Builder",
    helper: "Create or edit courses",
    path: "/builder",
  },
  {
    id: "community",
    label: "Community",
    helper: "Join discussions & study groups",
    path: "/community",
  },
  {
    id: "upgrade",
    label: "Upgrade",
    helper: "Unlock premium features",
    path: "/pricing",
  }, // last button
];

const QuickActions = () => {
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <section className="quick-actions">
      <header className="quick-actions__header">
        <h3>Quick Actions</h3>
        <button
          type="button"
          className="quick-actions__more"
          aria-label="More actions"
        >
          ···
        </button>
      </header>
      <ul className="quick-actions__list">
        {actions.map((action, index) => (
          <li key={action.id} className="quick-actions__item">
            <button
              type="button"
              className={`quick-actions__button ${
                action.id === "upgrade"
                  ? "quick-actions__button--highlight"
                  : ""
              }`}
              onClick={() => handleClick(action.path)}
            >
              <span className="quick-actions__label">{action.label}</span>
              <span className="quick-actions__helper">{action.helper}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default QuickActions;
