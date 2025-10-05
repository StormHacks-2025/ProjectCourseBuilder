import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const DEFAULT_COURSE = "CMPT 310";

export default function Community() {
  const [selectedCourse, setSelectedCourse] = useState(DEFAULT_COURSE);
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [trending, setTrending] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const headers = useMemo(() => {
    const token = localStorage.getItem("coursecompass_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    fetchTrending();
    fetchActivity();
  }, []);

  useEffect(() => {
    loadThread(selectedCourse);
  }, [selectedCourse]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        const params = new URLSearchParams({ q: searchQuery, page: '1', limit: '10' });
        const res = await fetch(`${API_BASE}/api/courses/search?${params.toString()}`, {
          headers,
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('search');
        const data = await res.json();
        setSearchResults(data.results.map((course) => ({
          courseCode: course.code,
          courseTitle: course.title,
        })));
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Course search failed, using demo list', error.message);
          setSearchResults(
            DEMO_COURSES.filter((course) =>
              course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
              course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        }
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchQuery, headers]);

  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket"] });

    socket.emit("join", { room: "community:lobby" });

    socket.on("activity", (item) => {
      setActivity((prev) => [item, ...prev].slice(0, 20));
    });

    socket.on("trendingUpdate", (list) => {
      setTrending(list);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket"] });
    const room = `thread:${selectedCourse}`;
    socket.emit("join", { room });

    socket.on("newPost", (post) => {
      if (post.courseCode === selectedCourse) {
        setPosts((prev) => [mapComment(post), ...prev]);
      }
    });

    socket.on("newReply", (reply) => {
      if (reply.courseCode === selectedCourse) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === reply.parentId
              ? {
                  ...p,
                  replies: [mapComment(reply), ...(p.replies || [])],
                }
              : p
          )
        );
      }
    });

    socket.on("likeUpdate", ({ commentId, likesCount }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === commentId
            ? { ...p, likesCount }
            : {
                ...p,
                replies: p.replies?.map((r) =>
                  r._id === commentId ? { ...r, likesCount } : r
                ) || p.replies,
              }
        )
      );
    });

    return () => socket.disconnect();
  }, [selectedCourse]);

  async function fetchTrending() {
   try {
     const res = await fetch(`${API_BASE}/api/community/trending`, { headers });
     if (!res.ok) throw new Error('Failed');
     const data = await res.json();
      setTrending(
        data.length
          ? data
          : [{ courseCode: selectedCourse, courseTitle: selectedCourse, score: 1 }]
      );
    } catch (error) {
      console.warn('Using fallback trending', error.message);
      setTrending(DEMO_TRENDING);
    }
  }

  async function fetchActivity() {
    try {
      const res = await fetch(`${API_BASE}/api/community/activity`, { headers });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setActivity(data);
    } catch (error) {
      console.warn('Using fallback activity', error.message);
      setActivity(DEMO_ACTIVITY);
    }
  }

  async function loadThread(courseCode) {
    try {
      setLoadingPosts(true);
      const threadRes = await fetch(`${API_BASE}/api/threads/${encodeURIComponent(courseCode)}`, {
        headers,
      });
      if (!threadRes.ok) throw new Error('thread');
      const threadData = await threadRes.json();
      setThread(threadData);

      const postsRes = await fetch(
        `${API_BASE}/api/threads/${encodeURIComponent(courseCode)}/comments?page=1&limit=20`,
        { headers }
      );
      if (!postsRes.ok) throw new Error('posts');
      const list = await postsRes.json();
      setPosts(list.items.map(mapComment));
    } catch (error) {
      console.warn('Unable to load thread from API', error.message);
      setThread({
        courseCode,
        courseTitle: courseCode,
        postsCount: DEMO_POSTS.length,
        likesCount: DEMO_POSTS.reduce((sum, p) => sum + (p.likes || 0), 0),
        lastActivityAt: new Date().toISOString(),
      });
      setPosts(DEMO_POSTS.map(mapComment));
      setTrending((prev) => (prev.length ? prev : DEMO_TRENDING));
    } finally {
      setLoadingPosts(false);
    }
  }

  async function submitPost() {
    if (!text.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/threads/${encodeURIComponent(selectedCourse)}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      setPosts((prev) => [mapComment(created), ...prev]);
      setThread((prev) =>
        prev
          ? {
              ...prev,
              postsCount: prev.postsCount + 1,
              lastActivityAt: created.createdAt,
            }
          : prev
      );
      setText('');
    } catch (error) {
      console.warn('Unable to post via API', error.message);
    }
  }

  async function toggleLike(commentId) {
    try {
      const res = await fetch(
        `${API_BASE}/api/threads/${encodeURIComponent(selectedCourse)}/comments/${commentId}/like`,
        {
          method: 'POST',
          headers,
        }
      );
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p._id === commentId
            ? { ...p, likesCount: data.likesCount }
            : p
        )
      );
    } catch (error) {
      console.warn('Unable to toggle like', error.message);
    }
  }

  const courseList = [...new Map(
    [
      [selectedCourse, { courseCode: selectedCourse, courseTitle: selectedCourse }],
      ...searchResults.map((c) => [c.courseCode, c]),
      ...trending.map((c) => [c.courseCode, c]),
    ]
  ).values()];

  return (
    <div className="community-grid">
      <aside className="community-card community-card--nav">
        <h2 className="community-card__title">Course Threads</h2>
        <p className="community-card__subtitle">Join conversations by course</p>
        <div className="community-search">
          <input
            placeholder="Search SFU courses"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="community-search__input"
          />
          <span className="community-search__icon">🔍</span>
        </div>
        {searching && <p className="community-search__hint">Searching…</p>}
        <nav className="community-nav">
          {courseList.map((course) => (
            <button
              key={course.courseCode}
              className={`community-nav__item ${
                course.courseCode === selectedCourse ? 'community-nav__item--active' : ''
              }`}
              onClick={() => setSelectedCourse(course.courseCode)}
            >
              <span className="community-nav__code">{course.courseCode}</span>
              <span className="community-nav__title">{course.courseTitle}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="community-grid__main">
        <div className="community-card community-thread">
          <div>
            <h1>{thread?.courseTitle || selectedCourse}</h1>
            <p>{thread?.postsCount ?? posts.length} posts · Last activity {formatRelative(thread?.lastActivityAt)}</p>
          </div>
          <div className="community-thread__stats">
            <div>
              <span className="community-thread__label">Posts</span>
              <strong>{thread?.postsCount ?? posts.length}</strong>
            </div>
            <div>
              <span className="community-thread__label">Likes</span>
              <strong>{thread?.likesCount ?? posts.reduce((sum, p) => sum + (p.likesCount || 0), 0)}</strong>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="community-card community-composer"
        >
          <div className="community-composer__body">
            <img src="https://i.pravatar.cc/60" className="size-10 rounded-full" alt="Your avatar" />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Share something about ${selectedCourse}...`}
              className="community-composer__input"
              rows={2}
            />
          </div>
          <div className="text-right mt-3">
            <button className="community-button" onClick={submitPost}>
              Post
            </button>
          </div>
        </motion.div>

        <div className="community-card community-feed">
          <header className="community-feed__header">
            <h2>Latest Posts</h2>
            {loadingPosts && <span>Loading…</span>}
          </header>
          <AnimatePresence>
            {posts.map((post) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="community-post"
              >
                <div className="community-post__avatar">
                  <img src={post.author.avatar} alt={post.author.username} />
                </div>
                <div className="community-post__body">
                  <div className="community-post__meta">
                    <span className="community-post__author">{post.author.username}</span>
                    <span className="community-post__time">{formatRelative(post.createdAt)}</span>
                  </div>
                  <p className="community-post__text">{post.text}</p>
                  <div className="community-post__actions">
                    <button onClick={() => toggleLike(post._id)}>❤️ {post.likesCount}</button>
                    <span>💬 {post.replies?.length || 0}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <aside className="community-grid__aside">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="community-card"
        >
          <h3 className="community-card__title">Trending Courses</h3>
          <ul className="community-list">
            {trending.map((course) => (
              <li key={course.courseCode} className="community-list__item">
                <div>
                  <p className="community-list__title">{course.courseCode} — {course.courseTitle}</p>
                  <p className="community-list__meta">Score {course.score?.toFixed?.(1) ?? course.score}</p>
                </div>
                <button type="button" className="community-list__action" onClick={() => setSelectedCourse(course.courseCode)}>
                  Open
                </button>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="community-card"
        >
          <h3 className="community-card__title">Student Activity</h3>
          <ul className="community-activity">
            {activity.map((item, idx) => (
              <li key={idx}>
                <strong>{item.actor?.username || 'Someone'}</strong>
                <span>{item.message}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </aside>
    </div>
  );
}

function mapComment(comment) {
  return {
    _id: comment._id || comment.id,
    author: {
      username: comment.author?.username || comment.name || 'Unknown',
      avatar:
        comment.author?.avatar || comment.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comment.author?.username || 'U')}`,
    },
    text: comment.text,
    likesCount: comment.likesCount || comment.likes || 0,
    createdAt: comment.createdAt || new Date().toISOString(),
    parentId: comment.parentId || null,
    courseCode: comment.courseCode,
    replies: comment.replies || [],
  };
}

function formatRelative(date) {
  if (!date) return 'just now';
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

const DEMO_TRENDING = [
  { courseCode: 'CMPT 310', courseTitle: 'Artificial Intelligence', score: 42.3 },
  { courseCode: 'CMPT 373', courseTitle: 'Software Development Methods', score: 35.1 },
  { courseCode: 'CMPT 295', courseTitle: 'Machine Organization', score: 28.8 },
];

const DEMO_COURSES = [
  { courseCode: 'CMPT 101', courseTitle: 'Exploring Computer Science' },
  { courseCode: 'CMPT 120', courseTitle: 'Intro to Computing Science & Programming I' },
  { courseCode: 'CMPT 125', courseTitle: 'Intro to Computing Science & Programming II' },
  { courseCode: 'CMPT 135', courseTitle: 'Intro to Programming for Scientists & Engineers' },
  { courseCode: 'CMPT 201', courseTitle: 'Intro to Computer Systems' },
  { courseCode: 'CMPT 213', courseTitle: 'Object Oriented Design in Java' },
  { courseCode: 'CMPT 225', courseTitle: 'Data Structures and Programming' },
  { courseCode: 'CMPT 276', courseTitle: 'Introduction to Software Engineering' },
  { courseCode: 'CMPT 295', courseTitle: 'Machine Organization' },
  { courseCode: 'CMPT 300', courseTitle: 'Operating Systems I' },
  { courseCode: 'CMPT 305', courseTitle: 'Applied Cryptography' },
  { courseCode: 'CMPT 307', courseTitle: 'Data Structures and Algorithms' },
  { courseCode: 'CMPT 308', courseTitle: 'Applied Algorithms' },
  { courseCode: 'CMPT 310', courseTitle: 'Artificial Intelligence' },
  { courseCode: 'CMPT 318', courseTitle: 'Cybersecurity Analytics' },
  { courseCode: 'CMPT 320', courseTitle: 'Social Implications of a Computerized Society' },
  { courseCode: 'CMPT 322', courseTitle: 'Introduction to Human-Computer Interaction' },
  { courseCode: 'CMPT 330', courseTitle: 'Applied Probability for Computer Science' },
  { courseCode: 'CMPT 342', courseTitle: 'Computer Vision' },
  { courseCode: 'CMPT 352', courseTitle: 'Introduction to Information Security' },
  { courseCode: 'CMPT 361', courseTitle: 'Introduction to Computer Graphics' },
  { courseCode: 'CMPT 373', courseTitle: 'Software Development Methods' },
  { courseCode: 'CMPT 376W', courseTitle: 'Technical Writing and Group Dynamics' },
  { courseCode: 'CMPT 383', courseTitle: 'Comparative Programming Languages' },
  { courseCode: 'CMPT 454', courseTitle: 'Bioinformatics' },
  { courseCode: 'CMPT 470', courseTitle: 'Web-Based Information Systems' },
  { courseCode: 'CMPT 473', courseTitle: 'HW/SW Co-Design' },
  { courseCode: 'CMPT 474', courseTitle: 'Data Science Principles' },
  { courseCode: 'CMPT 477', courseTitle: 'Data Mining' }
];

const DEMO_ACTIVITY = [
  { actor: { username: 'Gurv' }, message: 'Gurv posted in CMPT 373' },
  { actor: { username: 'AS' }, message: 'AS liked a post in CMPT 310' },
  { actor: { username: 'Harm' }, message: 'Harm replied in CMPT 295' },
];

const DEMO_POSTS = [
  {
    _id: 'demo-1',
    author: { username: 'AS' },
    text: 'Anyone else taking CMPT 373 this term? Looking for teammates!',
    likesCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-2',
    author: { username: 'Gurv' },
    text: 'Midterm tips: practice the AI heuristics problems.',
    likesCount: 5,
    createdAt: new Date().toISOString(),
  },
];
