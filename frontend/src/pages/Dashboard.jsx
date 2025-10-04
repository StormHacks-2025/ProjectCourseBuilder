import Profile from '../dashboard/Profile.jsx';
import RecentActivity from '../dashboard/RecentActivity.jsx';

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1 className="dashboard-page__title">Dashboard</h1>
        <p className="dashboard-page__subtitle">Your current progress overview</p>
      </header>

      <div className="dashboard-page__content">
        <Profile />
        <RecentActivity />
      </div>
    </div>
  );
}
