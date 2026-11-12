const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.resolve(__dirname, "..", "data");
const STORE_PATH = path.join(DATA_DIR, "user-access.json");

const SELF_REGISTER_ROLES = new Set(["student", "faculty", "consultant"]);
const ALL_ROLES = new Set(["admin", "faculty", "student", "consultant"]);
const VALID_STATUSES = new Set(["pending", "active", "suspended"]);
const RESET_CODE_TTL_MS = 15 * 60 * 1000;
const RESET_CODE_MAX_ATTEMPTS = 5;

function normalizeResetCode(code) {
    return String(code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function hashResetCode(code) {
    return crypto.createHash("sha256").update(normalizeResetCode(code)).digest("hex");
}

function clearResetMetadata(record) {
    const next = { ...record };
    delete next.resetCodeHash;
    delete next.resetCodeExpiresAt;
    delete next.resetCodeAttempts;
    delete next.passwordResetRequestedAt;
    return next;
}

const FULL_PERMISSIONS = Object.freeze({
    resources: true,
    branch: true,
    courses: true,
    quizzes: true,
    announcements: true,
    notifications: true,
});

const EMPTY_PERMISSIONS = Object.freeze({
    resources: false,
    branch: false,
    courses: false,
    quizzes: false,
    announcements: false,
    notifications: false,
});

function hashPassword(password) {
    if (!password) return "";
    const salt = crypto.randomBytes(16).toString("hex");
    const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
    return `scrypt$${salt}$${derived}`;
}

function verifyPassword(password, storedHash) {
    if (!password || !storedHash || !storedHash.startsWith("scrypt$")) {
        return false;
    }
    const parts = storedHash.split("$");
    if (parts.length !== 3) return false;
    const [, salt, originalHex] = parts;
    const derivedBuf = crypto.scryptSync(String(password), salt, 64);
    const originalBuf = Buffer.from(originalHex, "hex");
    if (derivedBuf.length !== originalBuf.length) return false;
    return crypto.timingSafeEqual(derivedBuf, originalBuf);
}

function normalizePermissions(perms, fallbackAllowed = false) {
    const base = fallbackAllowed ? FULL_PERMISSIONS : EMPTY_PERMISSIONS;
    if (!perms || typeof perms !== "object") {
        return { ...base };
    }
    return {
        resources: typeof perms.resources === "boolean" ? perms.resources : base.resources,
        branch: typeof perms.branch === "boolean" ? perms.branch : base.branch,
        courses: typeof perms.courses === "boolean" ? perms.courses : base.courses,
        quizzes: typeof perms.quizzes === "boolean" ? perms.quizzes : base.quizzes,
        announcements: typeof perms.announcements === "boolean" ? perms.announcements : base.announcements,
        notifications: typeof perms.notifications === "boolean" ? perms.notifications : base.notifications,
    };
}

function buildDefaultUsers() {
    const now = new Date().toISOString();
    const defaultHash = hashPassword("password");
    return [
        {
            id: "u-admin-1",
            name: "Alice Kernel",
            email: "[EMAIL_ADDRESS]",
            phone: "+1 555-0100",
            passwordHash: defaultHash,
            role: "admin",
            avatar: "👩‍💼",
            department: "Academic Directorate",
            batch: "All",
            status: "active",
            accessPermissions: { ...FULL_PERMISSIONS },
            createdAt: now,
        },
        {
            id: "u-faculty-1",
            name: "Dr. Sarah Jenkins",
            email: "[EMAIL_ADDRESS]",
            phone: "+1 555-0101",
            passwordHash: defaultHash,
            role: "faculty",
            avatar: "👩‍⚕️",
            department: "Pre-Clinical Sciences",
            batch: "All",
            status: "active",
            accessPermissions: { ...FULL_PERMISSIONS },
            createdAt: now,
        },
        {
            id: "u-student-1",
            name: "Mary",
            email: "[EMAIL_ADDRESS]",
            phone: "+1 555-0102",
            passwordHash: defaultHash,
            role: "student",
            avatar: "👩‍🎓",
            department: "Pre-Clinical Sciences",
            batch: "",
            status: "active",
            accessPermissions: { ...FULL_PERMISSIONS },
            createdAt: now,
            targetExam: "NEET-UG",
        },
        {
            id: "u-consultant-1",
            name: "Dr. Marco Rossi",
            email: "[EMAIL_ADDRESS]",
            phone: "+39 06 6987 1234",
            passwordHash: defaultHash,
            role: "consultant",
            avatar: "💼",
            department: "Overseas Admissions & Consular Directorate",
            batch: "All",
            status: "active",
            accessPermissions: { ...FULL_PERMISSIONS },
            createdAt: now,
            targetExam: "IMAT & Study in Italy Admissions",
        },
    ];
}

let usersCache = null;

function persistUsers(users) {
    usersCache = users;
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(STORE_PATH, JSON.stringify(users, null, 2), "utf8");
    } catch (err) {
        console.warn("[userAccessService] Failed to persist store:", err.message);
    }
}

function loadUsers() {
    if (usersCache) return usersCache;
    try {
        if (fs.existsSync(STORE_PATH)) {
            const raw = fs.readFileSync(STORE_PATH, "utf8");
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                usersCache = parsed;
                return usersCache;
            }
        }
    } catch (err) {
        console.warn("[userAccessService] Failed reading store, using defaults:", err.message);
    }
    const seeded = buildDefaultUsers();
    persistUsers(seeded);
    return seeded;
}

function toSafeUser(record) {
    if (!record) return null;
    const {
        passwordHash: _ignoredPassword,
        resetCodeHash,
        resetCodeExpiresAt,
        resetCodeAttempts: _ignoredAttempts,
        passwordResetRequestedAt,
        ...safe
    } = record;
    const hasActiveResetCode = Boolean(resetCodeHash && Number(resetCodeExpiresAt) > Date.now());
    return {
        ...safe,
        status: VALID_STATUSES.has(safe.status) ? safe.status : "active",
        passwordResetRequested: Boolean(passwordResetRequestedAt),
        hasActiveResetCode,
        accessPermissions: normalizePermissions(
            safe.accessPermissions,
            safe.role === "admin" || safe.status === "active"
        ),
    };
}

function getDefaultAvatar(role) {
    if (role === "admin") return "👨‍💼";
    if (role === "faculty") return "👨‍⚕️";
    if (role === "consultant") return "💼";
    return "👩‍🎓";
}

function findUserByEmailOrId(users, { email, id }) {
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    return users.find(
        (u) =>
            (id && u.id === id) ||
            (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );
}

function verifyAdminActor({ adminEmail, adminId }) {
    const users = loadUsers();
    const actor = findUserByEmailOrId(users, { email: adminEmail, id: adminId });
    if (!actor || actor.role !== "admin" || actor.status !== "active") {
        return null;
    }
    return actor;
}

function listUsers() {
    return loadUsers().map(toSafeUser);
}

function getUserStatus({ email, id }) {
    const users = loadUsers();
    const user = findUserByEmailOrId(users, { email, id });
    if (!user) return null;
    return toSafeUser(user);
}

function hasRegisteredAdmin(users) {
    return users.some(
        (u) => u.role === "admin" && u.selfRegisteredAdmin === true
    );
}

function isAdminRegistrationOpen() {
    return !hasRegisteredAdmin(loadUsers());
}

function registerSelfUser(payload) {
    const name = String(payload?.name || payload?.fullName || "").trim();
    const email = String(payload?.email || "").trim().toLowerCase();
    const password = String(payload?.password || "");
    const phone = String(payload?.phone || "").trim();
    const role = String(payload?.role || "student").toLowerCase();
    const department = String(payload?.department || "").trim();
    const targetExam = String(payload?.targetExam || "").trim();

    if (!name || !email || !email.includes("@")) {
        return { error: "Valid name and email address are required.", statusCode: 400 };
    }

    const users = loadUsers();
    if (role === "admin") {
        if (hasRegisteredAdmin(users)) {
            return {
                error: "Administrator registration is closed. An admin has already been registered.",
                statusCode: 403,
            };
        }
    } else if (!SELF_REGISTER_ROLES.has(role)) {
        return { error: "Only Students, Faculty, and Consultant Agents can register.", statusCode: 400 };
    }

    if (password.length < 6) {
        return { error: "Password must be at least 6 characters.", statusCode: 400 };
    }

    if (findUserByEmailOrId(users, { email })) {
        return { error: "Email is already registered.", statusCode: 409 };
    }

    const isFirstAdmin = role === "admin";
    const newUser = {
        id: payload?.id || `u-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
        name,
        email,
        phone,
        passwordHash: hashPassword(password),
        role,
        avatar: getDefaultAvatar(role),
        department: isFirstAdmin ? (department || "Academic Directorate") : department,
        batch: isFirstAdmin ? "All" : "",
        targetExam,
        status: isFirstAdmin ? "active" : "pending",
        accessPermissions: isFirstAdmin ? { ...FULL_PERMISSIONS } : { ...EMPTY_PERMISSIONS },
        ...(isFirstAdmin ? { selfRegisteredAdmin: true } : {}),
        createdAt: new Date().toISOString(),
    };

    persistUsers([...users, newUser]);
    return { user: toSafeUser(newUser), statusCode: 201 };
}

function googleSignInOrRegister(payload) {
    const email = String(payload?.email || "").trim().toLowerCase();
    const nameInput = String(payload?.name || "").trim();
    const rawRole = String(payload?.role || "student").toLowerCase();
    const safeRole = SELF_REGISTER_ROLES.has(rawRole) ? rawRole : "student";

    if (!email || !email.includes("@")) {
        return { error: "Please provide a valid Google email address.", statusCode: 400 };
    }

    const users = loadUsers();
    const existing = findUserByEmailOrId(users, { email });
    if (existing) {
        return { user: toSafeUser(existing), isNew: false, statusCode: 200 };
    }

    const derivedName =
        nameInput ||
        email
            .split("@")[0]
            .replace(/[._]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    const newGoogleUser = {
        id: `u-google-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
        name: derivedName,
        email,
        phone: "",
        passwordHash: "",
        role: safeRole,
        avatar: getDefaultAvatar(safeRole),
        department: safeRole === "consultant" ? "Study Abroad & Consular Services" : "Medical Sciences",
        batch: "",
        targetExam: safeRole === "student" ? "NEET & IMAT" : "",
        status: "pending",
        accessPermissions: { ...EMPTY_PERMISSIONS },
        createdAt: new Date().toISOString(),
    };

    persistUsers([...users, newGoogleUser]);
    return { user: toSafeUser(newGoogleUser), isNew: true, statusCode: 201 };
}

function authenticateUser(email, password) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !password) {
        return { error: "Email and password are required.", statusCode: 400 };
    }

    const users = loadUsers();
    const record = findUserByEmailOrId(users, { email: cleanEmail });
    if (!record) {
        return { error: "Invalid email or password.", statusCode: 401 };
    }

    if (!verifyPassword(password, record.passwordHash)) {
        return { error: "Invalid email or password.", statusCode: 401 };
    }

    return { user: toSafeUser(record), statusCode: 200 };
}

function createUserByAdmin(payload, actor) {
    if (!actor) {
        return { error: "Administrator authorization required.", statusCode: 403 };
    }

    const name = String(payload?.name || "").trim();
    const email = String(payload?.email || "").trim().toLowerCase();
    const password = String(payload?.password || "");
    const role = String(payload?.role || "student").toLowerCase();
    const requestedStatus = VALID_STATUSES.has(payload?.status) ? payload.status : "active";

    if (!name || !email || !email.includes("@")) {
        return { error: "Valid name and email are required.", statusCode: 400 };
    }
    if (!ALL_ROLES.has(role)) {
        return { error: "Invalid user role.", statusCode: 400 };
    }

    const users = loadUsers();
    if (findUserByEmailOrId(users, { email })) {
        return { error: "User with this email already exists.", statusCode: 409 };
    }

    const status = role === "admin" ? "active" : requestedStatus;
    const accessPermissions =
        role === "admin"
            ? { ...FULL_PERMISSIONS }
            : normalizePermissions(payload?.accessPermissions, status === "active");

    const newUser = {
        id: payload?.id || `u-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
        name,
        email,
        phone: String(payload?.phone || "").trim(),
        passwordHash: hashPassword(password),
        role,
        avatar: payload?.avatar || getDefaultAvatar(role),
        department: String(payload?.department || "").trim(),
        batch: typeof payload?.batch === "string" ? payload.batch : role === "student" ? "" : "All",
        targetExam: String(payload?.targetExam || "").trim(),
        status,
        accessPermissions,
        createdAt: new Date().toISOString(),
    };

    persistUsers([...users, newUser]);
    return { user: toSafeUser(newUser), statusCode: 201 };
}

function updateUserAccess(userId, patch, actor) {
    if (!actor) {
        return { error: "Administrator authorization required.", statusCode: 403 };
    }

    const users = loadUsers();
    const index = users.findIndex((u) => u.id === userId || (patch?.email && u.email.toLowerCase() === String(patch.email).toLowerCase()));
    if (index === -1) {
        return { error: "User not found.", statusCode: 404 };
    }

    const target = users[index];
    const nextStatus = VALID_STATUSES.has(patch?.status) ? patch.status : target.status;

    if (target.id === actor.id && nextStatus !== "active") {
        return { error: "Active administrators cannot revoke their own account access.", statusCode: 400 };
    }

    let nextPermissions = normalizePermissions(target.accessPermissions, target.status === "active");
    if (patch?.accessPermissions && typeof patch.accessPermissions === "object") {
        nextPermissions = normalizePermissions(patch.accessPermissions, nextStatus === "active");
    } else if (nextStatus === "active" && target.status !== "active") {
        const anyAlreadyEnabled = Object.values(nextPermissions).some(Boolean);
        if (!anyAlreadyEnabled) {
            nextPermissions = { ...FULL_PERMISSIONS };
        }
    } else if (nextStatus === "pending") {
        nextPermissions = { ...EMPTY_PERMISSIONS };
    }

    const updated = {
        ...target,
        ...(typeof patch?.name === "string" && patch.name.trim() ? { name: patch.name.trim() } : {}),
        ...(typeof patch?.batch === "string" ? { batch: patch.batch } : {}),
        ...(typeof patch?.department === "string" ? { department: patch.department } : {}),
        ...(typeof patch?.targetExam === "string" ? { targetExam: patch.targetExam } : {}),
        ...(ALL_ROLES.has(patch?.role) && target.id !== actor.id ? { role: patch.role } : {}),
        status: target.role === "admin" ? "active" : nextStatus,
        accessPermissions: target.role === "admin" ? { ...FULL_PERMISSIONS } : nextPermissions,
    };

    const nextUsers = [...users];
    nextUsers[index] = updated;
    persistUsers(nextUsers);
    return { user: toSafeUser(updated), statusCode: 200 };
}

function allowAllUsers({ onlyPending = false } = {}, actor) {
    if (!actor) {
        return { error: "Administrator authorization required.", statusCode: 403 };
    }

    const users = loadUsers();
    let updatedCount = 0;
    const nextUsers = users.map((u) => {
        if (u.role === "admin") return u;
        if (onlyPending && u.status !== "pending") return u;
        updatedCount += 1;
        return {
            ...u,
            status: "active",
            accessPermissions: { ...FULL_PERMISSIONS },
        };
    });

    persistUsers(nextUsers);
    return {
        users: nextUsers.map(toSafeUser),
        updatedCount,
        statusCode: 200,
    };
}

function removeUser(userId, actor) {
    if (!actor) {
        return { error: "Administrator authorization required.", statusCode: 403 };
    }

    const users = loadUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) {
        return { error: "User not found.", statusCode: 404 };
    }
    if (target.id === actor.id || target.id === "u-admin-1") {
        return { error: "Cannot delete active primary administrator account.", statusCode: 400 };
    }

    persistUsers(users.filter((u) => u.id !== userId));
    return { success: true, statusCode: 200 };
}

function suspendAdminAccount(userId, actor) {
    if (!actor) {
        return { error: "Administrator authorization required.", statusCode: 403 };
    }

    const users = loadUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) {
        return { error: "User not found.", statusCode: 404 };
    }
    if (target.role !== "admin") {
        return { error: "Target user is not an administrator.", statusCode: 400 };
    }

    const nextUsers = users.filter((u) => u.id !== userId);
    persistUsers(nextUsers);
    return {
        success: true,
        deletedId: target.id,
        deletedEmail: target.email,
        deletedSelf: target.id === actor.id,
        adminRegistrationOpen: !hasRegisteredAdmin(nextUsers),
        statusCode: 200,
    };
}

function deleteOwnAccount(email, password) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const passStr = String(password || "");
    if (!cleanEmail || !cleanEmail.includes("@") || !passStr) {
        return { error: "Valid email and password are required.", statusCode: 400 };
    }

    const users = loadUsers();
    const target = findUserByEmailOrId(users, { email: cleanEmail });
    if (!target || !verifyPassword(passStr, target.passwordHash)) {
        return { error: "Invalid email or password.", statusCode: 401 };
    }

    const nextUsers = users.filter((u) => u.id !== target.id);
    persistUsers(nextUsers);
    return {
        success: true,
        deletedId: target.id,
        deletedEmail: target.email,
        role: target.role,
        adminRegistrationOpen: !hasRegisteredAdmin(nextUsers),
        statusCode: 200,
    };
}

function requestPasswordReset(email) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
        return { error: "Please enter a valid registered email address.", statusCode: 400 };
    }

    const users = loadUsers();
    const index = users.findIndex((u) => u.email && u.email.toLowerCase() === cleanEmail);
    if (index !== -1) {
        const nextUsers = [...users];
        nextUsers[index] = {
            ...nextUsers[index],
            passwordResetRequestedAt: new Date().toISOString(),
        };
        persistUsers(nextUsers);
    }

    return {
        requested: true,
        statusCode: 200,
        message:
            "If an account exists for that email, your password reset request has been logged for Administrator recovery.",
    };
}

function issuePasswordResetCode(userId, actor) {
    if (!actor) {
        return { error: "Administrator authorization required.", statusCode: 403 };
    }

    const users = loadUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
        return { error: "User not found.", statusCode: 404 };
    }

    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    const formattedCode = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    const expiresAt = Date.now() + RESET_CODE_TTL_MS;

    const updated = {
        ...users[index],
        resetCodeHash: hashResetCode(formattedCode),
        resetCodeExpiresAt: expiresAt,
        resetCodeAttempts: 0,
    };

    const nextUsers = [...users];
    nextUsers[index] = updated;
    persistUsers(nextUsers);

    return {
        resetCode: formattedCode,
        expiresAt: new Date(expiresAt).toISOString(),
        user: toSafeUser(updated),
        statusCode: 200,
    };
}

function adminResetUserPassword(userId, newPassword, actor) {
    if (!actor) {
        return { error: "Administrator authorization required.", statusCode: 403 };
    }
    const passwordStr = String(newPassword || "");
    if (passwordStr.length < 6) {
        return { error: "New password must be at least 6 characters.", statusCode: 400 };
    }

    const users = loadUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
        return { error: "User not found.", statusCode: 404 };
    }

    const updated = {
        ...clearResetMetadata(users[index]),
        passwordHash: hashPassword(passwordStr),
    };
    const nextUsers = [...users];
    nextUsers[index] = updated;
    persistUsers(nextUsers);
    return { user: toSafeUser(updated), statusCode: 200 };
}

function completePasswordResetWithCode({ email, code, newPassword }) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const normalizedCode = normalizeResetCode(code);
    const passwordStr = String(newPassword || "");

    if (!cleanEmail || !cleanEmail.includes("@")) {
        return { error: "Please enter a valid email address.", statusCode: 400 };
    }
    if (!normalizedCode) {
        return { error: "Please enter the one-time reset code issued by an Administrator.", statusCode: 400 };
    }
    if (passwordStr.length < 6) {
        return { error: "New password must be at least 6 characters.", statusCode: 400 };
    }

    const users = loadUsers();
    const index = users.findIndex((u) => u.email && u.email.toLowerCase() === cleanEmail);
    if (index === -1) {
        return { error: "Invalid email or reset code.", statusCode: 400 };
    }

    const record = users[index];
    if (!record.resetCodeHash || Number(record.resetCodeExpiresAt) <= Date.now()) {
        return {
            error: "No active reset code found for this account, or the code has expired. Request a new code from an Administrator.",
            statusCode: 400,
        };
    }

    const incomingBuf = Buffer.from(hashResetCode(normalizedCode), "hex");
    const expectedBuf = Buffer.from(record.resetCodeHash, "hex");
    const matches =
        incomingBuf.length === expectedBuf.length &&
        crypto.timingSafeEqual(incomingBuf, expectedBuf);

    if (!matches) {
        const nextAttempts = (Number(record.resetCodeAttempts) || 0) + 1;
        const nextUsers = [...users];
        if (nextAttempts >= RESET_CODE_MAX_ATTEMPTS) {
            nextUsers[index] = {
                ...clearResetMetadata(record),
                passwordResetRequestedAt: record.passwordResetRequestedAt || new Date().toISOString(),
            };
            persistUsers(nextUsers);
            return {
                error: "Too many invalid attempts. This reset code has been invalidated; request a fresh code.",
                statusCode: 400,
            };
        }
        nextUsers[index] = { ...record, resetCodeAttempts: nextAttempts };
        persistUsers(nextUsers);
        return { error: "Invalid reset code. Please check the code and try again.", statusCode: 400 };
    }

    const updated = {
        ...clearResetMetadata(record),
        passwordHash: hashPassword(passwordStr),
    };
    const nextUsers = [...users];
    nextUsers[index] = updated;
    persistUsers(nextUsers);

    return {
        success: true,
        user: toSafeUser(updated),
        statusCode: 200,
    };
}

module.exports = {
    FULL_PERMISSIONS,
    EMPTY_PERMISSIONS,
    listUsers,
    getUserStatus,
    isAdminRegistrationOpen,
    registerSelfUser,
    googleSignInOrRegister,
    authenticateUser,
    createUserByAdmin,
    updateUserAccess,
    allowAllUsers,
    removeUser,
    suspendAdminAccount,
    deleteOwnAccount,
    verifyAdminActor,
    requestPasswordReset,
    issuePasswordResetCode,
    adminResetUserPassword,
    completePasswordResetWithCode,
};

