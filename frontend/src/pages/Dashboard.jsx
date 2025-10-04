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

        <form className="dashboard-search" role="search">
          <span className="dashboard-search__icon" aria-hidden>🔍</span>
          <input
            type="search"
            name="dashboard-search"
            placeholder="Search"
            aria-label="Search"
          />
        </form>
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-grid__main">
          <Profile />
          <QuickActions />
        </section>

        <aside className="dashboard-grid__aside">
          <Schedule />
          <NotificationCenter />
        </aside>
      </div>
    </div>
  );
}
