import { Outlet, NavLink } from "react-router-dom";

export default function App() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <nav className="w-64 bg-gray-800 text-white flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-8">ProjectCourseBuilder</h1>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `mb-4 px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/builder"
          className={({ isActive }) =>
            `mb-4 px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          Builder
        </NavLink>
        <NavLink
          to="/community"
          className={({ isActive }) =>
            `mb-4 px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          Community
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `mb-4 px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          Settings
        </NavLink>
        <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `mb-4 px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          Pricing
        </NavLink>
      </nav>

 
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
