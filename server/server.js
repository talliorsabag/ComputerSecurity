// Server main file
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import https from 'https';

import fs from 'fs';
import tls from 'tls';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sendChangePasswordName, sendConfirmationEmail } from '../server/node_mailing.js';
import { connection } from '../database/DB_Connect.js';
import { hashPassword, generateRandomString } from "./encryption.js";
import { checkPassword,inputValidate } from "../security/secure_functions.js";
import {   check_connection,get_user_name,
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
    forgot_pass,
    update_password_token} from '../database/DataBase_functionality.js';


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, '/../front')));

const options = {
    port: 443,
    key: fs.readFileSync(path.join(__dirname,'localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname,'localhost.pem')),
    minVersion: tls.Server.TLSv1_2_method
  };

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/../front/login-page.html'));
});

app.get('/info', async (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/../front/table-view.html'));
});

app.get('/register', (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/../front/registration-page.html'));
});

app.get('/forgotpassword', (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/../front/forgot-password.html'));
});

app.get('/changepassword:id', (req, res) => {
    // activate password token of user
    res.status(200).sendFile(path.join(__dirname + '/../front/change-password.html'));
});

app.get('/activationsuccess', async (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/../front/activation-page.html'));
});

app.get('/activation/:id', async (req, res) => {
    const activatedSuccessed = await activate_user(connection, inputValidate(req.params.id));
    console.log(activatedSuccessed);
    if (activatedSuccessed) {
        res.status(200).redirect('/activationsuccess');
    }
    else {
        res.status(404).send({ "message": "Something went wrong, please try again later!" });
    }
});

app.post('/register', async (req, res) => {
    const fname = inputValidate(req.body.fname)
    const lname = inputValidate(req.body.lname)
    const user_email = inputValidate(req.body.user_email)
    const user_password = inputValidate(req.body.user_password)
    const user_phone = inputValidate(req.body.user_phone)
    const is_valid_password = checkPassword(user_password);
    if(is_valid_password === 'all required elements'){
    const hashed_password = await hashPassword(user_password);
    const user_token = generateRandomString();
    const create_user_status = await insert_user(connection, user_email, fname, lname, user_phone, hashed_password, user_token);
    console.log(create_user_status);
    if (create_user_status) {
        sendConfirmationEmail(fname, user_email, user_token);
        res.status(200).send({result: 'redirect', url:'/', message:"Go activate your account in the email"});
    }
    else {
        res.status(200).send({message:"This email is already used"});
    }}
    else{
        res.status(200).send({result: 'redirect', url:'/', error: is_valid_password});
    }
});

app.post('/forgot-password', async (req, res) => {
    const user_email = inputValidate(req.body.user_email);
    const user_email_exist = await check_user_email(connection, user_email);
    if (user_email_exist) {
        const user_password_token = generateRandomString();
        const forgot_password_succ = await forgot_pass(connection, user_email, user_password_token);
        if (forgot_password_succ){
            sendChangePasswordName(user_email, user_password_token);
        }
    }
    res.status(200).send({ "message": "If the user exist, the mail has been sent!" });
});

app.post('/change-password', async (req, res) => {
    const token = inputValidate(req.body.token);
    const newPassword = inputValidate(req.body.new_password);
    const new_hashed_password = await hashPassword(newPassword);
    const is_valid_password = checkPassword(newPassword);
    if(is_valid_password === 'all required elements'){
    const user_email_exist = await update_password_token(connection, new_hashed_password, token);
    console.log(user_email_exist);
    if (user_email_exist) {
        res.status(200).send({result: 'redirect', url:'/', message:"Please log-in with the new password"});}
    else {
            res.status(200).send({ message: "Can't use the same password from your 3 last passwords" });
        }
    }
    else{
        res.status(200).send({error: is_valid_password});
    }
    });

app.post('/login', async (req, res) => {
    const user_email = inputValidate(req.body.user_email);
    const user_password = inputValidate(req.body.password);
    const hashed_password = await hashPassword(user_password);
    const login_user_status = await authentication_login(connection, user_email, hashed_password);
    if (login_user_status) {
        const user_name = await get_user_name(connection,user_email);
        res.status(200).send({result: 'redirect', url:'/info', name: user_name});
        }
        else {
        res.status(200).send({error: "Wrong credentials"})
        }
});

app.post('/add-client', async (req, res) => {
    const email = inputValidate(req.body.email)
    const fname = inputValidate(req.body.fname)
    const lname = inputValidate(req.body.lname)
    const phone = inputValidate(req.body.phone)
    const city = inputValidate(req.body.city)
    const insert_client_status = await insert_client(connection, email, fname, lname, phone,city);
    console.log(insert_client_status);
    if (insert_client_status) {
        res.status(200).send({result: 'redirect', url:'/info'});
    }
    else {
        res.status(200).redirect('/');
    }
});

app.post('/del-client', async (req, res) => {
    const insert_client_status = await delete_client(connection, inputValidate(req.body.email));
    if (insert_client_status) {
        res.status(200).send({result: 'redirect', url:'/info'});
    }
    else {
        res.status(200).redirect('/');
    }
});

app.post('/changepasswordlogged', async (req, res) => {
    const email = inputValidate(req.body.email)
    const user_old_password = inputValidate(req.body.user_old_password)
    const user_new_password = inputValidate(req.body.user_new_password)
    const hashed_old_password = await hashPassword(user_old_password);
    const hashed_new_password = await hashPassword(user_new_password);
    const is_valid_password = checkPassword(user_new_password);
    if(is_valid_password === 'all required elements'){
        const insert_client_status = await update_password(connection, email, hashed_old_password, hashed_new_password);
        if (insert_client_status) {
            res.status(200).send({result: 'redirect', url:'/', message:'If the credentials correct your password has been changed'});
        }
        else {
            res.status(200).redirect({result: 'redirect', url:'/', message:'If the credentials correct your password has been changed'});
        }
    }
    else {
        res.status(200).send({result: 'redirect', url:'/', error: is_valid_password})
    }
});

app.post('/searchclient', async (req,res) =>{
    const clients = await search(connection, inputValidate(req.body.search_string),0);
    if(clients) res.status(200).send({result: 'redirect', url:'/', clients: clients});
});

app.get('/getclients', async (req, res) => {
        const all_clients= await get_all_clients(connection, 0);
        res.status(200).send(all_clients);
});

app.post('/temp', async (req,res) =>{
    const deleted_user = await delete_user(connection, inputValidate(req.body.email));
    if(deleted_user) res.status(200).send({result: 'redirect', url:'/', message:'If the credentials correct your password has been changed'});
});

app.get('/grantclients',async (req,res) =>{
    let i=0;
    while (i<20){
        const char = String.fromCharCode(i+97);
        const client = await insert_client(connection, char+'@'+char+'.com', char,char,i,char);
        i=i+1
    }
    res.status(200).send({result: 'redirect', url:'/', message:'If the credentials correct your password has been changed'});
});

const server = https.createServer(options, app);

server.listen(process.env.PORT,() => { console.log("Server is running on port " + process.env.PORT); });
