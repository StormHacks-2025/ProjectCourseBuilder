// Utility functions for authentication
// Handles localStorage and cookie management

export function setAuthData(user) {
  // Save user to localStorage
  localStorage.setItem("user", JSON.stringify(user));

  // Set cookie (expires in 7 days)
  document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${7 * 24 * 60 * 60}`;
}

export function getAuthData() {
  // Try localStorage first
  const user = localStorage.getItem("user");
  if (user) return JSON.parse(user);

  // Fallback to cookie
  const match = document.cookie.match(/user=([^;]+)/);
  if (match) return JSON.parse(decodeURIComponent(match[1]));
  return null;
}

export function clearAuthData() {
  localStorage.removeItem("user");
  document.cookie = "user=; path=/; max-age=0";
}
