const jwt = require('jsonwebtoken');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'skillbridge_access_secret_fallback', {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'skillbridge_refresh_secret_fallback', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'skillbridge_access_secret_fallback');
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'skillbridge_refresh_secret_fallback');
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const tokenPayload = {
    id: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Cookie options
  const isProd = process.env.NODE_ENV === 'production';
  const accessCookieOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  };

  const refreshCookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  };

  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
    accessToken, // also sent in response body for flexible header auth if preferred
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  sendTokenResponse,
};
