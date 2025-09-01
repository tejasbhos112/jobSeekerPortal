const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/mailer');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
   console.log("register user");
   
    if (!username || !email || !password)
      return res.status(400).json({ error: 'username, email, password required' });

    const exists = await db.User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await db.User.create({ username, email, password: hash });

  
    sendMail(email, 'Welcome to JobPortal', `Hi ${username}, welcome aboard!`).catch(console.error);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1d' });
   
    res.cookie(token)
    res.json("user registered successfully!!");
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email, password required' });

   
    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Invalid email or password' });

    
    if (req.cookies && req.cookies.token) {
      const existingSession = await db.SessionToken.findOne({ where: { token: req.cookies.token } });
      if (existingSession && existingSession.userId !== user.id) {
        return res.status(400).json({ error: 'Please logout from the current account before logging in with another.' });
      }
    }

    
    const userSession = await db.SessionToken.findOne({ where: { userId: user.id } });
    if (userSession) {
      return res.status(400).json({ error: 'You are already logged in. Please logout first.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1d' });

   
    await db.SessionToken.create({
      token,
      userId: user.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    });

    

   
    res.cookie('token', token);

    res.json({ message: "user login successfully!" });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token
    if (token) {
      await db.SessionToken.destroy({ where: { token } });
      res.clearCookie('token');
    }
    res.json({ message: 'Logged out (session ended)' });
  } catch (err) {
    res.status(500).json({ error: 'Logout error' });
  }
};
