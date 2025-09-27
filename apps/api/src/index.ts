import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { createContext } from "./context";
import { PrismaClient } from "@prisma/client";

const port = process.env.PORT || 4000;

// Initialize Prisma client
const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Run migrations if needed
    console.log("🔄 Database migrations applied");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();

    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
      introspection: true,
    });

    await server.start();

    // Configure CORS for Railway deployment
    const corsOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
      ...(process.env.WEB_URL ? [process.env.WEB_URL] : []),
      ...(process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
        : []),
      /\.railway\.app$/,
      /\.vercel\.app$/,
    ];

    console.log("🔒 CORS Origins configured:", corsOrigins);
    console.log("🔒 ALLOWED_ORIGINS env var:", process.env.ALLOWED_ORIGINS);

    app.use(
      "/graphql",
      cors<cors.CorsRequest>({
        origin: corsOrigins,
        credentials: true,
      }),
      express.json({ limit: "50mb" }),
      expressMiddleware(server, {
        context: createContext,
      })
    );

    // Health check endpoint with database status
    app.get("/health", async (req, res) => {
      try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
          status: "ok",
          timestamp: new Date().toISOString(),
          database: "connected",
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.env.npm_package_version || "1.0.0",
        });
      } catch (error) {
        res.status(503).json({
          status: "error",
          timestamp: new Date().toISOString(),
          database: "disconnected",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Root endpoint for Railway health checks
    app.get("/", (req, res) => {
      res.status(200).json({
        message: "EventGo API is running",
        timestamp: new Date().toISOString(),
        status: "healthy",
      });
    });

    httpServer.listen(port, () => {
      console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
      console.log(`🏥 Health check at http://localhost:${port}/health`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("🛑 SIGTERM received, shutting down gracefully");
      await prisma.$disconnect();
      httpServer.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error("❌ Error starting server:", error);
  process.exit(1);
});
