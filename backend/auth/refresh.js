import express from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { Pool } from "pg";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin.js";

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.post("/refresh", requireTrustedOrigin, async (req, res) => {
    
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        return res.status(401).json({ error: "Token de atualização ausente" });
    }
    
    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const tokenHash = crypto
              .createHash("sha256")
              .update(refreshToken)
              .digest("hex");

        // Verify the refresh token
        const tokenExists = await client.query(
            "SELECT * FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE",
            [tokenHash]
        );

        if (tokenExists.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(401).json({ error: "Token inválido" });
        }

        const tokenData = tokenExists.rows[0];

        if (tokenData.expires_at < new Date()) {
            await client.query("ROLLBACK");
            return res.status(401).json({ error: "Token expirado" });
        }

        // Check if the token has been revoked
        if (tokenData.revoked_at) {
            await client.query(
                "UPDATE sessions SET revoked_at = NOW() WHERE id = $1",
                [tokenData.session_id]
            );
            await client.query("COMMIT");
            return res.status(401).json({
              error: "Sessão inválida"
            });
        }

        const sessionResult = await client.query(
          "SELECT revoked_at FROM sessions WHERE id = $1",
          [tokenData.session_id]
        );

        if (sessionResult.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(401).json({
            error: "Sessão inválida"
          });
        }

        const session = sessionResult.rows[0];

        if (session.revoked_at) {
            await client.query("ROLLBACK");
          return res.status(401).json({
            error: "Sessão revogada"
          });
        }

        const newrefreshToken = crypto
          .randomBytes(64)
          .toString("hex");
        
        const newtokenHash = crypto
          .createHash("sha256")
          .update(newrefreshToken)
          .digest("hex");

        const expiresAt = new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000
        );
                // 9. Salvar refresh token
        const newTokenResult = await client.query(
          `
          INSERT INTO refresh_tokens (
            user_id,
            session_id,
            token_hash,
            expires_at
          )
          VALUES ($1, $2, $3, $4)
          RETURNING id
          `,
          [
            tokenData.user_id,
            tokenData.session_id,
            newtokenHash,
            expiresAt,
          ]
        );

        await client.query("UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by = $2 WHERE token_hash = $1", [tokenHash, newTokenResult.rows[0].id]);
        await client.query(`UPDATE sessions SET last_used_at = NOW() WHERE id = $1`,[tokenData.session_id]);
        await client.query("COMMIT");

        // Generate a new access token
        const newAccessToken = jwt.sign(
            { sub: tokenData.user_id, type: "access" },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        res.cookie("refreshToken", newrefreshToken, {
          httpOnly: true,

          secure:
            process.env.NODE_ENV === "production",

          sameSite: "lax",

          path: "/api/auth",

          maxAge:
            7 * 24 * 60 * 60 * 1000
        });
        
        // Return the new access token
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        if (client) {
        await client.query("ROLLBACK");
        }
        console.error("Erro ao renovar token:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }finally {
        if (client) {
            client.release();
        }
    }
});

export default router;