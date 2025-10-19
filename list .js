require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// --- Middleware ---
app.use(helmet()); // Apply security headers
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Route Imports ---
// Placeholder for existing routes based on documentation
const aiRoutes = require("./routes/ai");
const paymentRoutes = require("./routes/payment");
const miniappRoutes = require("./routes/miniapp");
const whatsappRoutes = require("./routes/whatsapp");
const tripsRoutes = require("./routes/trips"); // <-- Import the new trips route

// --- Route Definitions ---
const apiPrefix = "/api";

// Existing routes (placeholders)
app.use(`${apiPrefix}/ai`, aiRoutes);
app.use(`${apiPrefix}/payment`, paymentRoutes);
app.use(`${apiPrefix}/miniapp`, miniappRoutes);
app.use(`${apiPrefix}/whatsapp`, whatsappRoutes);

// Integrate the new trips route
app.use(`${apiPrefix}/trips`, tripsRoutes); // <-- Register the new trips route

// --- Health Check Endpoint ---
app.get(`${apiPrefix}/health`, (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = app;
