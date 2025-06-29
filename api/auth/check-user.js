import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email_verified 
      FROM users 
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    const userExists = users.length > 0;
    const isVerified = userExists ? users[0].email_verified : false;

    res.status(200).json({
      success: true,
      exists: userExists,
      verified: isVerified,
    });
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
