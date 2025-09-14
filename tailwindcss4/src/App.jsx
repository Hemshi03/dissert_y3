import React, { useState } from 'react';    
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/login";
import SignUpPage from "./components/signuppage";
import BlankPage from "./pages/homepage";
import Chapter1 from "./pages/chapter1";
import Dashboard from "./pages/dashboard";
import GameComponent from "./GameComponent"; // Import GameComponent
import Leaderboard from "./pages/leaderboard";
import AboutUs from './pages/aboutus';
import Admin from "./pages/admin";
import McqPage1 from "./pages/McqPage1";



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/blank" element={<BlankPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chapter1" element={<Chapter1 />} />
        <Route path="/game" element={<GameComponent />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/McqPage1" element={<McqPage1 />} />
      </Routes>
    </Router>
  );
}
