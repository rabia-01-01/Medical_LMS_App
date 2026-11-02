require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

const aiRoutes = require("./route/aiRoutes");

app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});