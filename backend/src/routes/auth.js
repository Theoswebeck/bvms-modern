const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middlewares/auth');
const { sendResetVerificationEmail } = require('../services/mailer');

const router = express.Router();

// In-memory store for 6-digit password reset codes (email -> { code, expiresAt })
const resetTokens = new Map();

const roleAliases = {
  admin: 'theoswelbeck@gmail.com',
  '2405001064': 'theoswelbeck@gmail.com',
  officer: 'jolly@gmail.com',
  'exam-officer': 'jolly@gmail.com',
  invigilator: 'uwambajebetty@gmail.com',
  das: 'das@gmail.com',
};

function resolveIdentifier(identifier = '') {
  const trimmed = String(identifier).trim();
  return roleAliases[trimmed.toLowerCase()] || trimmed;
}

function validateStrongPassword(password = '') {
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter (A-Z).';
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter (a-z).';
  if (!/\d/.test(password)) return 'Password must include at least one number (0-9).';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character (@$!%*?&#_-).';
  return null;
}

// Helper to verify both modern BCrypt hashes and legacy 2021 SHA-1 hashes
async function verifyPassword(plainPassword, storedHash) {
  if (!storedHash) return false;
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return bcrypt.compare(plainPassword, storedHash);
  }
  const sha1Hex = crypto.createHash('sha1').update(plainPassword).digest('hex').replace(/^0+/, '');
  const sha1Full = crypto.createHash('sha1').update(plainPassword).digest('hex');
  return storedHash === sha1Hex || storedHash === sha1Full;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Official Email and password are required' });
    }

    const lookupEmail = resolveIdentifier(email);

    const result = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [lookupEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid Official Email or password' });
    }

    const user = result.rows[0];
    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Official Email or password' });
    }

    let invigilatorId = null;
    if (user.user_type.toLowerCase() === 'invigilator') {
      const invRes = await db.query(
        'SELECT invigilator_id FROM invigilator WHERE LOWER(email) = LOWER($1)',
        [user.email]
      );
      if (invRes.rows.length > 0) {
        invigilatorId = invRes.rows[0].invigilator_id;
      }
    }

    const payload = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      telephone: user.telephone,
      user_type: user.user_type,
      must_change_password: Boolean(user.must_change_password),
      invigilator_id: invigilatorId,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    return res.json({
      message: `Welcome ${user.firstname} ${user.lastname}`,
      token,
      user: payload,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// POST /api/auth/forgot-password - Verify user email & send a 6-digit reset OTP via Email
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier, email } = req.body;
    const rawEmail = (email || identifier || '').trim();
    if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawEmail)) {
      return res.status(400).json({ error: 'Please enter a valid Official Email address.' });
    }

    const result = await db.query(
      'SELECT id, firstname, lastname, email, telephone, user_type FROM users WHERE LOWER(email) = LOWER($1)',
      [rawEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No University of Kigali account found matching that email address.',
      });
    }

    const user = result.rows[0];

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    resetTokens.set(user.email.toLowerCase(), {
      code: otpCode,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    let mailResult = { sent: false, previewUrl: null, usingRealSmtp: false };
    try {
      mailResult = await sendResetVerificationEmail({
        toEmail: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        otpCode,
      });
    } catch (mailErr) {
      console.error('SMTP send warning:', mailErr.message);
    }

    return res.json({
      message: mailResult.usingRealSmtp
        ? `A 6-digit verification code has been emailed to ${user.email}.`
        : `A 6-digit verification email has been dispatched to ${user.email}.`,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      emailSent: mailResult.sent,
      usingRealSmtp: mailResult.usingRealSmtp,
      emailPreviewUrl: mailResult.previewUrl,
      // Only include fallback code if real SMTP is not configured yet
      demoResetCode: mailResult.usingRealSmtp ? undefined : otpCode,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to initiate password recovery.' });
  }
});

// POST /api/auth/reset-password - Complete password reset using 6-digit OTP and strong password validation
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, resetCode, newPassword } = req.body;
    if (!identifier || !resetCode || !newPassword) {
      return res.status(400).json({ error: 'Identifier, 6-digit verification code, and new password are required.' });
    }

    const lookupEmail = resolveIdentifier(identifier).toLowerCase();
    const record = resetTokens.get(lookupEmail);

    if (!record || record.code !== String(resetCode).trim()) {
      return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check and try again.' });
    }

    if (Date.now() > record.expiresAt) {
      resetTokens.delete(lookupEmail);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    const pwError = validateStrongPassword(newPassword);
    if (pwError) {
      return res.status(400).json({ error: pwError });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = $1, must_change_password = FALSE WHERE LOWER(email) = LOWER($2)',
      [newHash, lookupEmail]
    );

    resetTokens.delete(lookupEmail);

    return res.json({
      message: 'Your University of Kigali password has been reset successfully! You can now sign in.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, firstname, lastname, email, telephone, user_type, must_change_password FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    return res.json({ user: { ...user, invigilator_id: req.user.invigilator_id } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load user profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstname, lastname, email, telephone } = req.body;
    if (!firstname || firstname.trim().length < 2 || !lastname || lastname.trim().length < 2) {
      return res.status(400).json({ error: 'First name and last name must each be at least 2 characters.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!telephone || !/^(07[2389]\d{7}|\+?2507[2389]\d{7})$/.test(telephone.trim())) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit Rwanda phone number (e.g. 0788123456).' });
    }

    await db.query(
      'UPDATE users SET firstname = $1, lastname = $2, email = $3, telephone = $4 WHERE id = $5',
      [firstname.trim(), lastname.trim(), email.trim(), telephone.trim(), req.user.id]
    );

    if (req.user.user_type.toLowerCase() === 'invigilator') {
      await db.query(
        'UPDATE invigilator SET firstname = $1, lastname = $2, email = $3, telephone = $4 WHERE LOWER(email) = LOWER($5)',
        [firstname.trim(), lastname.trim(), email.trim(), telephone.trim(), req.user.email]
      );
    }

    return res.json({
      message: 'Profile updated successfully',
      user: {
        ...req.user,
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
      },
    });
  } catch (err) {
    return res.status(400).json({ error: 'Could not update profile (email may already be in use)' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required' });
    }

    const pwError = validateStrongPassword(newPassword);
    if (pwError) {
      return res.status(400).json({ error: pwError });
    }

    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = $1, must_change_password = FALSE WHERE id = $2',
      [newHash, req.user.id]
    );

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
