import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    if (req.method === "GET") {
      // Get user's daily check-ins
      const { days = 30 } = req.query;

      const checkins = await sql`
        SELECT * FROM daily_checkins 
        WHERE user_id = ${decoded.userId}
        AND date >= NOW() - INTERVAL '${days} days'
        ORDER BY date DESC
      `;

      res.status(200).json({
        success: true,
        checkins,
      });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Check-ins API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
