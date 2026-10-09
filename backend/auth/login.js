import z from "zod";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { Pool } from "pg";

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

router.post("/login", async (req, res) => {
  try {
    // 1. Validar entrada
    const { email, password } = loginSchema.parse(req.body);

    // 2. Procurar usuário
    const userQuery = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = userQuery.rows[0];

    if (!user) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    // 3. Verificar senha
    const passwordValid = await bcrypt.compare(
      password,
      user.senha
    );

    if (!passwordValid) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    // 4. Pegar User-Agent
    const userAgent = req.get("user-agent") || null;

    // 5. Criar uma sessão
    const sessionResult = await pool.query(
      `
      INSERT INTO sessions (
        user_id,
        user_agent
      )
      VALUES ($1, $2)
      RETURNING id
      `,
      [
        user.id,
        userAgent
      ]
    );

    const sessionId = sessionResult.rows[0].id;

    // 6. Criar refresh token
    const refreshToken = crypto
      .randomBytes(64)
      .toString("hex");

    // 7. Criar hash do refresh token
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // 8. Expiração do refresh
    const expiresAt = new Date(
      Date.now() +
      7 * 24 * 60 * 60 * 1000
    );

    // 9. Salvar refresh token
    await pool.query(
      `
      INSERT INTO refresh_tokens (
        user_id,
        session_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        user.id,
        sessionId,
        tokenHash,
        expiresAt
      ]
    );

    // 10. Criar Access Token
    const accessToken = jwt.sign(
      {
        sub: user.id,
        type: "access"
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "10m",

        issuer: "meu-app",
        audience: "meu-app"
      }
    );

    // 11. Colocar refresh no cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/api/auth",

      maxAge:
        7 * 24 * 60 * 60 * 1000
    });

    // 12. Responder
    return res.status(200).json({
      message: "Login bem-sucedido",
      accessToken
    });

  } catch (error) {

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados de login inválidos",
        details: error.issues
      });
    }

    console.error(error);

    return res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
});

export default router;