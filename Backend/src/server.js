import express from "express";
import path from "path";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import { cleanExpiredSessions } from "./controllers/sessionController.js";
import { protectRoute } from "./middleware/protectRoute.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  ENV.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const corsOriginHandler = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, Postman, server-to-server)
  if (!origin) return callback(null, true);

  const isAllowed =
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    (ENV.NODE_ENV !== "production" && origin.includes("localhost"));

  if (isAllowed) {
    return callback(null, true);
  } else {
    return callback(new Error(`CORS policy violation: Origin ${origin} is not allowed`));
  }
};

const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Store real-time state for active sessions:
// sessionId -> { code, selectedLanguage, selectedProblemId }
const sessionStates = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-session", ({ sessionId, user }) => {
    if (!sessionId) return;
    socket.join(sessionId);
    socket.sessionId = sessionId;

    // Send existing state if available for this session
    const currentState = sessionStates.get(sessionId);
    if (currentState) {
      socket.emit("sync-session-state", currentState);
    }
  });

  socket.on("code-change", ({ sessionId, code }) => {
    if (!sessionId) return;
    let currentState = sessionStates.get(sessionId);
    if (!currentState) {
      currentState = {};
      sessionStates.set(sessionId, currentState);
    }
    currentState.code = code;

    socket.to(sessionId).emit("code-update", { code });
  });

  socket.on("problem-change", ({ sessionId, problemId, starterCode }) => {
    if (!sessionId) return;
    let currentState = sessionStates.get(sessionId);
    if (!currentState) {
      currentState = {};
      sessionStates.set(sessionId, currentState);
    }
    currentState.selectedProblemId = problemId;
    if (starterCode !== undefined) {
      currentState.code = starterCode;
    }

    socket.to(sessionId).emit("problem-update", { problemId, starterCode });
  });

  socket.on("language-change", ({ sessionId, language, starterCode }) => {
    if (!sessionId) return;
    let currentState = sessionStates.get(sessionId);
    if (!currentState) {
      currentState = {};
      sessionStates.set(sessionId, currentState);
    }
    currentState.selectedLanguage = language;
    if (starterCode !== undefined) {
      currentState.code = starterCode;
    }

    socket.to(sessionId).emit("language-update", { language, starterCode });
  });

  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        const roomSockets = io.sockets.adapter.rooms.get(room);
        // If this is the last socket leaving the room, clean up in-memory state after 5 mins
        if (roomSockets && roomSockets.size <= 1) {
          setTimeout(() => {
            const activeRoom = io.sockets.adapter.rooms.get(room);
            if (!activeRoom || activeRoom.size === 0) {
              sessionStates.delete(room);
            }
          }, 5 * 60 * 1000);
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const __dirname = path.resolve();

// middleware
app.use(express.json());
// credentials:true allows cross-origin auth tokens and headers
app.use(cors({ origin: corsOriginHandler, credentials: true }));
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const startServer = async () => {
  try {
    server.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
    await connectDB();

    // Periodically clean up sessions that have been unused for 30 minutes
    setInterval(() => {
      cleanExpiredSessions();
    }, 2 * 60 * 1000);
  } catch (error) {
    console.error("Error during server startup / DB connection", error);
  }
};

startServer();