import config from "../configuration.json" assert { type: "json" };
import mysql from "mysql";
import {
  check_connection,
  authentication_login,
  check_user_email,
  check_client_email,
  insert_user,
  delete_user,
  update_password,
  insert_client,
  delete_client,
  get_all_clients,
  sort_by,
  search,
  activate_user,
  forgot_pass
} from "./DataBase_functionality.js";
import dotenv from "dotenv";
dotenv.config();

export var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//connection.end()


