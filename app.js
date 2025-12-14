const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) =>
  res.json({ ok: true, name: "zentroverse-telecalling-backend-plain" })
);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "zentroverse-bpo-backend",
    time: new Date().toISOString(),
  });
});
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/leads", require("./routes/lead.routes"));
app.use("/api/calls", require("./routes/call.routes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
