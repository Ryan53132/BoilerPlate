import z from "zod";
import bcrypt from "bcrypt";
import express from "express";
import { Pool } from "pg";

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const registerSchema = z.object({
  nome: z.string().min(1).max(100),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6).max(100)
});

router.post("/register", async (req, res) => {
  try {
    // 1. Validar entrada
    const { nome, email, password } = registerSchema.parse(req.body);

    // 2. Verificar se o usuário já existe
    const userExistsQuery = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExistsQuery.rows.length > 0) {
      return res.status(400).json({
        error: "Usuário já existe"
      });
    }

    // 3. Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Inserir usuário no banco
    const insertUserQuery = await pool.query(
      "INSERT INTO users (nome, email, senha) VALUES ($1, $2, $3) RETURNING *",
      [nome, email, hashedPassword]
    );

    const newUser = insertUserQuery.rows[0];

    // 5. Retornar sucesso
    res.status(201).json({
      message: "Usuário registrado com sucesso",
      status: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
