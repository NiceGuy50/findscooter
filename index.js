import express from "express";
import dotenv from "dotenv";
import accountController from "./controllers/accountController.js";
import database from "./services/database.js";

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use("/api/account", accountController);

const port = process.env.PORT;

database
  .sync()
  .then(results => {
    console.log(results);
    app.listen(port, () => console.log(`server is running via port ${port}`));
  })
  .catch(error => console.log(error));
