const express = require("express");
const router = express.Router();
const { initializeApp, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const User = require("../models/User");

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "resuai-da972",
  });
}

// Middleware to verify Firebase ID Token
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    // Find user in our DB by email or firebase UID
    const email = decodedToken.email;
    let user = null;
    if (email) {
      user = await User.findOne({
        $or: [{ email: email }, { email: email.toLowerCase() }],
      });
    }
    if (!user && decodedToken.uid) {
      user = await User.findOne({ password: decodedToken.uid });
    }
    
    if (!user) {
      // Auto-provision user in MongoDB if they signed in through Firebase
      try {
        user = await User.create({
          fullName: decodedToken.name || (email ? email.split("@")[0] : "User"),
          email: (email || `${decodedToken.uid}@firebase.user`).toLowerCase(),
          photo: decodedToken.picture || "",
          emailVerified: Boolean(decodedToken.email_verified),
          password: decodedToken.uid || Math.random().toString(36).slice(-8),
        });
      } catch (_createErr) {
        user = await User.findOne({
          $or: [
            { email: email },
            { email: (email || "").toLowerCase() },
            { password: decodedToken.uid },
          ],
        });
      }
    }
    
    req.user = {
      id: user?._id,
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    req.userId = user?._id; // backwards compatibility
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Optional token middleware for public features (like AI assistant, ATS check)
const optionalAuthenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    req.user = null;
    req.userId = null;
    return next();
  }
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const email = decodedToken.email;
    let user = null;
    if (email) {
      user = await User.findOne({
        $or: [{ email: email }, { email: email.toLowerCase() }],
      });
    }
    if (!user && decodedToken.uid) {
      user = await User.findOne({ password: decodedToken.uid });
    }
    req.user = {
      id: user?._id,
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    req.userId = user?._id;
    next();
  } catch {
    req.user = null;
    req.userId = null;
    next();
  }
};

// GET current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    if (!req.user.id) {
       return res.status(404).json({ message: "User not fully registered in DB" });
    }
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

const validate = require("../middlewares/validate");

// Register / Create User in DB (called after Firebase Auth signup)
router.post(
  "/register",
  validate({ fullName: "string", email: "string" }),
  async (req, res) => {
    try {
      const { fullName, email, photo, gender, uid } = req.body;

      let user = await User.findOne({ email });

      if (user) {
        return res.status(200).json({ message: "User already exists", userId: user._id });
      }

      user = await User.create({
        fullName,
        email,
        photo: photo || "",
        gender: gender || "other",
        emailVerified: true,
        password: uid || Math.random().toString(36).slice(-8)
      });

      res.status(201).json({
        message: "User created.",
        userId: user._id,
      });
    } catch (err) {
      console.error("Register route error:", err);
      res.status(500).json({ message: "Failed to register user record" });
    }
  }
);

// POST /login is intentionally removed.
// All authentication goes through Firebase Auth.
// The authenticateToken middleware auto-provisions MongoDB users when
// a valid Firebase ID token is presented for the first time.

router.get("/photo/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email }).select("photo");
    if (!user || !user.photo) {
      return res.status(404).json({ message: "Photo not found" });
    }
    res.json({ photo: user.photo });
  } catch (err) {
    res.status(500).json({ message: "Error fetching photo" });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.optionalAuthenticateToken = optionalAuthenticateToken;
