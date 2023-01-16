import config from "../configuration.json" assert { type: "json" };
import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
  con.end();
});

con.query(
  "CREATE DATABASE IF NOT EXISTS " + process.env.DB_NAME,
  (err, result) => {
    if (err) throw err;
    console.log("Database created");
  }
);

con.changeUser({ database: process.env.DB_NAME }, (err) => {
  if (err) throw err;
});

let sql_users_table =
  "CREATE TABLE IF NOT EXISTS " +
  process.env.DB_NAME +
  ".users_details" +
  "(`email` VARCHAR(50) NOT NULL, `first_name` VARCHAR(45) NOT NULL, `last_name` VARCHAR(45) NOT NULL, `phone_number` VARCHAR(10) NOT NULL, `password` VARCHAR(128) NOT NULL, `password_token` VARCHAR(255) NOT NULL, `pass_token_activated` TINYINT NOT NULL , `creation_token` VARCHAR(45) NOT NULL, `logins` INT NOT NULL, `login_time`DATETIME NOT NULL, `activated` TINYINT NOT NULL, PRIMARY KEY(`email`))";

con.query(sql_users_table, function (err, result) {
  if (err) throw err;
  console.log("Users table created");
});

let sql_history_table =
  "CREATE TABLE IF NOT EXISTS " +
  process.env.DB_NAME +
  ".password_history" +
  "(`email` VARCHAR(50) NOT NULL, `password` VARCHAR(128) NOT NULL,`creation_date` DATETIME NOT NULL, PRIMARY KEY(`email`, `password`))";

con.query(sql_history_table, function (err, result) {
  if (err) throw err;
  console.log("Password history table created");
});

let sql_clients_table =
  "CREATE TABLE IF NOT EXISTS " +
  process.env.DB_NAME +
  ".clients" +
  "(`email` VARCHAR(50) NOT NULL, `first_name` VARCHAR(45) NOT NULL, `last_name` VARCHAR(45) NOT NULL, `phone_number` VARCHAR(10) NOT NULL, `city` VARCHAR(45) NOT NULL, PRIMARY KEY(`email`))";

con.query(sql_clients_table, function (err, result) {
  if (err) throw err;
  console.log("Clients table created");
});
