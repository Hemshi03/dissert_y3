import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase.config";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage({ setUserProgress }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const persistence = remember ? browserLocalPersistence : browserSessionPersistence;

    setPersistence(auth, persistence)
      .then(() => signInWithEmailAndPassword(auth, email, password))
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Fetch user progress
        const userRef = doc(db, "user_progress", user.uid);
        let userSnap = await getDoc(userRef);
        let progressData;

        if (userSnap.exists()) {
          progressData = userSnap.data();
        } else {
          // If missing, initialize top-level progress
          await setDoc(userRef, {
            uid: user.uid,
            completedLevels: [],
            completedMCQs: [],
            currentChapter: 1,
            hintsUsed: 0,
            mana: 100,
            rank: "Novice",
            totalxp: 0,
            createdAt: new Date(),
          });
          progressData = (await getDoc(userRef)).data();
        }

        if (setUserProgress) setUserProgress(progressData);

        navigate("/blank"); // Redirect after login
      })
      .catch((err) => setError(err.message));
  };

  const handleForgotPassword = () => {
    if (!resetEmail) {
      setError("Please enter your email to reset password.");
      return;
    }
    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setMessage("Password reset email sent! Check your inbox.");
        setModalOpen(false);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-xl rounded-xl">
        <h2 className="mb-8 text-4xl font-extrabold tracking-wide text-center text-blue-500">
          Welcome to KODEDGE
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-gray-200 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-gray-200 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-between text-gray-300">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-400">{message}</p>}

          <button
            type="submit"
            className="w-full py-3 font-semibold text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      {/* Modal for password reset */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm p-6 bg-gray-800 rounded-lg shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-blue-500">Reset Password</h3>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-4 py-2 mb-4 text-gray-200 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-200 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


