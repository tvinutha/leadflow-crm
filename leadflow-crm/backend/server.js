const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
connectDB();

const app = express();   // 👈 MUST come before routes

const leadRoutes = require("./routes/leadRoutes");
const authRoutes = require("./routes/authRoutes");
app.use(cors());
app.use(express.json());

// routes
app.use("/api/leads", leadRoutes);
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});