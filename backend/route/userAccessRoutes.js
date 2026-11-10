const express = require("express");
const router = express.Router();
const {
    listUsers,
    getUserStatus,
    registerSelfUser,
    googleSignInOrRegister,
    authenticateUser,
    createUserByAdmin,
    updateUserAccess,
    removeUser,
    verifyAdminActor,
} = require("../services/userAccessService");

function resolveAdminActor(req) {
    const adminEmail = req.headers["x-admin-email"] || req.body?.adminEmail;
    const adminId = req.headers["x-admin-id"] || req.body?.adminId;
    return verifyAdminActor({ adminEmail, adminId });
}

function handleAction(res, fn) {
    try {
        return fn();
    } catch (err) {
        console.error("[userAccessRoutes] Unexpected error:", err);
        return res.status(500).json({ error: err?.message || "Internal user access service error." });
    }
}

router.get("/", (_req, res) =>
    handleAction(res, () => res.json({ users: listUsers() }))
);

router.get("/status", (req, res) =>
    handleAction(res, () => {
        const user = getUserStatus({
            email: req.query.email,
            id: req.query.id,
        });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        return res.json({ user });
    })
);

router.post("/register", (req, res) =>
    handleAction(res, () => {
        const result = registerSelfUser(req.body);
        if (result.error) {
            return res.status(result.statusCode).json({ error: result.error });
        }
        return res.status(result.statusCode).json({ user: result.user });
    })
);

router.post("/login", (req, res) =>
    handleAction(res, () => {
        const result = authenticateUser(req.body?.email, req.body?.password);
        if (result.error) {
            return res.status(result.statusCode).json({ error: result.error });
        }
        return res.status(200).json({ user: result.user });
    })
);

router.post("/google", (req, res) =>
    handleAction(res, () => {
        const result = googleSignInOrRegister(req.body);
        if (result.error) {
            return res.status(result.statusCode).json({ error: result.error });
        }
        return res.status(result.statusCode).json({
            user: result.user,
            isNew: Boolean(result.isNew),
        });
    })
);

router.post("/admin-create", (req, res) =>
    handleAction(res, () => {
        const actor = resolveAdminActor(req);
        const result = createUserByAdmin(req.body, actor);
        if (result.error) {
            return res.status(result.statusCode).json({ error: result.error });
        }
        return res.status(result.statusCode).json({ user: result.user });
    })
);

router.patch("/:id/access", (req, res) =>
    handleAction(res, () => {
        const actor = resolveAdminActor(req);
        const result = updateUserAccess(req.params.id, req.body, actor);
        if (result.error) {
            return res.status(result.statusCode).json({ error: result.error });
        }
        return res.status(200).json({ user: result.user });
    })
);

router.delete("/:id", (req, res) =>
    handleAction(res, () => {
        const actor = resolveAdminActor(req);
        const result = removeUser(req.params.id, actor);
        if (result.error) {
            return res.status(result.statusCode).json({ error: result.error });
        }
        return res.status(200).json({ success: true });
    })
);

module.exports = router;
