import { Outlet, NavLink } from 'react-router-dom';
import './App.css';

const navPrimary = [
  { to: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { to: '/builder', label: 'Builder', Icon: LayoutIcon },
  { to: '/community', label: 'Community', Icon: ChatIcon },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
];

const navSecondary = [{ to: '/pricing', label: 'Pricing', Icon: ChartIcon }];

export default function App() {
  return (
    <div className="dashboard-root">
      <div className="dashboard-frame">
        <aside className="sidebar">

          <nav className="sidebar__nav sidebar__nav--primary" aria-label="Primary">
            {navPrimary.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'sidebar__nav-item',
                    isActive ? 'sidebar__nav-item--active' : undefined,
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
                aria-label={label}
              >
                <Icon className="sidebar__icon" />
                <span className="sr-only">{label}</span>
              </NavLink>
            ))}
          </nav>

          <nav className="sidebar__nav sidebar__nav--secondary" aria-label="Secondary">
            {navSecondary.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'sidebar__nav-item',
                    isActive ? 'sidebar__nav-item--active' : undefined,
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
                aria-label={label}
              >
                <Icon className="sidebar__icon" />
                <span className="sr-only">{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function IconWrapper({ children, className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function HomeIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M19 10.9V20h-5v-4H10v4H5v-9.1" />
    </IconWrapper>
  );
}

function LayoutIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="4.5" rx="2" />
      <rect x="13" y="10" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="4" rx="2" />
    </IconWrapper>
  );
}

function ChatIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M5.5 5h13a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H13l-4.5 3v-3H5.5A1.5 1.5 0 0 1 4 13.5v-7A1.5 1.5 0 0 1 5.5 5Z" />
      <path d="M8 8h8" />
      <path d="M8 11h5" />
    </IconWrapper>
  );
}

function ChartIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M5 19V10" />
      <path d="M10 19V5" />
      <path d="M15 19v-6" />
      <path d="M20 19v-9" />
    </IconWrapper>
  );
}

function SettingsIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .7.41 1.34 1.05 1.63.32.14.67.21 1.03.21H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </IconWrapper>
  );
}
