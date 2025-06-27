import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user by email
    const users = await sql`
      SELECT id, name, email, password_hash, email_verified, timezone, notifications
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // For demo purposes, accept any password for test users
    // In production, you'd verify: await bcrypt.compare(password, user.password_hash)
    const isValidPassword =
      user.email.includes("test@example.com") ||
      (await bcrypt.compare(password, user.password_hash));

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${user.id}
    `;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Return user data (without password)
    const { password_hash, ...userData } = user;

    res.status(200).json({
      success: true,
      token,
      user: {
        ...userData,
        notifications:
          typeof userData.notifications === "string"
            ? JSON.parse(userData.notifications)
            : userData.notifications,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
