import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    const authHeader = req.get("authorization");

    if (!authHeader) {
        return res.status(401).json({
            error: "Token de acesso ausente"
        });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Formato de token inválido"
        });
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (payload.type !== "access") {
            return res.status(401).json({
                error: "Tipo de token inválido"
            });
        }

        req.user = {
            id: payload.sub
        };

        next();

    } catch (error) {
        return res.status(401).json({
            error: "Token inválido ou expirado"
        });
    }
}

export default authenticate;