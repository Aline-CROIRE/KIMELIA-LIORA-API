const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../services/email.service');

// Helper to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Email already in use' });

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({ firstName, lastName, email, password, verificationToken });

    // Send Verification Email
    const verifyUrl = `http://localhost:${process.env.PORT}/api/v1/auth/verify/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your Kimelia Liora account',
      html: `<h2>Welcome ${firstName}!</h2><p>Please click the link below to verify your account:</p><a href="${verifyUrl}">Verify Account</a>`,
    });

    res.status(201).json({ success: true, message: 'User registered. Please check your email to verify your account.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first' });
    }

    const tokens = generateTokens(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: { id: user._id, firstName: user.firstName, email: user.email, role: user.role },
        ...tokens,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email successfully verified. You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};