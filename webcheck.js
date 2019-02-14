#!/usr/local/bin/node
'use strict'

require('dotenv').config;

const http = require('http');
const { URL } = require('url');
const querystring = require('querystring');

const dotenv = require('dotenv');

const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const moment = require('moment');
const _ = require('underscore');

const ENV = dotenv.config().parsed;

_.each(ENV, (v, k) => {
  if (v === 'true') {
    ENV[k] = true;
  } else if (v === 'false') {
    ENV[k] = false;
  } else if (v.indexOf('JSON@') !== -1){
    console.log(v.split('JSON@')[1]);
    ENV[k] = JSON.parse(v.split('JSON@')[1]);
  }
})

const HTTP_GET = 'GET',
  HTTP_POST = 'POST';


let transporter = nodemailer.createTransport({
  service: ENV.MAIL_SERVICE,
  auth: {
    user: ENV.MAIL_ADDRESS,
    pass: ENV.MAIL_PWD
  }
});

let mailOptions = {
  from: ENV.MAIL_ADDRESS,
  to: ENV.MAIL_RCVRS_LIST,
  subject: ENV.MAIL_SUBJECT,
  text: 'SUVIEJA'
};

let doc = '';

switch (ENV.HTTP_METHOD) {
  case HTTP_GET:
    http.get(ENV.REQ_URL, (res) => {

      res.on('error', (err) => {
        console.log(`Error: ${err.message}\n${err.stack}`);
      })

      res.on('data', (chunk) => {
        doc += chunk;
      })

      res.on('end', () => {
        console.log(`Ended request. Obtained:\n${doc}`);
        
      })
    })
    break;
  
  case HTTP_POST:
    const reqBody = ENV.REQ_DATA;
    const targetUrl = new URL(ENV.REQ_URL);
    
    const options = {
      hostname: targetUrl.hostname,
      port: 80,
      path: targetUrl.pathname,
      method: 'POST',
      headers: {
        "Host": 'www3.emvs.es',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:64.0) Gecko/20100101 Firefox/64.0',
        "Accept": '*/*',
        "Accept-Language": 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        "Accept-Encoding": 'gzip, deflate, br',
        "Referer": 'https://www3.emvs.es/smaweb/',
        "X-Requested-With": 'XMLHttpRequest',
        "X-MicrosoftAjax": 'Delta=true',
        "Cache-Control": 'no-cache',
        "Content-Type": 'application/x-www-form-urlencoded; charset=utf-8',
        "Content-Length": '2824',
        "DNT": '1',
        "Connection": 'keep-alive',
        "Cookie": 'ASP.NET_SessionId=td3qi0m2o5gxg0m1oi4u3pii',
        "Pragma": 'no-cache'
      }
    };

    const req = http.request(options, (res) => {
      ENV.DEBUG && console.log(`STATUS: ${res.statusCode}`);
      ENV.DEBUG && console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        doc += chunk;
      });
      res.on('end', () => {
        ENV.DEBUG && console.log(`DATA:\n${doc}`);
        mailOptions.text = doc;        
        ENV.MAIL_ENABLE && transporter.sendMail(mailOptions, (err, info) => {
          if (err){
            console.log(`[${moment().format()}]    error sending mail:: ${err}`);
          } else {
            console.log(`[${moment().format()}]    ENTRADAS?! - email sent`);
          }
        })
      });
    });
    
    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    req.write(reqBody);
    req.end();

    break;

  default:
    break;
}