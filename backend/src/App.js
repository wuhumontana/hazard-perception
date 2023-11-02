import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { checkToken, checkResearcherPermission } from "./util/token.js";
import Module from "./routes/modules.js";
import User from "./routes/users.js";
import Feedback from "./routes/feedbacks.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(checkToken);
app.use(helmet());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome to the Hazard Perception API!");
});
app.use("/users", User);
app.use("/modules", Module);
app.use("/feedbacks", Feedback);

app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});
// add routes that are being used

// Error handler
app.use((err, req, res, next) => {
  if (err) {
    // Token Authentication Error
    if (err.name === "UnauthorizedError") {
      res.status(401).json({ message: err.message || "Invalid token" });
    } else {
      // Other Error
      const code = err.status || 500;
      res.status(code).json({
        status: code,
        message: err.message || "Internal Server Error",
        data: err.data || {},
      });
    }
  }
  next();
});

export default app;
