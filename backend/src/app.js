const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const mongoose = require("mongoose");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const entityMiddleware = require("./middlewares/entity.middleware");

require("./models/Role");
require("./models/Entity");
require("./models/User");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

if (!mongoose.Model.cpopulate && mongoose.Model.populate) {
  mongoose.Model.cpopulate = mongoose.Model.populate;
}

app.use("/api", routes);
// Apply entity middleware to all /api/v1 routes (skips /auth/login inside middleware)
app.use("/api/v1", entityMiddleware);
app.use("/api/v1", routes);

// Additional routes for specific modules (e.g. payroll)
app.use("/api/deduction-types", require("./routes/deductionType.routes"));
app.use(
  "/api/employee-deductions",
  require("./routes/employeeDeduction.routes"),
);
app.use("/api/payroll-runs", require("./routes/payrollRun.routes"));

app.use(errorMiddleware);

module.exports = app;
