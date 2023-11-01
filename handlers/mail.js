const nodemailer = require('nodemailer');
const _ = require('lodash');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const {promisify} = require('es6-promisify');
const config = require('../config/');


const transport = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  // service:config.mail.service,
  secure: false,
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: config.mail.username,
    pass: config.mail.password
  }
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/admin/${filename}.pug`, options);
  const inclined = juice(html);
  return inclined;
};

exports.send = async (options) => {
  // console.log(options,"option")
  const html = generateHTML(options.filename, options);
  // const text = htmlToText.fromString(html);
  const text = '';

  const mailOptions = {
    from: `${options.title} <${config.mail.username}>`,
    to: options.user,
    subject: options.subject,
    html,
    text
  };

  return transport.sendMail(mailOptions)
    .then((suc) => {
      console.log(suc);
      return;
    }).catch((err) => {
      console.log(err);
      return;
    })
};
exports.send2 = async (options) => {
  // console.log(options,"option")
  // const html = generateHTML(options.filename, options);
  const html = options.msg.msg;
  // const text = htmlToText.fromString(html);
  const text = '';
  // console.log(options,"option")
  // console.log(options.msg.attachment,"atttachemnt")
  const files = options.msg.attachment
  // console.log(files,"url")
  // var fileName = url.substring(url.lastIndexOf('/')+1);
  // console.log(fileName,"filename")
  var mailOptions
  if(files && files.length){
    // let attachmentToBeSent = [];
    // console.log("HERE it comes");
    // var fileName = url.substring(url.lastIndexOf('/')+1);
    // console.log(files);
    let attachmentToBeSent = _.map(files, function(file) {
      return {filename: file.substring(file.lastIndexOf('/')+1), href: file}
    });
    // console.log(attachmentToBeSent, "--------------------attachmentToBeSent");
    mailOptions = {
     from: `${options.title} <${config.mail.username}>`,
     to: options.user,
     subject: options.subject,
     html,
     text,
     attachments: attachmentToBeSent
   };
  } else {
    // console.log("nofilee")
    mailOptions = {
      from: `${options.title} <${config.mail.username}>`,
      to: options.user,
      subject: options.subject,
      html,
      text
    };
  }

  return transport.sendMail(mailOptions)
    .then((suc) => {
      console.log(suc);
      return;
    }).catch((err) => {
      console.log(err);
      return;
    })
};