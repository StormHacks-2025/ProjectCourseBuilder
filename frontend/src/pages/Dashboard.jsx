import React, { useEffect, useState } from "react";
import Profile from "../dashboard/Profile.jsx";
import Schedule from "../dashboard/Schedule.jsx";
import QuickActions from "../dashboard/QuickActions.jsx";
import NotificationCenter from "../dashboard/NotificationCenter.jsx";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transcriptSet, setTranscriptSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Course Builder",
      content: (
        <div>
          <p className="mb-4">Let's take a quick tour of how everything works.</p>
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> The server may spin down due to inactivity. If this happens,
            please wait up to 50 seconds for it to restart.
          </p>
        </div>
      )
    },
    {
      title: "Visual Preview Pages",
      content: (
        <div>
          <p className="mb-3">You have three main pages to explore:</p>
          <ul className="space-y-2 text-left">
            <li><strong>Dashboard:</strong> View your progress overview and quick stats</li>
            <li><strong>Community:</strong> Connect with other students and share experiences</li>
            <li><strong>Pricing:</strong> Explore subscription options and features</li>
          </ul>
        </div>
      )
    },
    {
      title: "Course Builder - The Interactive Hub",
      content: (
        <div className="text-left space-y-3">
          <p className="font-semibold mb-2">This is where the magic happens:</p>
          <ul className="space-y-2">
            <li><strong>Create Courses:</strong> Type in a course name to get started</li>
            <li><strong>Drag & Drop:</strong> Easily organize and reorder your courses</li>
            <li><strong>Save & Load:</strong> Your courses are automatically saved and can be loaded anytime</li>
          </ul>
        </div>
      )
    },
    {
      title: "AI Chatbot Assistant",
      content: (
        <div className="text-left space-y-3">
          <p className="mb-2">Open the side chatbot to get personalized course recommendations.</p>
          <div className="bg-gray-100 p-3 rounded-lg mb-2">
            <p className="text-sm font-mono">Try asking: "Give me chemistry courses that are hard"</p>
          </div>
          <p className="text-sm">The AI will generate courses based on your request, and you can load them directly into your schedule.</p>
        </div>
      )
    },
    {
      title: "Settings & Profile",
      content: (
        <div className="text-left space-y-3">
          <p className="mb-2">Customize your experience in Settings:</p>
          <ul className="space-y-2">
            <li><strong>Transcript Feature:</strong> Upload and manage your academic transcripts</li>
            <li><strong>Profile Picture:</strong> Set your avatar and personalize your profile</li>
            <li><strong>Profile Info:</strong> Update your name, bio, and other details</li>
          </ul>
        </div>
      )
    },
    {
      title: "You're All Set",
      content: (
        <div>
          <p className="mb-4">Head over to the <strong>Course Builder</strong> page to start creating your perfect schedule.</p>
          <p className="text-sm text-gray-600">You can always revisit this tutorial from the help menu.</p>
        </div>
      )
    }
  ];

  const handleCloseTutorial = () => {
    if (user) {
      localStorage.setItem(`tutorial_seen_${user.email}`, 'true');
    }
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const handleNext = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      handleCloseTutorial();
    }
  };

  const handlePrevious = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

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

        // Check if user has seen the tutorial
        const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${storedUser.email}`);
        if (!hasSeenTutorial) {
          setShowTutorial(true);
        }

        // Fetch profile info
        const profileRes = await fetch("https://projectcoursebuilder-1.onrender.com/api/profile", {
          headers: { "x-user-email": storedUser.email },
        });
        const profileData = await profileRes.json();

        // Fetch transcript status
        const transcriptRes = await fetch(
          `https://projectcoursebuilder-1.onrender.com/api/transcripts?email=${storedUser.email}`
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
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${index === tutorialStep
                        ? 'bg-blue-600 w-8'
                        : index < tutorialStep
                          ? 'bg-blue-400'
                          : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">
                  {tutorialSteps[tutorialStep].title}
                </h2>
                <div className="text-gray-700 text-lg">
                  {tutorialSteps[tutorialStep].content}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={tutorialStep === 0}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${tutorialStep === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Previous
                </button>

                <button
                  onClick={handleCloseTutorial}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Skip Tutorial
                </button>

                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  {tutorialStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
