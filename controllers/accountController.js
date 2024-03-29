import express from "express";
const router = express.Router();
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Account from "../models/accountModel.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * @swagger
 * components:
 *  schemas:
 *      UserLogin:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        properties:
 *          email:
 *            type: string
 *            description: The user email address
 *          password:
 *            type: string
 *            description: The user password
 *      TokenResponse:
 *        type: object
 *        required:
 *          - token
 *        properties:
 *          token:
 *            type: string
 *            description: The login token
 *      VerifyUserCode:
 *        type: object
 *        required:
 *          - code
 *          - email
 *        properties:
 *          email:
 *            type: string
 *            description: The user email address
 *          code:
 *            type: integer
 *            description: The code to verify
 *      User:
 *        type: object
 *        required:
 *          - firstName
 *          - lastName
 *          - email
 *          - password
 *        properties:
 *          id:
 *            type: integer
 *            description: The auto-generated id of the user
 *          firstName:
 *            type: string
 *            description: The first name of the user
 *          lastName:
 *            type: string
 *            description: The last name of the user
 *          email:
 *            type: string
 *            description: The user email address
 *          password:
 *            type: string
 *            description: The user crypt password
 *          verificationCode:
 *            type: integer
 *            description: Generated code for account validation
 *          isVerified:
 *            type: boolean
 *            description: Get default value of false untill user validation
 *      example:
 *       id: 1
 *       firstName: Ben
 *       lastName: Haham
 *       email: benhaham@hotmail.com
 *       password: password
 *       verificationCode: 1234
 *       isVerified: false
 */

/**
 * @swagger
 * /api/account/signup:
 *  post:
 *    summary: Create New User Account
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: the user account was successfully created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *
 */
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

/**
 * @swagger
 * tags:
 *  name: Accounts
 *  description: The accounts managing API
 */

/**
 * @swagger
 * /api/account/users:
 *  get:
 *    summary: Return the list of all users
 *    tags: [Accounts]
 *    responses:
 *      200:
 *        description: The list of the users
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 */

router.get("/users", (req, res) => {
  Account.findAll()
    .then(results => {
      return res.status(200).json({ message: results });
    })
    .catch(error => {
      return res.status(500).json({ message: error });
    });
});

/**
 * @swagger
 * /api/account/deleteAccount/{id}:
 *  delete:
 *    summary: delete an account by id
 *    tags: [Accounts]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: the user id
 *    responses:
 *      200:
 *        description: the user account was deleted
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.delete("/deleteAccount/:id", (req, res) => {
  const userId = req.params.id;
  Account.findByPk(userId)
    .then(results => {
      return results.destroy().then(account => {
        return res.status(200).json({
          message: account,
        });
      });
    })
    .catch(error => {
      return res.status(500).json({ message: error });
    });
});

/**
 * @swagger
 * /api/account/updateAccount/{id}:
 *  put:
 *    summary: update account details by id
 *    tags: [Accounts]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: the user id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: the user account was deleted
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *
 */
router.put("/updateAccount/:id", (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName } = req.body;
  Account.findByPk(userId)
    .then(account => {
      if (account) {
        account.firstName = firstName;
        account.lastName = lastName;
        return account.save().then(results => {
          return res.status(200).json({ message: results });
        });
      } else {
        return res.status(401).json({ message: "User not found" });
      }
    })
    .catch(error => {
      return res.status(500).json({ message: error });
    });
});

/**
 * @swagger
 * /api/account/verify:
 *  put:
 *    summary: verification the user by code
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/VerifyUserCode'
 *    responses:
 *      200:
 *        description: the user is verified
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *
 */

router.put("/verify", (req, res) => {
  //request code + email / id
  //find the user email
  //chek if code match existing code
  //update to true + save
  //response

  const { code, email } = req.body;
  Account.findAll({ where: { email: email } })
    .then(results => {
      if (results.length > 0) {
        const account = results[0];
        if (parseInt(account.verificationCode) === parseInt(code)) {
          account.isVerified = true;
          return account.save().then(results => {
            return res.status(200).json({ message: "the user is verified!!!" });
          });
        } else {
          return res
            .status(401)
            .json({ message: "the verification code is not match!" });
        }
      } else {
        return res.status(401).json({ message: "email is not found" });
      }
    })
    .catch(error => {
      return res.status(500).json({ message: error });
    });
});

/**
 * @swagger
 * /api/account/login:
 *  post:
 *    summary: Login
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserLogin'
 *    responses:
 *      200:
 *        description: The login credential token
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TokenResponse'
 *
 */
router.post("/login", (req, res) => {
  // request > email + password
  const { email, password } = req.body;
  // find the user account by email
  Account.findAll({ where: { email: email } })
    .then(async results => {
      if (results.length > 0) {
        const account = results[0];
        // check if the user is verify
        if (account.isVerified) {
          // check for password
          const isMatch = await bcryptjs.compare(password, account.password);
          if (isMatch) {
            const dataToToken = {
              id: account.id,
              firstName: account.firstName,
              lastName: account.lastName,
              email: account.email,
            };
            // generate token
            const token = await jwt.sign(dataToToken, process.env.TOKEN_KEY);
            // response + token
            return res.status(200).json({
              message: token,
            });
          } else {
            return res.status(401).json({
              message: "the password is not match",
            });
          }
        } else {
          return res.status(401).json({
            message: "user is not verify",
          });
        }
      } else {
        return res.status(401).json({
          message: "user is not find",
        });
      }
    })
    .catch(error => {
      return res.status(500).json({ message: error });
    });
});

export default router;
