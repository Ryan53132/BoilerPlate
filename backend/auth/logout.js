import { pool } from "../database/schema.js";
import express from "express";
import crypto from "node:crypto";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin.js";

const router = express.Router();

router.post("/logout", requireTrustedOrigin, async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  try {
    if (refreshToken) {
      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      const sessionResult = await pool.query(
        `SELECT session_id
         FROM refresh_tokens
         WHERE token_hash = $1`,
        [tokenHash]
      );

      if (sessionResult.rows.length > 0) {
        const sessionId = sessionResult.rows[0].session_id;

        await pool.query(
          `UPDATE sessions
           SET revoked_at = NOW()
           WHERE id = $1
             AND revoked_at IS NULL`,
          [sessionId]
        );
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    return res.status(200).json({
      message: "Logout realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro durante logout:", error);

    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

export default router;
