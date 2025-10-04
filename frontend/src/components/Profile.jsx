import React from 'react';

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem',
    borderRadius: '1rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
    maxWidth: '540px',
    gap: '1.5rem',
  },
  info: {
    flex: '1 1 0%',
  },
  name: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#111827',
  },
  year: {
    margin: '0.35rem 0 0',
    color: '#4b5563',
    fontSize: '1rem',
  },
  progressWrapper: {
    textAlign: 'center',
    minWidth: '150px',
  },
  circle: (progressDeg) => ({
    position: 'relative',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: `conic-gradient(#4f46e5 ${progressDeg}deg, #e5e7eb ${progressDeg}deg)` ,
  }),
  circleInner: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'grid',
    placeItems: 'center',
    boxShadow: 'inset 0 6px 18px rgba(79, 70, 229, 0.15)',
  },
  percent: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 600,
    color: '#312e81',
  },
  creditsText: {
    margin: '0.75rem 0 0',
    fontSize: '0.95rem',
    color: '#4b5563',
  },
};

const getAcademicYearLabel = (earnedCredits) => {
  if (earnedCredits > 90) return '4th year';
  if (earnedCredits > 60) return '3rd year';
  if (earnedCredits > 30) return '2nd year';
  return '1st year';
};

const Profile = () => {
  const studentName = 'SFU Student';
  const totalCredits = 120;
  const earnedCredits = 70;

  const completion = earnedCredits / totalCredits;
  const completionPercent = Math.round(completion * 100);
  const progressDeg = completion * 360;
  const yearLabel = getAcademicYearLabel(earnedCredits);

  return (
    <section style={styles.card}>
      <div style={styles.info}>
        <h2 style={styles.name}>{studentName}</h2>
        <p style={styles.year}>{yearLabel}</p>
      </div>

      <div style={styles.progressWrapper}>
        <div style={styles.circle(progressDeg)}>
          <div style={styles.circleInner}>
            <p style={styles.percent}>{completionPercent}%</p>
          </div>
        </div>
        <p style={styles.creditsText}>{earnedCredits} / {totalCredits} credits</p>
      </div>
    </section>
  );
};

export default Profile;
