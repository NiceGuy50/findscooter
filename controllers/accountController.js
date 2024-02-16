import express from "express";
const router = express.Router();
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import Account from "../models/accountModel.js";

export default router;

router.post("/signup", (req, res) => {
  // Get the user credentials
  const { firstName, lastName, email, password } = req.body;

  // Check if email available
  Account.findAll({ where: { email: email } })
    .then(async results => {
      if (results.length == 0) {
        // Handle password hash
        const hash = await bcryptjs.hash(password, 10);
        // Generete verification code
        const code = Math.floor(1000 + Math.random() * 9000);
        // Store the new account in db
        Account.create({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: hash,
          verificationCode: code,
          isVerified: false,
        })
          // Response
          .then(account_created => {
            return res.status(200).json({
              message: account_created,
            });
          })
          .catch(error => {
            return res.status(500).json({
              message: error,
            });
          });
      } else {
        return res.status(401).json({
          message: "this email is used by another user",
        });
      }
    })
    .catch(error => {
      return res.status(500).json({ message: error });
    });
});

router.post("/verify", (req, res) => {});

router.post("/login", (req, res) => {});

router.get("/getAccount", (req, res) => {});
