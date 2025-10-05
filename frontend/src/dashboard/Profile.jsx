import React from 'react';

const Profile = () => {
  const studentName = 'SFU Student';
  const studentYear = 'Computer Science Major';
  const totalCredits = 120;
  const earnedCredits = 70;
  const completion = earnedCredits / totalCredits;
  const completionPercent = Math.round(completion * 100);
  const progressDeg = completion * 360;

  return (
    <section className="profile-card">
      <header className="profile-header">
        <div className="profile-avatar" aria-hidden>aq</div>
        <div className="profile-meta">
          <p className="profile-name">{studentName}</p>
          <p className="profile-role">{studentYear}</p>
        </div>
      </header>

      <div className="profile-progress">
        <div
          className="progress-ring"
          style={{ '--progress-deg': `${progressDeg}deg` }}
        >
          <div className="progress-ring__inner">
            <span className="progress-ring__value">{completionPercent}%</span>
          </div>
        </div>
        <div className="profile-progress__meta">
          <p className="profile-progress__title">Account Progress</p>
          <p className="profile-progress__credits">
            {earnedCredits} of {totalCredits} credits
          </p>
        </div>
      </div>
    </section>
  );
};

export default Profile;
