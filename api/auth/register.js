import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

function generateUserId() {
  return "user_" + Math.random().toString(36).substr(2, 12);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({ error: "User already exists with this email" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = generateUserId();
    const defaultNotifications = JSON.stringify({
      checkin: true,
      weekly: true,
      friends: true,
      assessments: true,
    });

    await sql`
      INSERT INTO users (
        id, name, email, password_hash, email_verified, 
        timezone, notifications, created_at, updated_at
      ) VALUES (
        ${userId}, ${name}, ${email}, ${passwordHash}, true,
        'auto', ${defaultNotifications}, NOW(), NOW()
      )
    `;

    // Generate JWT token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Return user data
    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name,
        email,
        email_verified: true,
        timezone: "auto",
        notifications: {
          checkin: true,
          weekly: true,
          friends: true,
          assessments: true,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
