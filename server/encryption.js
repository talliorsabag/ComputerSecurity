import * as crypto from "crypto"
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path: __dirname + '/../.env'})

const secret=process.env.HASH_SECRET
const iterations = parseInt(process.env.HASH_ITERATIONS);
const keylen = parseInt(process.env.PASSWORD_KEYLEN);
const digest = process.env.HASH_TYPE;

function hashPassword(password){
    return new Promise((resolve, reject) => {

        crypto.pbkdf2(password, secret, iterations, keylen, digest, (err, key) => {
            if (err) {
                reject(err);
            } else {
                resolve(key.toString('hex'));
            }
        })
    });
}


const verifyPasswordMatchToHash = (password, hashed_password) => {
    return hashPassword(password)==hashed_password
}

const generateRandomString = (password, hashed_password) => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 25; i++) {
    token += characters[Math.floor(Math.random() * characters.length )];
    }
    return token
}

export {hashPassword, verifyPasswordMatchToHash, generateRandomString}
