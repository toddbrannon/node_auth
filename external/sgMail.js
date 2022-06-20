const sgMail = require('@sendgrid/mail')

const configureSGMailKeys = () => {
    sgMail.setApiKey(process.env.SENDGRID_APIKEY);
}

module.exports = {
    sgMail,
    configureSGMailKeys
}