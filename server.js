// Aurora University web application.
// Express serves the website and connects its account and admissions features to MongoDB.
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const mongoClient = new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017");
const DB_NAME = process.env.DB_NAME || "aurora_university";
let db;
let users;
let courses;
let applications;

const universityCourses = [
  {
    id: 1,
    name: "BSc Computer Science",
    department: "Computing & Technology",
    description: "Study programming, algorithms, databases, web development and the foundations of computing.",
    estimatedFee: 1250000,
  },
  {
    id: 2,
    name: "BSc Software Engineering",
    department: "Computing & Technology",
    description: "Build practical skills in designing, testing, deploying and maintaining software systems.",
    estimatedFee: 1300000,
  },
  {
    id: 3,
    name: "BSc Cybersecurity",
    department: "Computing & Technology",
    description: "Explore network security, secure systems, digital forensics and responsible threat analysis.",
    estimatedFee: 1350000,
  },
  {
    id: 4,
    name: "BSc Information Technology",
    department: "Computing & Technology",
    description: "Learn how organisations use infrastructure, applications and data to solve practical problems.",
    estimatedFee: 1200000,
  },
  {
    id: 5,
    name: "BSc Business Administration",
    department: "Business & Management",
    description: "Study management, marketing, accounting and the principles behind successful organisations.",
    estimatedFee: 980000,
  },
  {
    id: 6,
    name: "BSc Accounting",
    department: "Business & Management",
    description: "Develop a foundation in financial reporting, auditing, taxation and business finance.",
    estimatedFee: 950000,
  },
  {
    id: 7,
    name: "BSc Marketing",
    department: "Business & Management",
    description: "Explore consumer behaviour, brand strategy, market research and digital marketing.",
    estimatedFee: 930000,
  },
  {
    id: 8,
    name: "BSc Economics",
    department: "Business & Management",
    description: "Understand markets, economic policy, data analysis and decisions made by households and firms.",
    estimatedFee: 990000,
  },
  {
    id: 9,
    name: "BSc Mass Communication",
    department: "Arts & Communication",
    description: "Explore media writing, journalism, public relations, broadcasting and digital communication.",
    estimatedFee: 900000,
  },
  {
    id: 10,
    name: "BA English and Literary Studies",
    department: "Arts & Communication",
    description: "Develop skills in critical reading, writing, language, literary analysis and communication.",
    estimatedFee: 880000,
  },
  {
    id: 11,
    name: "BSc Biology",
    department: "Science",
    description: "Study living systems, ecology, genetics, cell biology and laboratory methods.",
    estimatedFee: 1050000,
  },
  {
    id: 12,
    name: "BSc Biochemistry",
    department: "Science",
    description: "Examine the chemical processes of living organisms through biology, chemistry and laboratory work.",
    estimatedFee: 1120000,
  },
  {
    id: 13,
    name: "BSc Microbiology",
    department: "Science",
    description: "Learn about microorganisms, infection, environmental microbiology and applied laboratory techniques.",
    estimatedFee: 1080000,
  },
  {
    id: 14,
    name: "BSc Mathematics",
    department: "Science",
    description: "Strengthen analytical thinking through calculus, statistics, modelling and mathematical reasoning.",
    estimatedFee: 960000,
  },
  {
    id: 15,
    name: "BSc Public Health",
    department: "Health & Life Sciences",
    description: "Explore health promotion, disease prevention, community health and public health research.",
    estimatedFee: 1180000,
  },
  {
    id: 16,
    name: "BSc Environmental Management",
    department: "Environment & Sustainability",
    description: "Study environmental assessment, conservation, sustainability and the management of natural resources.",
    estimatedFee: 1020000,
  },
];

async function connectDatabase() {
  await mongoClient.connect();
  db = mongoClient.db(DB_NAME);
  users = db.collection("users");
  courses = db.collection("courses");
  applications = db.collection("applications");
  await users.createIndex({ email: 1 }, { unique: true });
  await courses.createIndex({ id: 1 }, { unique: true });
  await applications.createIndex({ referenceCode: 1 }, { unique: true });
  await applications.createIndex({ userId: 1, createdAt: -1 });

  // Keep the course catalogue current without duplicating existing records.
  for (const course of universityCourses) {
    await courses.updateOne({ id: course.id }, { $set: course }, { upsert: true });
  }
  console.log(`Connected to MongoDB database: ${DB_NAME}`);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "aurora-local-session-secret-change-before-deployment",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 2 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, "public")));

// The browser uses this route to see whether someone is logged in.
app.get("/api/me", (req, res) => {
  if (!req.session.user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: req.session.user });
});

// Signup
app.post("/api/signup", async (req, res) => {
  const { fullName, email, phone, password, confirmPassword } = req.body;
  const name = String(fullName || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPhone = String(phone || "").trim();
  const pass = String(password || "");

  if (!name || name.length < 2 || name.length > 100) return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ message: "Enter a valid email address." });
  if (!/^\+?[0-9][0-9\s-]{8,14}$/.test(cleanPhone)) {
    return res.status(400).json({
      message: "Enter a phone number with 9–15 digits (you may use +, spaces or hyphens).",
    });
  }
  const passwordIsValid =
    pass.length >= 8 &&
    /[A-Z]/.test(pass) &&
    /[a-z]/.test(pass) &&
    /[0-9]/.test(pass) &&
    /[^A-Za-z0-9]/.test(pass);
  if (!passwordIsValid) {
    return res.status(400).json({
      message: "Password needs 8+ characters, uppercase, lowercase, a number and a special character.",
    });
  }
  if (!confirmPassword) return res.status(400).json({ message: "Please confirm your password." });
  if (pass !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });

  try {
    const existing = await users.findOne({ email: cleanEmail });
    if (existing) return res.status(409).json({ message: "That email is already registered. Please log in instead." });
    const passwordHash = await bcrypt.hash(pass, 10);
    await users.insertOne({ fullName: name, email: cleanEmail, phone: cleanPhone, passwordHash, createdAt: new Date() });
    res.status(201).json({ message: "Account created. You can now log in." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "That email is already registered. Please log in instead." });
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "We could not create the account. Please try again." });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password) return res.status(400).json({ message: "Enter your email and password." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });

  try {
    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ message: "We couldn't find an account with that email." });
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return res.status(401).json({ message: "The password is incorrect." });
    req.session.regenerate((error) => {
      if (error) return res.status(500).json({ message: "Could not start your session. Please try again." });
      req.session.user = { id: user._id.toString(), fullName: user.fullName, email: user.email, phone: user.phone };
      const returnTo = ["dashboard.html", "apply.html"].includes(req.body.returnTo) ? req.body.returnTo : "dashboard.html";
      res.json({ message: "Login successful.", redirect: returnTo });
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login is temporarily unavailable." });
  }
});

// Password recovery returns a clear message because email delivery is not configured.
app.post("/api/forgot-password", (req, res) => {
  res.json({ message: "Password recovery is currently unavailable. Please contact the admissions office for assistance." });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "You have logged out." });
  });
});

app.get("/api/courses", async (req, res) => {
  try {
    const courseList = await courses
      .find(
        {},
        {
          projection: {
            _id: 0,
            id: 1,
            name: 1,
            department: 1,
            description: 1,
            estimatedFee: 1,
          },
        }
      )
      .sort({ department: 1, name: 1 })
      .toArray();
    res.json(courseList);
  } catch (error) {
    console.error("Courses error:", error.message);
    res.status(500).json({ message: "Could not load courses. Check the database setup." });
  }
});

function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ message: "Please log in to continue." });
  next();
}

app.get("/api/dashboard", requireLogin, async (req, res) => {
  try {
    const user = await users.findOne({ _id: new ObjectId(req.session.user.id) }, { projection: { passwordHash: 0 } });
    if (!user) return res.status(401).json({ message: "Please log in to continue." });
    const userApplications = await applications.find({ userId: user._id.toString() }).sort({ createdAt: -1 }).toArray();
    const joinedApplications = await Promise.all(userApplications.map(async (application) => {
      const course = await courses.findOne({ id: application.courseId });
      return {
        id: application._id.toString(), referenceCode: application.referenceCode,
        applicantName: application.applicantName, applicantEmail: application.applicantEmail,
        age: application.age, statementText: application.statementText,
        status: application.status, createdAt: application.createdAt,
        courseName: course ? course.name : "Course unavailable",
        department: course ? course.department : "",
        estimatedFee: course ? course.estimatedFee : 0
      };
    }));
    res.json({
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
      applications: joinedApplications,
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({ message: "Could not load dashboard information." });
  }
});

app.put("/api/profile", requireLogin, async (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const phone = String(req.body.phone || "").trim();
  if (fullName.length < 2 || fullName.length > 100) return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
  if (!/^\+?[0-9][0-9\s-]{8,14}$/.test(phone)) return res.status(400).json({ message: "Enter a valid phone number." });
  try {
    await users.updateOne({ _id: new ObjectId(req.session.user.id) }, { $set: { fullName, phone } });
    req.session.user.fullName = fullName;
    req.session.user.phone = phone;
    res.json({ message: "Profile updated." });
  } catch (error) {
    res.status(500).json({ message: "Could not update your profile." });
  }
});

app.post("/api/applications", requireLogin, async (req, res) => {
  const applicantName = String(req.body.applicantName || "").trim();
  const applicantEmail = String(req.body.applicantEmail || "").trim().toLowerCase();
  const age = Number(req.body.age);
  const courseId = Number(req.body.courseId);
  const statementText = String(req.body.statementText || "").trim();
  if (applicantName.length < 2 || applicantName.length > 100) return res.status(400).json({ message: "Enter the applicant's full name." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail)) return res.status(400).json({ message: "Enter a valid applicant email." });
  if (!Number.isInteger(age) || age < 16 || age > 100) return res.status(400).json({ message: "Age must be a number between 16 and 100." });
  if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: "Please select a valid course." });
  if (statementText.length < 10 || statementText.length > 1000) {
    return res.status(400).json({
      message: "Please write 10–1000 characters about why you chose this course.",
    });
  }

  try {
    const course = await courses.findOne({ id: courseId });
    if (!course) return res.status(400).json({ message: "That course is not available." });
    const referenceCode = "AU-" + Date.now().toString().slice(-8) + "-" + Math.floor(100 + Math.random() * 900);
    const result = await applications.insertOne({
      referenceCode, userId: req.session.user.id, courseId,
      applicantName, applicantEmail, age, statementText,
      status: "Submitted", createdAt: new Date()
    });
    res.status(201).json({ message: "Your application has been submitted.", referenceCode, applicationId: result.insertedId.toString() });
  } catch (error) {
    console.error("Application error:", error.message);
    res.status(500).json({ message: "Could not submit your application." });
  }
});

app.post("/api/applications/:id/cancel", requireLogin, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid application." });
  try {
    const result = await applications.updateOne(
      { _id: new ObjectId(req.params.id), userId: req.session.user.id, status: "Submitted" },
      { $set: { status: "Cancelled" } }
    );
    if (!result.modifiedCount) {
      return res.status(400).json({
        message: "Only your own applications with Submitted status can be cancelled.",
      });
    }
    res.json({ message: "Application cancelled." });
  } catch (error) {
    res.status(500).json({ message: "Could not cancel application." });
  }
});

connectDatabase().then(() => {
  app.listen(PORT, () => console.log(`Aurora University is running at http://localhost:${PORT}`));
}).catch((error) => {
  console.error("Could not connect to MongoDB:", error.message);
  console.error("Check MONGODB_URI and make sure MongoDB is running.");
  process.exit(1);
});
