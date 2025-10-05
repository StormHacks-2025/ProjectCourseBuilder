import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Builder from "./pages/Builder.jsx";
import Community from "./pages/Community.jsx";
import Settings from "./pages/Settings.jsx";
import { Pricing } from "./pages/Pricing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/SignUp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Standalone Login route */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="builder" element={<Builder />} />
          <Route path="community" element={<Community />} />
          <Route path="settings" element={<Settings />} />
          <Route path="pricing" element={<Pricing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
