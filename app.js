const express = require("express");
const path = require("path");

const { sessionMiddleware } = require("./src/config/session");
const { requireAdminPage } = require("./src/middlewares/requireAdmin");
const { errorHandler } = require("./src/middlewares/errorHandler");

const adminRoutes = require("./src/routes/adminRoutes");
const planRoutes = require("./src/routes/planRoutes");
const barbeariaRoutes = require("./src/routes/barbeariaRoutes");

function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Session
    app.use(sessionMiddleware());

    // ✅ Sempre pega a raiz do projeto (onde você roda o node)
    const PUBLIC_DIR = path.join(process.cwd(), "public");

    // Static
    app.use(express.static(PUBLIC_DIR));

    // Páginas
    app.get("/", (req, res) => res.redirect("/login.html"));

    // Protegidas (HTML)
    app.get("/dashboard.html", requireAdminPage, (req, res) =>
        res.sendFile(path.join(PUBLIC_DIR, "dashboard.html"))
    );

    app.get("/planos.html", requireAdminPage, (req, res) =>
        res.sendFile(path.join(PUBLIC_DIR, "planos.html"))
    );

    app.get("/barbearias.html", requireAdminPage, (req, res) =>
        res.sendFile(path.join(PUBLIC_DIR, "barbearias.html"))
    );

    // API
    app.use("/api/admin", adminRoutes);
    app.use("/api/plans", planRoutes);
    app.use("/api/barbearias", barbeariaRoutes);

    // Erros
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
