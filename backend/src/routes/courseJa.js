// backend/routes/courses.js
import express from "express";
import axios from "axios";
import NodeCache from "node-cache";

const router = express.Router();
const BASE_URL = "http://www.sfu.ca/bin/wcm/course-outlines";

// Cache with 1 hour TTL (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Helper function to get cached data or fetch
const getCachedOrFetch = async (key, fetchFn) => {
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }
  const data = await fetchFn();
  cache.set(key, data);
  return data;
};

// Get list of years
router.get("/years", async (req, res) => {
  try {
    const data = await getCachedOrFetch("years", async () => {
      const response = await axios.get(BASE_URL, { timeout: 5000 });
      return response.data;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    const status = err.response?.status || 500;
    res.status(status).json({ error: "Failed to fetch years" });
  }
});

// Get list of terms for a given year
router.get("/terms/:year", async (req, res) => {
  const { year } = req.params;
  try {
    const data = await getCachedOrFetch(`terms-${year}`, async () => {
      const response = await axios.get(`${BASE_URL}?${year}`, {
        timeout: 5000,
      });
      return response.data;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    const status = err.response?.status || 500;
    res.status(status).json({ error: "Terms not found" });
  }
});

// Get departments for a given year and term
router.get("/departments/:year/:term", async (req, res) => {
  const { year, term } = req.params;
  try {
    const data = await getCachedOrFetch(
      `departments-${year}-${term}`,
      async () => {
        const response = await axios.get(`${BASE_URL}?${year}/${term}`, {
          timeout: 5000,
        });
        return response.data;
      }
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    const status = err.response?.status || 500;
    res.status(status).json({ error: "Departments not found" });
  }
});

// Get course numbers for a given department
router.get("/courses/:year/:term/:department", async (req, res) => {
  const { year, term, department } = req.params;
  try {
    const data = await getCachedOrFetch(
      `courses-${year}-${term}-${department}`,
      async () => {
        const response = await axios.get(
          `${BASE_URL}?${year}/${term}/${department}`,
          { timeout: 5000 }
        );
        return response.data;
      }
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    const status = err.response?.status || 500;
    res.status(status).json({ error: "Courses not found" });
  }
});

// Get course sections for a given course number
router.get(
  "/sections/:year/:term/:department/:courseNumber",
  async (req, res) => {
    const { year, term, department, courseNumber } = req.params;
    try {
      const data = await getCachedOrFetch(
        `sections-${year}-${term}-${department}-${courseNumber}`,
        async () => {
          const response = await axios.get(
            `${BASE_URL}?${year}/${term}/${department}/${courseNumber}`,
            { timeout: 5000 }
          );
          return response.data;
        }
      );
      res.json(data);
    } catch (err) {
      console.error(err);
      const status = err.response?.status || 500;
      res.status(status).json({ error: "Sections not found" });
    }
  }
);

// Get full course outline for a specific section
router.get(
  "/outline/:year/:term/:department/:courseNumber/:section",
  async (req, res) => {
    const { year, term, department, courseNumber, section } = req.params;
    try {
      const data = await getCachedOrFetch(
        `outline-${year}-${term}-${department}-${courseNumber}-${section}`,
        async () => {
          const response = await axios.get(
            `${BASE_URL}?${year}/${term}/${department}/${courseNumber}/${section}`,
            { timeout: 5000 }
          );
          return response.data;
        }
      );
      res.json(data);
    } catch (err) {
      console.error(err);
      const status = err.response?.status || 500;
      res.status(status).json({ error: "Course outline not found" });
    }
  }
);

// Search courses across all departments (for autocomplete)
// backend/routes/courses.js - Replace the search endpoint with this:

router.get("/search/:year/:term", async (req, res) => {
  const { year, term } = req.params;
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json([]);
  }

  try {
    // Extract department from search query (e.g., "cmpt 120" -> "cmpt")
    const searchLower = q.toLowerCase().trim();
    const parts = searchLower.split(/\s+/);
    const deptGuess = parts[0];

    // Get all departments
    const depts = await getCachedOrFetch(
      `departments-${year}-${term}`,
      async () => {
        const response = await axios.get(`${BASE_URL}?${year}/${term}`, {
          timeout: 5000,
        });
        return response.data;
      }
    );

    // Filter to likely departments based on search
    const relevantDepts = depts.filter(d => 
      d.value.toLowerCase().includes(deptGuess) ||
      d.text.toLowerCase().includes(searchLower)
    );

    // If no specific dept match, use all depts (but limit to first 5)
    const deptsToSearch = relevantDepts.length > 0 
      ? relevantDepts 
      : depts.slice(0, 5);

    // Fetch courses from relevant departments
    const allCourses = [];
    for (const dept of deptsToSearch) {
      try {
        const courses = await getCachedOrFetch(
          `courses-${year}-${term}-${dept.value}`,
          async () => {
            const response = await axios.get(
              `${BASE_URL}?${year}/${term}/${dept.value}`,
              { timeout: 5000 }
            );
            return response.data;
          }
        );
        allCourses.push(
          ...courses.map((c) => ({ ...c, department: dept.value }))
        );
      } catch (err) {
        console.error(`Failed to fetch courses for ${dept.value}:`, err.message);
        // Continue with other departments
      }
    }

    // Filter by search query
    const filtered = allCourses.filter(
      (c) =>
        c.text.toLowerCase().includes(searchLower) ||
        c.title?.toLowerCase().includes(searchLower) ||
        `${c.department} ${c.value}`.toLowerCase().includes(searchLower)
    );

    // Limit results
    res.json(filtered.slice(0, 50));
  } catch (err) {
    console.error("Search error:", err);
    const status = err.response?.status || 500;
    res.status(status).json({ error: "Search failed", details: err.message });
  }
});

export default router;
