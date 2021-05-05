const nodemailer = require('nodemailer');
const fs = require('fs')

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: 'etiqanoreply@gmail.com',
      pass: '2WSX3edc'
    }
  });

  var mailOptions = {
    from: 'etiqanoreply@gmail.com',
    to: 'rhega.rofiat@etiqa.co.id',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };

const sendmail = {
    testSendMail(){
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              return (console.log('Email sent: ' + info.response));
            }
          });

    } 
}

module.exports = sendmail