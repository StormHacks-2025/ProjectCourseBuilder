import { Link } from "react-router-dom";
import Profile from '../dashboard/Profile.jsx';
import Schedule from '../dashboard/Schedule.jsx';
import QuickActions from '../dashboard/QuickActions.jsx';
import NotificationCenter from '../dashboard/NotificationCenter.jsx';

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <h1 className="dashboard-page__title">Dashboard</h1>
          <p className="dashboard-page__subtitle">Your current progress overview</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Link
            to="/login"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Sign In
          </Link>

          <form className="dashboard-search" role="search">
            <span className="dashboard-search__icon" aria-hidden>
              🔍
            </span>
            <input
              type="search"
              name="dashboard-search"
              placeholder="Search"
              aria-label="Search"
            />
          </form>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Left column */}
        <section className="dashboard-grid__main">
          <Profile />

          {/* Horizontally aligned cards */}
          <div className="dashboard-row">
            <QuickActions />
            <Schedule />
          </div>
        </section>

        {/* Right column */}
        <aside className="dashboard-grid__aside">
          <NotificationCenter />
        </aside>
      </div>
    </div>
  );
}
