const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const beneficiaryRoutes = require("./routes/beneficiaryRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(cookieParser());

// ---- API routes ----
app.use("/api/auth", authRoutes);
app.use("/api", departmentRoutes);
app.use("/api", beneficiaryRoutes);

app.use("/api", notFoundHandler);

// ---- Static frontend (same origin as the API, so the cookie just works) ----
const frontendPath = path.join(__dirname, "..", "Frontend");
app.use(express.static(frontendPath));
app.get("/", (req, res) => res.sendFile(path.join(frontendPath, "index.html")));

// ---- Central error handler (must be last) ----
app.use(errorHandler);

module.exports = app;
