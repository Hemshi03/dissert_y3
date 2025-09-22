const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");

// Routes
const chapterRoutes = require("./routes/chapterRoutes");
const userProgressRoutes = require("./routes/userProgress");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Firebase setup
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
app.set("db", db); // make db accessible in routes

// Use routes
app.use("/api/chapters", chapterRoutes);
app.use("/api/user-progress", userProgressRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("KODEDGE Backend is running 🚀");
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));

