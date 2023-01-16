import config from "../configuration.json" assert { type: "json" };

const check_connection = async (con) =>
  con.connect((err) => {
    if (err) console.error(err);
    else console.log("Connected...");
  });

const authentication_login = async (con, email, password) => {
  const sql_query = `SELECT email, password, logins FROM users_details WHERE email = ? AND password = ? AND activated = 1`;
  const sql_query_check = `SELECT email, password, logins FROM users_details WHERE email = ?`;
  const reset_password_query = `UPDATE users_details SET logins = 0 WHERE email = ?;`;
  return new Promise(async (resolve, reject) => {
    const emailExist = await check_user_email(con, email);
    if (!emailExist) {
      console.log("email is not exists...");
      return resolve(false);
    }
    const check_logs = await check_login_attempts(con, email);
    if (!check_logs) {
      return resolve(false);
    }
    con.query(sql_query, [email, password], async (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      if (result.length !== 0) {
        con.query(reset_password_query, [email], async (err, result) => {
          if (err) {
            console.log("Oops... ERROR - something went wrong", err);
            return resolve(false);
          }})
        console.log("inside authentication_login - true");
        return resolve(result);
      } 

      con.query(sql_query_check, [email], async (err, result) => {
        if (err) {
          console.log("Oops... ERROR - something went wrong", err);
          return resolve(false);
        }
        if (result[0].email === email && result[0].password !== password){
          console.log("inside authentication_login - failed");
          let curr_logins = result[0].logins;
          await update_logins(con, email, curr_logins);
          return resolve(false);
        } else {
          console.log("inside authentication_login - failed");
          return resolve(false);
        }
      })
      
    });
  });
};

const check_user_email = async (con, email) => {
  const sql_query = `SELECT email FROM users_details WHERE email = ?`;

  return new Promise((resolve, reject) => {
    con.query(sql_query, [email], (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      return resolve(result.length !== 0);

    });
  });
};

const get_user_name = async (con, email) => {
  const sql_query = `SELECT first_name,last_name FROM users_details WHERE email = ?`;

  return new Promise((resolve, reject) => {
    con.query(sql_query, [email], (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      let name = result[0].first_name + " " + result[0].last_name
      return resolve(name)
    });
  });
};

const check_client_email = async (con, email) => {
  const sql_query = `SELECT email FROM clients WHERE email = ?`;

  return new Promise((resolve, reject) => {
    con.query(sql_query, [email], (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      return resolve(result.length !== 0);
    });
  });
};

//don't export
const delete_earliest_password = async (con, email) => {
  const sql_query_delete = `with tbl as(select * from communication_ltd.password_history)
    delete from communication_ltd.password_history where 
    email = ? and creation_date <= all(select tbl.creation_date from tbl)`;
  return new Promise((resolve, reject) => {
    con.query(sql_query_delete, [email], (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      return resolve(result.length != 0);
    });
  });
};

//don't export
const update_pass_history = async (con, email, password) => {
  const sql_count_query = `SELECT email, password FROM communication_ltd.password_history WHERE email=?`;

  const sql_add_latest = `INSERT INTO communication_ltd.password_history (email,password,creation_date) VALUES (?, ?, NOW())`;
  return new Promise((resolve, reject) => {
    con.query(sql_count_query, [email], async (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      let i = 0
      while(i < result.length) {
        if (result[i].email === email && result[i].password === password) {
          return resolve(false);
        }
        i += 1;
      }
      let num_of_pass = result.length;
      if (num_of_pass >= config.password.history_limit) {
        console.log("inside update_pass_history = pass history is full");
        while (num_of_pass >= config.password.history_limit) {
          await delete_earliest_password(con, email);
          num_of_pass -= 1;
        }
      }
      con.query(sql_add_latest, [email, password], (err, result) => {
        if (err) {
          console.log("Oops... ERROR - something went wrong", err);
          return resolve(false);
        } else {
          console.log("inside update_pass_history - Added password...");
          return resolve(true);
        }
      });
    });
  });
};

const update_password = async (con, email, old_pass, new_pass) => {
  const sql_update_query = `UPDATE users_details
  SET password = ? , pass_token_activated = 1
  WHERE email = ? AND password = ?;`;

  return new Promise(async (resolve, reject) => {
    const emailExists = await check_user_email(con, email);
    if (!emailExists) {
      return resolve("User is not exists!");
    }
    const pre_pass = await update_pass_history(con, email, new_pass);
    if (!pre_pass) {
      console.log("User selected one of his pre passwords...");
      return resolve(false);
    } 
    con.query(sql_update_query, [new_pass, email, old_pass], async (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      console.log("inside update_password - done!");
      return resolve(true);
    });
  });
};

const update_password_token = async (con, new_pass, pass_token) => {
  const sql_update_query = `UPDATE users_details SET password = ? , pass_token_activated = 1 WHERE password_token = ? AND pass_token_activated = 0;`;   
  const get_email_by_token = `SELECT email FROM communication_ltd.users_details WHERE password_token = ?`; 
  return new Promise(async (resolve, reject) => {
    con.query(sql_update_query, [new_pass, pass_token], async (err, result) => {
      if (err) {         
      console.log("Oops... ERROR - something went wrong", err);         
      return resolve(false);       
      }     
    });     
    con.query(get_email_by_token, [pass_token], async (err, result) => {       
      console.log(123);       
      const email=result[0].email       
      console.log(email);       
      console.log("inside update_password_token - done!");       
      const update_history = await update_pass_history(con, email, new_pass)       
      return resolve(update_history);     
    });   
  }); 
};

const insert_user = async (
  con,
  email,
  first_name,
  last_name,
  phone_number,
  password,
  creation_token
) => {
  const sql_query_users = `INSERT INTO communication_ltd.users_details (email, first_name, last_name, phone_number, password, password_token, pass_token_activated, creation_token, logins, login_time, activated) VALUES (?, ?, ?, ?, ?, 0, 0, ?, 0, NOW(), 0)`;

  return new Promise(async (resolve, reject) => {
    const emailExists = await check_user_email(con, email);
    if (emailExists) {
      console.log("User is already exists!");
      return resolve(false);
    }
    con.query(sql_query_users, [email, first_name, last_name, phone_number, password, creation_token], async (err, result) => {
        if (err) {
          console.log("Oops... ERROR - something went wrong", err);
          return resolve(false);
        }
        const updated = await update_pass_history(con, email, password);
        if (!updated) {
          console.log("inside insert_user - pass error -> user was not created");
          await delete_user(con, email);
          return resolve(false);
        }
        console.log("inside insert_user - Added user...");
        return resolve(true);
      });
  });
};

const activate_user = async (con, url_token) => {
  const sql_query_activate = `UPDATE users_details
    SET activated = 1
    WHERE creation_token = ?;`;

  return new Promise((resolve, reject) => {
    con.query(sql_query_activate, [url_token], (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong");
        return resolve(false);
      }
      console.log("User activated...");
      return resolve(true);
    });
  });
};


const forgot_pass = async (con, email, password_token) => {
  const sql_forgot_query = `UPDATE users_details
    SET password_token =? , pass_token_activated = 0
    WHERE email = ?;`;

  return new Promise(async (resolve, reject) => {
    const emailExists = await check_user_email(con, email);
    if (!emailExists) {
      console.log("User is not exists!");
      return resolve(false);
    }
    con.query(sql_forgot_query, [password_token, email], async (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      return resolve(true);
    });
  });
};


const delete_client = async (con, email) => {
  const sql_query_users = `DELETE FROM clients WHERE email=?`;

  return new Promise((resolve, reject) => {
    con.query(sql_query_users, [email], (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong");
        return resolve(false);
      }
      console.log("Client deleted...");
      return resolve(true);
    });
  });
};

const insert_client = async (con, email, first_name, last_name, phone_number, city) => {
  const sql_query_users = `INSERT INTO communication_ltd.clients (email,first_name,last_name,phone_number,city) VALUES (?, ?, ?, ?, ?)`;

  return new Promise(async (resolve, reject) => {
    const emailExists = await check_client_email(con, email);
    if (emailExists) {
      console.log("Client is already exists!");
      return resolve(false);
    }
    con.query(sql_query_users, [email, first_name, last_name, phone_number, city], (err, result) => {
        if (err) {
          console.log("Oops... ERROR - something went wrong", err);
          return resolve(false);
        } else {
          console.log("inside insert_client - Added client...");
          return resolve(result);
        }
      }
    );
  });
};

const delete_user = async (con, email) => {
  const sql_query_users = `DELETE FROM users_details WHERE email=?`;

  const sql_query_passwords = `DELETE FROM password_history WHERE email=?`;

  return new Promise((resolve, reject) => {
    con.query(sql_query_users, [email], (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      } else {
        console.log("User deleted...");
      }
    });

    con.query(sql_query_passwords, [email], (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      } else {
        console.log("Password deleted...");
      }
    });
  });
};

const get_all_clients = async (con, start) => {
  const sql_get_table_query = `SELECT * FROM clients LIMIT 50 OFFSET ?`;

  return new Promise((resolve, reject) => {
    con.query(sql_get_table_query, [start], (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      return resolve(result);
    });
  });
};

const sort_by = async (con, column_name) => {
  const sql_sort_query =
    `SELECT * FROM clients ORDER BY ${column_name} ASC;`;
  return new Promise((resolve, reject) => {
    con.query(sql_sort_query, (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      } else {
        return resolve(result);
      }
    });
  });
};

const search = async (con, search_string, start) => {
  const sql_search_query = `SELECT * FROM clients WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ? OR city LIKE ? LIMIT 50 OFFSET ?`;
  return new Promise((resolve, reject) => {
    con.query(
      sql_search_query,
      [
        `%${search_string}%`,
        `%${search_string}%`,
        `%${search_string}%`,
        `%${search_string}%`,
        `%${search_string}%`,
        start
      ],
      (err, result) => {
        if (err) {
          console.log("Oops... ERROR - something went wrong", err);
          return resolve(false);
        } else {
          return resolve(result);
        }
      }
    );
  });
};

//don't export
const check_login_attempts = async (con, email) => {
  const sql_query_logins = `SELECT logins, login_time FROM communication_ltd.users_details WHERE email=?`;

  return new Promise((resolve, reject) => {
    con.query(sql_query_logins, [email], async (err, result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      const logins_num = result[0].logins;
      const login_time = result[0].login_time;
      const date = new Date();
      const timeDiff = date - login_time;
      // const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const diffMinutes = Math.floor(timeDiff / (1000 * 60));
      // const diffHours = Math.floor(diffMinutes / 60);
      if (logins_num >= config.login.num_of_login_attempts && diffMinutes < 30) {
        console.log("Too many attempts... User have been blocked!");
        await update_login_time(con, email);
        return resolve(false);
      } else if (logins_num >= config.login.num_of_login_attempts && diffMinutes >= 30) {
        await reset_logins(con, email);
        return resolve(true);
      } else {
        return resolve(true);
      }
    })
  });
}


//don't export
const reset_logins = async (con, email) => {
  const sql_query_logins_reset =  `UPDATE users_details
  SET logins = 0, login_time = NOW()
  WHERE email = ?;`;

  return new Promise((resolve, reject) => {
    con.query(sql_query_logins_reset, [email], (err,result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      return resolve(true);
    })
  });
}

//don't export
const update_logins = async (con, email, curr_logins) => {
    const sql_query_logins_update =  `UPDATE users_details
    SET logins = ?, login_time = NOW()
    WHERE email = ?;`;

    return new Promise((resolve, reject) => {
      con.query(sql_query_logins_update, [curr_logins + 1, email], (err,result) => {
        if (err) {
          console.log("Oops... ERROR - something went wrong", err);
          return resolve(false);
        }
        return resolve(true);
      })
    });
}

//don't export
const update_login_time = async (con, email) => {
  const sql_query_login_time_update =  `UPDATE users_details
  SET login_time = NOW()
  WHERE email = ?;`;

  return new Promise((resolve, reject) => {
    con.query(sql_query_login_time_update, [email], (err,result) => {
      if (err) {
        console.log("Oops... ERROR - something went wrong", err);
        return resolve(false);
      }
      return resolve(true);
    })
  });
}

export {
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
  get_user_name,
  activate_user,
  forgot_pass,
  check_login_attempts,
  update_password_token
};
