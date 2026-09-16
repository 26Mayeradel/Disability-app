const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const beneficiaryRoutes = require("./routes/beneficiaryRoutes");

const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);

app.use("/api", departmentRoutes);

app.use("/api", beneficiaryRoutes);

app.use("/api", notFoundHandler);

// Error handler
app.use(errorHandler);

module.exports = app;
