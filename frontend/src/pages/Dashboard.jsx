import React, { useEffect, useState } from "react";
import Profile from "../dashboard/Profile.jsx";
import Schedule from "../dashboard/Schedule.jsx";
import QuickActions from "../dashboard/QuickActions.jsx";
import NotificationCenter from "../dashboard/NotificationCenter.jsx";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transcriptSet, setTranscriptSet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the current user from localStorage
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!storedUser) {
          // redirect if no user found
          window.location.href = "/login";
          return;
        }

        setUser(storedUser);

        // Fetch profile info
        const profileRes = await fetch("https://projectcoursebuilder-1.onrender.com/api/profile", {
          headers: { "x-user-email": storedUser.email },
        });
        const profileData = await profileRes.json();

        // Fetch transcript status
        const transcriptRes = await fetch(
          `https:/projectcoursebuilder-1.onrender.com//api/transcripts?email=${storedUser.email}`
        );
        const transcriptData = await transcriptRes.json();

        setTranscriptSet(transcriptData?.set ?? false);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <h1 className="dashboard-page__title">Dashboard (DEMO-VISUAL PREVIEW) TRY THE COURSE BUILDER PAGE FOR INTERACTIVITY</h1>
          <p className="dashboard-page__subtitle">
            Welcome, {user?.name ?? "Student"}! Your current progress overview
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
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
          <Profile user={user} transcriptSet={transcriptSet} />

          <div className="dashboard-row">
            <QuickActions user={user} />
            <Schedule user={user} />
          </div>
        </section>

        {/* Right column */}
        <aside className="dashboard-grid__aside">
          <NotificationCenter user={user} />
        </aside>
      </div>
    </div>
  );
}
