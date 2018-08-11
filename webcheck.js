#!/usr/local/bin/node
'use strict'

const http = require('http');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const moment = require('moment');

let transporter = nodemailer.createTransport({
  service: '',
  auth: {
    user: '',
    pass: ''
  }
});

let mailOptions = {
  from: '',
  to: '',
  subject: '',
  text: 'http://www.elnautico.org/?p=2938'
};

http.get('http://www.elnautico.org/?cat=2', (res) => {
  let $;
  let divContentLen;
  let doc = '';

  res.on('error', (err) => {
    console.log(`Error: ${err.message}`);
  })

  res.on('data', (chunk) => {
    doc += chunk;
  })

  res.on('end', () => {
    console.log(`[${moment().format()}]    Checking web for changes...`);
    $ = cheerio.load(doc);
    divContentLen = $('a:contains("LEIVA vs. FERREIRO – 15/08/2018")')
      .parent().parent().parent().children('div.entry-content')
      .children().length
    if (divContentLen != 3){
      transporter.sendMail(mailOptions, (err, info) => {
        if (err){
          console.log(`[${moment().format()}]    error sending mail:: ${err}`);
        } else {
          console.log(`[${moment().format()}]    ENTRADAS?! - email sent`);
        }
      })
    } else {
      console.log(`[${moment().format()}]    No changes`);
    }
  })
})
