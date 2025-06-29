import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Add CORS headers for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password required" });
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({ error: "Account with this email already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const newUsers = await sql`
      INSERT INTO users (name, email, password_hash, email_verified, created_at)
      VALUES (${name}, ${email.toLowerCase()}, ${passwordHash}, true, NOW())
      RETURNING id, name, email, email_verified, created_at
    `;

    const user = newUsers[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
