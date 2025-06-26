const { getPool } = require("./_db");

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, phase1Scores, phase2Scores, responses, phase2Responses } =
      req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO assessments (user_id, phase1_scores, phase2_scores, responses, phase2_responses, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, created_at`,
      [
        userId,
        JSON.stringify(phase1Scores),
        JSON.stringify(phase2Scores),
        JSON.stringify(responses),
        JSON.stringify(phase2Responses),
      ]
    );

    res.json({
      success: true,
      assessmentId: result.rows[0].id,
      createdAt: result.rows[0].created_at,
    });
  } catch (error) {
    console.error("Save assessment error:", error);
    res.status(500).json({ error: "Failed to save assessment" });
  }
}
