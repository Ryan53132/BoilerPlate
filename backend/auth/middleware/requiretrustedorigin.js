const FRONT_URL = process.env.FRONT_URL || "http://localhost:5173";
const trustedOrigin = new URL(FRONT_URL).origin;

export function requireTrustedOrigin(req, res, next) {
  const origin = req.get("Origin");

  if (!origin || origin !== trustedOrigin) {
    return res.status(403).json({
      error: "Origem não permitida",
    });
  }

  next();
}
