
import { useState, useEffect } from "react";
import axios from "axios";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/profile", { withCredentials: true });
        setUser(res.data.user);
      } catch {
        setUser({ paid: false });
      }
    };
    fetchUser();
  }, []);

  return { user, setUser };
};
