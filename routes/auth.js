import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();
const saltRounds = 10;

export default (passport, db) => {
  // Register page
  router.get("/register", (req, res) => {
    res.render("register", { error: null });
  });

  // Login page
  router.get("/login", (req, res) => {
    res.render("login", { error: null });
  });

  // Handle registration
  router.post("/register", async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    try {
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      if (checkResult.rows.length > 0) {
        res.render("register", { error: "Email already exists. Try logging in." });
      } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.log("Error in hashing:", err);
            res.render("register", { error: "Server error during registration." });
          } else {
            try {
              const result = await db.query(
                "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
                [name, email, hash]
              );
              const user = result.rows[0];
              req.logIn(user, (err) => {
                if (err) {
                  return res.render("register", { error: "Login after registration failed." });
                }
                return res.redirect("/");
              });
            } catch (dbErr) {
              console.log(dbErr);
              res.render("register", { error: "Database error during registration." });
            }
          }
        });
      }
    } catch (err) {
      console.log(err);
      res.render("register", { error: "Database error during registration." });
    }
  });

  // Handle login
  router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.render("login", { error: info?.message || "Login failed" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect("/");
      });
    })(req, res, next);
  });

  // Logout route
  router.get("/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });

  return router;
};
