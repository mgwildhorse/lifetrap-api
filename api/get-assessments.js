const { getPool } = require("./_db");

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const pool = getPool();

    const result = await pool.query(
      "SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId]
    );

    const assessments = result.rows.map((row) => ({
      id: row.id,
      timestamp: row.created_at,
      phase1Scores: row.phase1_scores,
      phase2Scores: row.phase2_scores,
      responses: row.responses,
      phase2Responses: row.phase2_responses,
    }));

    res.json(assessments);
  } catch (error) {
    console.error("Get assessments error:", error);
    res.status(500).json({ error: "Failed to get assessments" });
  }
}
