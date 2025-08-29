const express = require("express");
const app = express();
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

app.get("/", (req, res) => {
    res.send("Hello world!");
})

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
