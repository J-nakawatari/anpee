import jwt from 'jsonwebtoken';
export const generateAccessToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
};
export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId: userId.toString() }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
export const generateEmailVerificationToken = (userId) => {
    return jwt.sign({
        type: 'email_verification',
        userId,
        timestamp: Date.now()
    }, process.env.JWT_SECRET, { expiresIn: '24h' });
};
export const generatePasswordResetToken = () => {
    return jwt.sign({ type: 'password_reset', timestamp: Date.now() }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
