const { getPool } = require("./_db");

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, date, q1, q2, q3, q4 } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ error: "userId and date are required" });
    }

    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO daily_checkins (user_id, date, q1, q2, q3, q4, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       ON CONFLICT (user_id, date) 
       DO UPDATE SET q1 = $3, q2 = $4, q3 = $5, q4 = $6, created_at = NOW()
       RETURNING *`,
      [userId, date, q1, q2, q3, q4]
    );

    res.json({ success: true, checkin: result.rows[0] });
  } catch (error) {
    console.error("Save checkin error:", error);
    res.status(500).json({ error: "Failed to save checkin" });
  }
}
