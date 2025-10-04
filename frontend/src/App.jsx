import { Outlet, NavLink } from 'react-router-dom';
import './App.css';

const navItems = [
  { to: '/dashboard', icon: '🏠' },
  { to: '/builder', icon: '🛠️' },
  { to: '/community', icon: '💬' },
  { to: '/settings', icon: '⚙️' },
  { to: '/pricing', icon: '💳' },
];

export default function App() {
  return (
    <div className="dashboard-root">
      <aside className="sidebar">
        <nav className="sidebar__nav">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'sidebar__nav-link',
                  isActive ? 'sidebar__nav-link--active' : undefined,
                ]
                  .filter(Boolean)
                  .join(' ')
              }
              title={label}
            >
              <span aria-hidden>{icon}</span>
              <span className="sidebar__nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="dashboard-surface">
        <Outlet />
      </main>
    </div>
  );
}
