require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const dns = require("dns");

const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const chatRoutes = require("./routes/chatRoutes");
const symptomRoutes = require("./routes/symptomRoutes");

const { requireAuth, requireRole } = require("./middleware/authMiddleware");
const { rateLimit } = require("./middleware/rateLimitMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Security + parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Apply a moderate global rate limit (100 req/min per IP)
app.use(rateLimit({ windowMs: 60 * 1000, maxRequests: 100 }));

const PORT = process.env.PORT || 8000;

// JWT_SECRET is mandatory for authentication to work.
if (!process.env.JWT_SECRET) {
  console.warn(
    "WARNING: JWT_SECRET is not set in the environment. " +
      "Authentication will fail. Add JWT_SECRET to your .env file."
  );
}

// ---------- MongoDB Atlas connection ----------
// Workaround: some ISP/corporate DNS resolvers fail to resolve MongoDB Atlas
// SRV records (_mongodb._tcp.<cluster>.mongodb.net), causing
// "querySrv ECONNREFUSED" at connect time. Using reliable public resolvers
// (process-scoped only - no OS-level configuration is changed) fixes this.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("DNS: using public resolvers (8.8.8.8, 1.1.1.1) for Atlas SRV resolution");
} catch (error) {
  console.warn("DNS: could not set public resolvers:", error.message);
}

if (!process.env.MONGO_USERNAME || !process.env.MONGO_CLUSTER) {
  console.error("MongoDB environment variables are missing. Check .env");
} else {
  const username = encodeURIComponent(process.env.MONGO_USERNAME);
  const password = encodeURIComponent(process.env.MONGO_PASSWORD || "");
  const MONGO_URI =
    `mongodb+srv://${username}:${password}@${process.env.MONGO_CLUSTER}/` +
    `${process.env.MONGO_DATABASE || "arogya_innovators"}?retryWrites=true&w=majority`;

  console.log("Connecting to MongoDB Atlas...");
  console.log("Cluster:", process.env.MONGO_CLUSTER);
  console.log("Database:", process.env.MONGO_DATABASE || "arogya_innovators");

  mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      family: 4
    })
    .then(() => {
      console.log("MongoDB Atlas connected successfully");
      console.log("Database:", mongoose.connection.name);
      seedPHCs();
    })
    .catch((error) => {
      console.error("MongoDB connection failed:");
      console.error(error.message);
    });
}

// ---------- Public routes ----------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Arogya Innovators Healthcare Chatbot API is running",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    server: "running",
    database: mongoose.connection.name || "not connected",
    databaseStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

/**
 * GET /api/phcs
 * Return PHC centers from database with optional filters.
 * Supports filtering: ?district=...&mandal=...
 */
app.get("/api/phcs", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.district) {
      const term = String(req.query.district).trim();
      const districtAliases = {
        anantapur: "Ananthapuramu",
        "dr. b.r. ambedkar konaseema": "Dr. B. R. Ambedkar Konaseema",
        "y.s.r. kadapa": "YSR Kadapa"
      };
      const normalizedTerm = districtAliases[term.toLowerCase()] || term;
      const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.district = new RegExp(escaped, "i");
      console.log("District term:", JSON.stringify(term));
      console.log("District regex:", JSON.stringify(query.district));
    }
    if (req.query.mandal) {
      const term = String(req.query.mandal).trim();
      query.mandal = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }

    const phcs = await PHC.find(query).sort({ district: 1, mandal: 1, name: 1 }).lean();
    console.log("PHC count:", phcs.length);

    res.status(200).json({
      success: true,
      count: phcs.length,
      data: phcs,
      note: "PHC data sourced from Andhra Pradesh government records."
    });
  } catch (error) {
    next(error);
  }
});

// ---------- Mounted API routers ----------
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/symptoms", symptomRoutes);

console.log("Routes mounted: /api/auth, /api/members, /api/chat, /api/symptoms");

// ---------- Admin-only route ----------
const Member = require("./models/Member");
const SymptomAssessment = require("./models/SymptomAssessment");
const PHC = require("./models/PHC");
const ChatSession = require("./models/ChatSession");

app.get(
  "/api/admin/stats",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const totalMembers = await Member.countDocuments();
      const totalAssessments = await SymptomAssessment.countDocuments();
      const emergencyCases = await SymptomAssessment.countDocuments({
        triageLevel: "EMERGENCY"
      });
      const totalChatSessions = await ChatSession.countDocuments();

      const recentAssessments = await SymptomAssessment.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("symptoms triageLevel language createdAt");

      res.status(200).json({
        success: true,
        stats: {
          totalMembers,
          totalAssessments,
          emergencyCases,
          totalChatSessions
        },
        recentAssessments
      });
    } catch (error) {
      next(error);
    }
  }
);

// ---------- Seed PHC data ----------
const PHC_SEED = [
  { name: "Paderu Area Hospital", district: "Alluri Sitharama Raju", mandal: "Paderu", type: "AH", phone: "" },
  { name: "Chintapalli PHC", district: "Alluri Sitharama Raju", mandal: "Chintapalli", type: "PHC", phone: "" },
  { name: "Rampachodavaram PHC", district: "Alluri Sitharama Raju", mandal: "Rampachodavaram", type: "PHC", phone: "" },
  { name: "Anakapalli District Hospital", district: "Anakapalli", mandal: "Anakapalli", type: "DH", phone: "" },
  { name: "Narsipatnam PHC", district: "Anakapalli", mandal: "Narsipatnam", type: "PHC", phone: "" },
  { name: "Payakaraopeta PHC", district: "Anakapalli", mandal: "Payakaraopeta", type: "PHC", phone: "" },
  { name: "Anantapur District Hospital", district: "Ananthapuramu", mandal: "Anantapur", type: "DH", phone: "" },
  { name: "Guntakal PHC", district: "Ananthapuramu", mandal: "Guntakal", type: "PHC", phone: "" },
  { name: "Hindupur PHC", district: "Ananthapuramu", mandal: "Hindupur", type: "PHC", phone: "" },
  { name: "Kadiri PHC", district: "Ananthapuramu", mandal: "Kadiri", type: "PHC", phone: "" },
  { name: "Rayachoti District Hospital", district: "Annamayya", mandal: "Rayachoti", type: "DH", phone: "" },
  { name: "Madanapalle PHC", district: "Annamayya", mandal: "Madanapalle", type: "PHC", phone: "" },
  { name: "Rajampeta PHC", district: "Annamayya", mandal: "Rajampeta", type: "PHC", phone: "" },
  { name: "Bapatla District Hospital", district: "Bapatla", mandal: "Bapatla", type: "DH", phone: "" },
  { name: "Chirala PHC", district: "Bapatla", mandal: "Chirala", type: "PHC", phone: "" },
  { name: "Repalle PHC", district: "Bapatla", mandal: "Repalle", type: "PHC", phone: "" },
  { name: "Chittoor District Hospital", district: "Chittoor", mandal: "Chittoor", type: "DH", phone: "" },
  { name: "Tirupati PHC", district: "Chittoor", mandal: "Tirupati", type: "PHC", phone: "" },
  { name: "Palamaner PHC", district: "Chittoor", mandal: "Palamaner", type: "PHC", phone: "" },
  { name: "Punganur PHC", district: "Chittoor", mandal: "Punganur", type: "PHC", phone: "" },
  { name: "Amalapuram District Hospital", district: "Dr. B. R. Ambedkar Konaseema", mandal: "Amalapuram", type: "DH", phone: "" },
  { name: "Razole PHC", district: "Dr. B. R. Ambedkar Konaseema", mandal: "Razole", type: "PHC", phone: "" },
  { name: "Kothapeta PHC", district: "Dr. B. R. Ambedkar Konaseema", mandal: "Kothapeta", type: "PHC", phone: "" },
  { name: "Rajahmundry District Hospital", district: "East Godavari", mandal: "Rajahmundry", type: "DH", phone: "" },
  { name: "Kakinada PHC", district: "East Godavari", mandal: "Kakinada", type: "PHC", phone: "" },
  { name: "Peddapuram PHC", district: "East Godavari", mandal: "Peddapuram", type: "PHC", phone: "" },
  { name: "Tuni PHC", district: "East Godavari", mandal: "Tuni", type: "PHC", phone: "" },
  { name: "Eluru District Hospital", district: "Eluru", mandal: "Eluru", type: "DH", phone: "" },
  { name: "Nuzvid PHC", district: "Eluru", mandal: "Nuzvid", type: "PHC", phone: "" },
  { name: "Jangareddigudem PHC", district: "Eluru", mandal: "Jangareddigudem", type: "PHC", phone: "" },
  { name: "Guntur District Hospital", district: "Guntur", mandal: "Guntur", type: "DH", phone: "" },
  { name: "Tenali PHC", district: "Guntur", mandal: "Tenali", type: "PHC", phone: "" },
  { name: "Mangalagiri PHC", district: "Guntur", mandal: "Mangalagiri", type: "PHC", phone: "" },
  { name: "Sattenapalle PHC", district: "Guntur", mandal: "Sattenapalle", type: "PHC", phone: "" },
  { name: "Kakinada District Hospital", district: "Kakinada", mandal: "Kakinada", type: "DH", phone: "" },
  { name: "Peddapuram PHC", district: "Kakinada", mandal: "Peddapuram", type: "PHC", phone: "" },
  { name: "Samalkota PHC", district: "Kakinada", mandal: "Samalkota", type: "PHC", phone: "" },
  { name: "Machilipatnam District Hospital", district: "Krishna", mandal: "Machilipatnam", type: "DH", phone: "" },
  { name: "Gudivada PHC", district: "Krishna", mandal: "Gudivada", type: "PHC", phone: "" },
  { name: "Vijayawada PHC", district: "Krishna", mandal: "Vijayawada", type: "PHC", phone: "" },
  { name: "Nandigama PHC", district: "Krishna", mandal: "Nandigama", type: "PHC", phone: "" },
  { name: "Kurnool District Hospital", district: "Kurnool", mandal: "Kurnool", type: "DH", phone: "" },
  { name: "Adoni PHC", district: "Kurnool", mandal: "Adoni", type: "PHC", phone: "" },
  { name: "Nandyal PHC", district: "Kurnool", mandal: "Nandyal", type: "PHC", phone: "" },
  { name: "Dhone PHC", district: "Kurnool", mandal: "Dhone", type: "PHC", phone: "" },
  { name: "Nandyal District Hospital", district: "Nandyal", mandal: "Nandyal", type: "DH", phone: "" },
  { name: "Atmakur PHC", district: "Nandyal", mandal: "Atmakur", type: "PHC", phone: "" },
  { name: "Allagadda PHC", district: "Nandyal", mandal: "Allagadda", type: "PHC", phone: "" },
  { name: "Banaganapalle PHC", district: "Nandyal", mandal: "Banaganapalle", type: "PHC", phone: "" },
  { name: "Vijayawada District Hospital", district: "NTR", mandal: "Vijayawada", type: "DH", phone: "" },
  { name: "Nandigama PHC", district: "NTR", mandal: "Nandigama", type: "PHC", phone: "" },
  { name: "Tiruvuru PHC", district: "NTR", mandal: "Tiruvuru", type: "PHC", phone: "" },
  { name: "Gannavaram PHC", district: "NTR", mandal: "Gannavaram", type: "PHC", phone: "" },
  { name: "Narasaraopet District Hospital", district: "Palnadu", mandal: "Narasaraopet", type: "DH", phone: "" },
  { name: "Sattenapalle PHC", district: "Palnadu", mandal: "Sattenapalle", type: "PHC", phone: "" },
  { name: "Gurazala PHC", district: "Palnadu", mandal: "Gurazala", type: "PHC", phone: "" },
  { name: "Vinukonda PHC", district: "Palnadu", mandal: "Vinukonda", type: "PHC", phone: "" },
  { name: "Parvathipuram District Hospital", district: "Parvathipuram Manyam", mandal: "Parvathipuram", type: "DH", phone: "" },
  { name: "Palakonda PHC", district: "Parvathipuram Manyam", mandal: "Palakonda", type: "PHC", phone: "" },
  { name: "Salur PHC", district: "Parvathipuram Manyam", mandal: "Salur", type: "PHC", phone: "" },
  { name: "Ongole District Hospital", district: "Prakasam", mandal: "Ongole", type: "DH", phone: "" },
  { name: "Markapur PHC", district: "Prakasam", mandal: "Markapur", type: "PHC", phone: "" },
  { name: "Kanigiri PHC", district: "Prakasam", mandal: "Kanigiri", type: "PHC", phone: "" },
  { name: "Chirala PHC", district: "Prakasam", mandal: "Chirala", type: "PHC", phone: "" },
  { name: "Srikakulam District Hospital", district: "Srikakulam", mandal: "Srikakulam", type: "DH", phone: "" },
  { name: "Palasa PHC", district: "Srikakulam", mandal: "Palasa", type: "PHC", phone: "" },
  { name: "Tekkali PHC", district: "Srikakulam", mandal: "Tekkali", type: "PHC", phone: "" },
  { name: "Ichapuram PHC", district: "Srikakulam", mandal: "Ichapuram", type: "PHC", phone: "" },
  { name: "Nellore District Hospital", district: "Sri Potti Sriramulu Nellore", mandal: "Nellore", type: "DH", phone: "" },
  { name: "Kavali PHC", district: "Sri Potti Sriramulu Nellore", mandal: "Kavali", type: "PHC", phone: "" },
  { name: "Gudur PHC", district: "Sri Potti Sriramulu Nellore", mandal: "Gudur", type: "PHC", phone: "" },
  { name: "Sullurpet PHC", district: "Sri Potti Sriramulu Nellore", mandal: "Sullurpet", type: "PHC", phone: "" },
  { name: "Puttaparthi District Hospital", district: "Sri Sathya Sai", mandal: "Puttaparthi", type: "DH", phone: "" },
  { name: "Dharmavaram PHC", district: "Sri Sathya Sai", mandal: "Dharmavaram", type: "PHC", phone: "" },
  { name: "Penukonda PHC", district: "Sri Sathya Sai", mandal: "Penukonda", type: "PHC", phone: "" },
  { name: "Kadiri PHC", district: "Sri Sathya Sai", mandal: "Kadiri", type: "PHC", phone: "" },
  { name: "Tirupati District Hospital", district: "Tirupati", mandal: "Tirupati", type: "DH", phone: "" },
  { name: "Srikalahasti PHC", district: "Tirupati", mandal: "Srikalahasti", type: "PHC", phone: "" },
  { name: "Puttur PHC", district: "Tirupati", mandal: "Puttur", type: "PHC", phone: "" },
  { name: "Nagari PHC", district: "Tirupati", mandal: "Nagari", type: "PHC", phone: "" },
  { name: "Visakhapatnam District Hospital", district: "Visakhapatnam", mandal: "Visakhapatnam", type: "DH", phone: "" },
  { name: "Bheemunipatnam PHC", district: "Visakhapatnam", mandal: "Bheemunipatnam", type: "PHC", phone: "" },
  { name: "Anakapalli PHC", district: "Visakhapatnam", mandal: "Anakapalli", type: "PHC", phone: "" },
  { name: "Vizianagaram District Hospital", district: "Vizianagaram", mandal: "Vizianagaram", type: "DH", phone: "" },
  { name: "Bobbili PHC", district: "Vizianagaram", mandal: "Bobbili", type: "PHC", phone: "" },
  { name: "Salur PHC", district: "Vizianagaram", mandal: "Salur", type: "PHC", phone: "" },
  { name: "Bhimavaram District Hospital", district: "West Godavari", mandal: "Bhimavaram", type: "DH", phone: "" },
  { name: "Narasapuram PHC", district: "West Godavari", mandal: "Narasapuram", type: "PHC", phone: "" },
  { name: "Tadepalligudem PHC", district: "West Godavari", mandal: "Tadepalligudem", type: "PHC", phone: "" },
  { name: "Kovvur PHC", district: "West Godavari", mandal: "Kovvur", type: "PHC", phone: "" },
  { name: "Kadapa District Hospital", district: "YSR Kadapa", mandal: "Kadapa", type: "DH", phone: "" },
  { name: "Pulivendula PHC", district: "YSR Kadapa", mandal: "Pulivendula", type: "PHC", phone: "" },
  { name: "Badvel PHC", district: "YSR Kadapa", mandal: "Badvel", type: "PHC", phone: "" },
  { name: "Jammalamadugu PHC", district: "YSR Kadapa", mandal: "Jammalamadugu", type: "PHC", phone: "" }
];

async function seedPHCs() {
  try {
    const count = await PHC.countDocuments();
    if (count > 0) {
      console.log(`PHC seed skipped: ${count} records already exist.`);
      return;
    }

    await PHC.insertMany(PHC_SEED);
    console.log(`PHC seed completed: ${PHC_SEED.length} PHCs inserted.`);
  } catch (error) {
    console.error("PHC seed failed:", error.message);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});