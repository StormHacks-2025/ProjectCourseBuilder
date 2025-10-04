import React from 'react';
import Profile from './components/Profile';
import RecentActivity from './components/RecentActivity';
import './App.css';

function App() {
  return (
    <div className="dashboard-root">
      <main className="dashboard-surface">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your learning journey</p>
          </div>
          <div className="header-controls">
            <div className="search-field" role="search">
              <span aria-hidden>🔍</span>
              <input type="search" placeholder="Search" />
            </div>
            <button className="icon-button" type="button" aria-label="Add new">＋</button>
            <button className="icon-button" type="button" aria-label="Notifications">🔔</button>
          </div>
        </header>

        <section className="dashboard-columns flex gap-6">
          <div className="dashboard-column flex-[2]">
            <Profile />
          </div>
            <div className="dashboard-column flex-[1]">
            <RecentActivity />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
