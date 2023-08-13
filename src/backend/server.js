const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const app = express();

app.use(cors({ origin: "http://localhost:3000" }));

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "sql.freedb.tech",
  port: 3306,
  user: "freedb_azzula",
  password: "Nvj37C*fJMnhrmQ",
  database: "freedb_user_registration",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

const secretKey = "nika-gorozia";
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  jwt.verify(token.replace("Bearer ", ""), secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

app.post("/register", (req, res) => {
  const { first_name, last_name, email, password, password_confirm } = req.body;
  if (!first_name || !last_name || !email || !password || !password_confirm) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (password != password_confirm) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Error checking email:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: "Email already registered." });
    }
    db.query(
      "INSERT INTO users (name, email, password, last_login, registration_time, status) VALUES (?, ?, ?, Null, NOW(), 'active')",
      [`${first_name} ${last_name}`, email, password],
      (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).json({ error: "Internal server error" });
        }
        const newUser = {
          id: result.insertId,
          name: `${first_name} ${last_name}`,
          email,
          password,
          last_login: null,
          registration_time: new Date(),
          status: "active",
        };
        res
          .status(201)
          .json({ message: "User registered successfully.", user: newUser });
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { email, password, status } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    const user = results[0];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.status === "inactive") {
      return res.status(403).json({ error: "User is inactive" });
    }
    db.query(
      "UPDATE users SET last_login = NOW() WHERE id = ?",
      [user.id],
      (err) => {
        if (err) {
          console.error("Error updating last login:", err);
        }
      }
    );
    const token = jwt.sign({ id: user.id, email: user.email }, secretKey);
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: { id: user.id, email: user.email },
    });
  });
});

app.post("/delete-users", (req, res) => {
  const { selectedUserIds } = req.body;
  if (!selectedUserIds || !Array.isArray(selectedUserIds)) {
    return res.status(400).json({ error: "Invalid data format" });
  }
  db.query(
    "DELETE FROM users WHERE id IN (?)",
    [selectedUserIds],
    (err, result) => {
      if (err) {
        console.error("Error deleting users:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(200).json({ message: "Selected users deleted successfully" });
    }
  );
});

app.post("/block-users", (req, res) => {
  const { selectedUserIds } = req.body;
  if (!selectedUserIds || !Array.isArray(selectedUserIds)) {
    return res.status(400).json({ error: "Invalid data format" });
  }
  db.query(
    "UPDATE users SET status = 'inactive' WHERE id IN (?)",
    [selectedUserIds],
    (err, result) => {
      if (err) {
        console.error("Error updating user statuses:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(200).json({ message: "Selected users blocked successfully" });
    }
  );
});

app.post("/unblock-users", (req, res) => {
  const { selectedUserIds } = req.body;
  if (!selectedUserIds || !Array.isArray(selectedUserIds)) {
    return res.status(400).json({ error: "Invalid data format" });
  }
  db.query(
    "UPDATE users SET status = 'active' WHERE id IN (?)",
    [selectedUserIds],
    (err, result) => {
      if (err) {
        console.error("Error updating user statuses:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res
        .status(200)
        .json({ message: "Selected users unblocked successfully" });
    }
  );
});

app.get("/user", authenticateUser, (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT id, name, email, last_login, registration_time, status FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error retrieving user:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({ user: results[0] });
    }
  );
});

app.get("/users", (req, res) => {
  db.query(
    "SELECT id, name, email, last_login, registration_time, status FROM users",
    (err, results) => {
      if (err) {
        console.error("Error retrieving users:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(200).json({ users: results });
    }
  );
});

app.get("/check-user-status", authenticateUser, (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT status FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error retrieving user status:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({ status: results[0].status });
    }
  );
});

const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
