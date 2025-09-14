import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase.config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("👾");
  const [category, setCategory] = useState("Robots");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        fullName,
        preferredLanguage: language,
        avatarUrl: avatar,
        avatarCategory: category,
        progress: {}
      });

      navigate("/"); // Redirect to login
    } catch (err) {
      setError(err.message);
    }
  };

  // Categorized avatars
  const avatarLibrary = {
    Robots: ["🤖", "🤖🛠️"],
    Fantasy: ["🧙‍♂️", "🧝‍♀️"],
    Heroes: ["🦸‍♂️", "🦸‍♀️"],
    Animals: ["🐱‍💻", "🐶"],
    Aliens: ["👾", "👹"]
  };

  const categories = Object.keys(avatarLibrary);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-xl rounded-xl">
        <h2 className="mb-6 text-4xl font-extrabold tracking-wide text-center text-blue-500">
          Create Your Profile
        </h2>

        {/* Avatar Preview */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-24 h-24 mb-2 text-4xl bg-gray-700 rounded-full ring-2 ring-blue-500">
            {avatar}
          </div>
          <p className="text-gray-300">{category} Avatar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block mb-1 text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full px-4 py-2 text-gray-200 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block mb-1 text-gray-300">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 text-gray-200 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 text-gray-200 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 text-gray-200 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Avatar Categories */}
          <div>
            <p className="mb-2 text-gray-300">Choose Avatar Category:</p>
            <div className="flex justify-between mb-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    category === c ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Avatars in category */}
            <div className="flex flex-wrap justify-center space-x-3">
              {avatarLibrary[category].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`px-3 py-2 rounded-lg text-3xl ${
                    avatar === a ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 mt-4 font-semibold text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

