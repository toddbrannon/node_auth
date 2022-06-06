const User = require("../models/User");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_APIKEY)

// handle errors
const handleErrors = (err) => {
  console.log("1: " + err.message, "2: " + err.code);
  let errors = { email: '', username: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'that email is not registered'
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.email = 'that password is incorrect'
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // duplicate username error
  if(err.code === 11000) {
    errors.user = 'that username is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

const maxAge = 2 * 24 * 60 * 60; // 3 days in seconds
const createToken = (id) => {
    return jwt.sign({ id }, 'trusponse node auth secret', {
        expiresIn: maxAge
    })
}

// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}

// Handle new user signup (Jan 2022); Adding email verification (June 2022)
module.exports.signup_post = async (req, res) => {
  console.log(req.body);
  // const { 
  //   email, 
  //   username, 
  //   password } = req.body;
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    emailToken: crypto.randomBytes(64).toString('hex'),
    isValidated: false
  })
  console.log("New signup email: " + newUser.email);

  try {
    // const user = await User.create(newUser) *** MOVED TO verify_email function (6/3/22) ***
    console.log("msg try block; new user email is " + newUser.email);
    const msg = {
      from: 'toddbrannon@trusponse.com',
      to: newUser.email,
      subject: 'Trusponse Solutions - verify your email',
      text: `
        Hi there! Thank you for registering at Trusponse.
        Please copy and paste the url below to verify your account.
        http://${req.headers.host}/verify-email?token=${newUser.emailToken}
        `,
        html:`
          <h1>Hi there!</h2>
          <p>Thank you for registering at Trusponse.Thank you for registering at Trusponse.</p>
          <p>Please copy and paste the url below to verify your account.</p>
          <a href="http://${req.headers.host}/verify-email?token=${newUser.emailToken}">Verify your account</a>
        `
    }
    try {
      console.log("msg send try block");
      await sgMail.send(msg);
      console.log('registration success!');
      req.flash.message = {
        type: 'success',
        intro: 'Success! ',
        message: 'Thanks for registering. Pleace check your email to verify your account. '
      }
      
      res.redirect('/');
      console.log("should have redirected");
    } catch(err){
      console.log("msg send catch block: " + err);
      req.flash('error', 'Something went wrong. Please contact support@trusponse.com for assistance.');
      res.send({redirect: '/'});
    }
  }
  catch(err) {
    console.log("msg create catch block");
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
 
}

// Handle email verification
module.exports.verify_email = async(req, res, next) => {
  try {
    const user = await User.findOne({ emailToken: req.query.token })
    if(!user){
      req.flash('error', 'Token is invalid. Please contact support@trusponse.com for assistance.');
      return res.redirect('/');
    }
    user.emailToken = null;
    user.isVerified = true;
    await User.create(newUser);
    console.log("Logging in newly verified user: " + user)
    try {
      await User.login(user, async (err) => {
        if (err) return next(err);
        req.flash('success', `Welcome to the Node Auth demo application ${user.username}`);
        const redirectUrl = req.session.redirectTo || '/';
        delete req.session.redirectTo;
        res.redirect(redirectUrl); 
      });
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user:user._id })
    } catch(err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors })  
    }
  } catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors })
  }
}

// Handle login
module.exports.login_post = async (req, res) => {
  console.log(req.body)
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password)
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user:user._id })
  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors })
  }
  
}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1});
  res.redirect('/');
}