'use strict'


const util = require('util');
const fs = require('fs');
const path = require('path');

const nodemailer = require('nodemailer');

const ENV = require('./utils/envProcessor');
// const Logger = require('./utils/logger').getLogger();

// Logger.debug('TEST');
// return;

const promReaddir = util.promisify(fs.readdir);

const transporter = nodemailer.createTransport({
    host: ENV.MAIL_HOST,
    port: ENV.MAIL_PORT,
    secure: ENV.MAIL_SECURE,
    auth: {
        type: ENV.MAIL_AUTH_TYPE,
        user: ENV.MAIL_AUTH_USER,
        clientId: ENV.MAIL_AUTH_CLIENTID,
        clientSecret: ENV.MAIL_AUTH_CLIENT_SECRET,
        refreshToken: ENV.MAIL_AUTH_REFRESH_TOKEN,
        accessToken: ENV.MAIL_AUTH_ACCESS_TOKEN
    }
});

// Iterate through scrappers folder
// For each folder, finde "scrapper.js" file
// if exists --> run the scrapper

(async () => {
    let scrappersDirs = await (promReaddir(ENV.SCRAPPERS_ROOT_PATH));
    try {
        for (let i = 0; i < scrappersDirs.length; i++) {
            let scrapperDirPath = path.join(ENV.SCRAPPERS_ROOT_PATH, scrappersDirs[i], 'scrapper.js');
            fs.access(scrapperDirPath, (err) => {
                if (err) throw err;
                const Scrapper = require(`./${scrapperDirPath}`);
                const scrapper = new Scrapper(transporter);
                scrapper.run();
            })
        }
    } catch (error) {
        throw error;
    }
})();