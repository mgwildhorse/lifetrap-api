const { getPool } = require("./_db");

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, days = 30 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const pool = getPool();

    const result = await pool.query(
      `SELECT * FROM daily_checkins 
       WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '%s days' 
       ORDER BY date DESC`,
      [userId, parseInt(days)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get checkins error:", error);
    res.status(500).json({ error: "Failed to get checkins" });
  }
}
