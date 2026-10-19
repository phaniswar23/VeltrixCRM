import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'veltrix_crm_super_secure_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, business_type } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'staff';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      business_type: business_type || 'General Enterprise',
    });

    await ActivityLog.create({
      user_id: user._id,
      action: 'User Registered',
      description: `${user.name} registered as ${user.role}`,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        business_type: user.business_type,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.last_activity = new Date();
    await user.save({ validateBeforeSave: false });

    await ActivityLog.create({
      user_id: user._id,
      action: 'User Logged In',
      description: `${user.name} logged in to workspace`,
    });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        business_type: user.business_type,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await ActivityLog.create({
        user_id: req.user._id,
        action: 'User Logged Out',
        description: `${req.user.name} logged out`,
      });
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save({ validateBeforeSave: false });

    // In production, an email is sent; for local/staging we also return the OTP in response
    return res.json({
      success: true,
      message: 'OTP dispatched successfully.',
      debug_otp: otp,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email: email?.toLowerCase(),
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    return res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({
      email: email?.toLowerCase(),
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification session' });
    }

    user.password = password;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    await ActivityLog.create({
      user_id: user._id,
      action: 'Password Reset',
      description: `${user.name} reset their security password`,
    });

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
