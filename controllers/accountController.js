import express from "express";
const router = express.Router();
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import Account from "../models/accountModel.js";

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - firstName
 *        - lastName
 *        - email
 *        - password
 *      properties:
 *        id:
 *          type: integer
 *          description: the auto-generated id of the user
 *        firstName:
 *          type: string
 *          description: the first name of the user
 *        lastName:
 *          type: string
 *          description: the last name of the user
 *        email:
 *          type: string
 *          description: the email of the user
 *        password:
 *          type: string
 *          description: the user password
 *        verificationCode:
 *          type: integer
 *          description: Generated code for account validation
 *        isVerified:
 *          type: boolean
 *          description: Get default value of false until user validation
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

router.post("/verify", (req, res) => {});

router.post("/login", (req, res) => {});

export default router;
