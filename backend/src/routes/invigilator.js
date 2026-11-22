const express = require('express');
const os = require('os');
const jwt = require('jsonwebtoken');
const bwipjs = require('bwip-js');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middlewares/auth');
const { sendBookletSubmissionEmail } = require('../services/mailer');

const router = express.Router();

function getLanIpv4Addresses() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({ interface: name, address: net.address });
      }
    }
  }
  // Prefer standard Wi-Fi / LAN ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  ips.sort((a, b) => {
    const score = (ip) =>
      ip.startsWith('192.168.') ? 0 : ip.startsWith('10.') ? 1 : ip.startsWith('172.') ? 2 : 3;
    return score(a.address) - score(b.address);
  });
  return ips;
}

// GET /api/barcode?value=UoK/2024/IT/001 (Public image endpoint for <img src="..."> in booklets)
router.get('/barcode', async (req, res) => {
  try {
    const value = req.query.value || 'UOK-BVMS-2026';
    const pngBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: String(value),
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: 'center',
    });
    res.set('Content-Type', 'image/png');
    res.send(pngBuffer);
  } catch (err) {
    console.error('Barcode generation error:', err);
    res.status(500).send('Barcode error');
  }
});

// GET /api/qrcode?value=... (Public QR code PNG generator for Mobile Phone Scanner pairing)
router.get('/qrcode', async (req, res) => {
  try {
    const value = req.query.value;
    if (!value) {
      return res.status(400).send('Missing QR value');
    }
    const pngBuffer = await bwipjs.toBuffer({
      bcid: 'qrcode',
      text: String(value),
      scale: 5,
      paddingwidth: 4,
      paddingheight: 4,
      eclevel: 'M',
    });
    res.set('Content-Type', 'image/png');
    res.send(pngBuffer);
  } catch (err) {
    console.error('QR code generation error:', err);
    res.status(500).send('QR code error');
  }
});

// Protect remaining invigilator endpoints
router.use(authenticateToken);

// GET /api/invigilator/my-schedule - Get dates, rooms, and modules assigned to the logged-in invigilator (or all for admin/officer)
router.get('/my-schedule', async (req, res) => {
  try {
    let invigilatorId = req.user.invigilator_id;

    if (!invigilatorId && req.user.user_type.toLowerCase() === 'invigilator') {
      const invRes = await db.query(
        'SELECT invigilator_id FROM invigilator WHERE LOWER(email) = LOWER($1)',
        [req.user.email]
      );
      if (invRes.rows.length > 0) {
        invigilatorId = invRes.rows[0].invigilator_id;
      }
    }

    const assignRes = await db.query(`
      SELECT mi.id, mi.invigilator_id, mi.room_id, mi.exam_date,
             r.room AS room_name, r.numberofstudent AS capacity,
             i.firstname AS inv_firstname, i.lastname AS inv_lastname, i.email AS inv_email
      FROM manage_invigilator mi
      JOIN room r ON mi.room_id = r.room_id
      JOIN invigilator i ON mi.invigilator_id = i.invigilator_id
      ORDER BY mi.id DESC
    `);

    let assignments = assignRes.rows.map((a) => ({
      ...a,
      exam_date: a.exam_date instanceof Date ? a.exam_date.toISOString().split('T')[0] : String(a.exam_date).split('T')[0],
    }));

    if (req.user.user_type.toLowerCase() === 'invigilator' && invigilatorId) {
      assignments = assignments.filter((a) => Number(a.invigilator_id) === Number(invigilatorId));
    }

    return res.json({ assignments });
  } catch (err) {
    console.error('Invigilator schedule error:', err);
    return res.status(500).json({ error: 'Failed to load invigilator schedule' });
  }
});

// POST /api/invigilator/verify - Verify student booklet by Reg_number OR Booklet_code (Fixes 2021 first-row bug!)
router.post('/verify', async (req, res) => {
  try {
    const { room_id, exam_date, module_code, code, action, incident_note } = req.body;
    // code can be either student's Reg_number (e.g. "UoK/2024/IT/001") OR booklet_code (e.g. "UOK-BK-2026-0001")
    // action can be 'Present' (Check-in / Issue Booklet), 'Submitted' (Final Booklet Submission), or 'Irregularity'
    if (!code) {
      return res.status(400).json({ error: 'Please enter or scan a Registration Number or Booklet Barcode' });
    }

    const trimmedCode = String(code).trim();
    const targetStatus = action || 'Submitted';

    const plansRes = await db.query(`
      SELECT ep.*, s.firstname, s.lastname, s.email AS student_email, m.module_name, r.room AS room_name
      FROM exam_plan ep
      JOIN student s ON ep.reg_number = s.reg_number
      JOIN module m ON ep.module_code = m.module_code
      JOIN room r ON ep.room_id = r.room_id
      WHERE (LOWER(ep.reg_number) = LOWER($1) OR LOWER(ep.booklet_code) = LOWER($1))
    `, [trimmedCode]);

    const normalizedPlans = plansRes.rows.map((p) => ({
      ...p,
      exam_date_str: p.exam_date instanceof Date ? p.exam_date.toISOString().split('T')[0] : String(p.exam_date).split('T')[0],
    }));

    // Filter by room_id, exam_date, and module_code if provided
    let matched = normalizedPlans;
    if (room_id) {
      matched = matched.filter((p) => Number(p.room_id) === Number(room_id));
    }
    if (exam_date) {
      matched = matched.filter((p) => p.exam_date_str === exam_date);
    }
    if (module_code) {
      matched = matched.filter((p) => p.module_code.toLowerCase() === module_code.toLowerCase());
    }

    if (matched.length === 0) {
      // Check if the student is registered in a different room on that date to give a helpful message!
      if (normalizedPlans.length > 0) {
        const other = normalizedPlans[0];
        return res.status(404).json({
          error: `Student (${other.firstname} ${other.lastname} - ${other.reg_number}) is NOT registered in this room/module. They are assigned to ${other.room_name} for ${other.module_name} on ${other.exam_date_str}.`,
        });
      }
      return res.status(404).json({
        error: `No examination sitting found for barcode / registration number "${trimmedCode}".`,
      });
    }

    const targetSitting = matched[0];

    let emailNotification = null;

    if (targetStatus === 'Present') {
      await db.query(
        'UPDATE exam_plan SET exam_status = $1, checked_in_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['Present', targetSitting.id]
      );
    } else if (targetStatus === 'Irregularity') {
      await db.query(
        'UPDATE exam_plan SET exam_status = $1, incident_note = $2 WHERE id = $3',
        ['Irregularity', incident_note || 'Irregularity logged by invigilator', targetSitting.id]
      );
    } else {
      const submittedAt = new Date();
      await db.query(
        'UPDATE exam_plan SET exam_status = $1, submitted_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['Submitted', targetSitting.id]
      );

      // Send submission confirmation email to the student (non-blocking if SMTP fails)
      if (targetSitting.student_email) {
        const invigilatorName = req.user
          ? `${req.user.firstname || ''} ${req.user.lastname || ''}`.trim()
          : 'Room Invigilator';
        try {
          emailNotification = await sendBookletSubmissionEmail({
            toEmail: targetSitting.student_email,
            firstname: targetSitting.firstname,
            lastname: targetSitting.lastname,
            regNumber: targetSitting.reg_number,
            bookletCode: targetSitting.booklet_code,
            moduleCode: targetSitting.module_code,
            moduleName: targetSitting.module_name,
            roomName: targetSitting.room_name,
            examDate: targetSitting.exam_date_str,
            seatNumber: targetSitting.seat_number,
            invigilatorName,
            submittedAt,
          });
        } catch (mailErr) {
          console.error('Booklet submission email warning:', mailErr.message);
          emailNotification = {
            sent: false,
            toEmail: targetSitting.student_email,
            error: mailErr.message,
          };
        }
      }
    }

    const emailNote =
      emailNotification?.sent
        ? ` Confirmation email sent to ${emailNotification.toEmail}.`
        : emailNotification && !emailNotification.sent
          ? ` (Note: Email to ${emailNotification.toEmail} could not be delivered.)`
          : '';

    return res.json({
      message: `${targetSitting.firstname} ${targetSitting.lastname} (${targetSitting.reg_number}) marked as "${targetStatus}" for ${targetSitting.module_name}!${emailNote}`,
      sitting: {
        ...targetSitting,
        exam_status: targetStatus,
      },
      emailNotification,
    });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).json({ error: 'Failed to verify student booklet' });
  }
});

// POST /api/invigilator/mobile-pair - Generate a short-lived pairing token + LAN IPs for phone scanning
router.post('/mobile-pair', async (req, res) => {
  try {
    const { room_id, room_name, exam_date, module_code, action } = req.body || {};
    const lanIps = getLanIpv4Addresses();
    const pairPayload = {
      id: req.user.id,
      email: req.user.email,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      user_type: req.user.user_type,
      invigilator_id: req.user.invigilator_id || null,
      mobile_pair: true,
      room_id: room_id || null,
      room_name: room_name || null,
      exam_date: exam_date || null,
      module_code: module_code || null,
      action: action || 'Submitted',
    };

    const pairToken = jwt.sign(pairPayload, JWT_SECRET, { expiresIn: '4h' });

    return res.json({
      pairToken,
      lanIps,
      primaryIp: lanIps.length > 0 ? lanIps[0].address : null,
      session: {
        room_id: pairPayload.room_id,
        room_name: pairPayload.room_name,
        exam_date: pairPayload.exam_date,
        module_code: pairPayload.module_code,
        action: pairPayload.action,
      },
    });
  } catch (err) {
    console.error('Mobile pair error:', err);
    return res.status(500).json({ error: 'Failed to create mobile scanner pairing link' });
  }
});

// GET /api/invigilator/mobile-session - Return active session info & live progress for paired mobile scanner
router.get('/mobile-session', async (req, res) => {
  try {
    const { room_id, exam_date, module_code } = req.user;
    const plansRes = await db.query(`
      SELECT ep.id, ep.room_id, ep.exam_date, ep.module_code, ep.reg_number,
             ep.booklet_code, ep.seat_number, ep.exam_status,
             s.firstname, s.lastname, m.module_name, r.room AS room_name
      FROM exam_plan ep
      JOIN student s ON ep.reg_number = s.reg_number
      JOIN module m ON ep.module_code = m.module_code
      JOIN room r ON ep.room_id = r.room_id
      ORDER BY ep.seat_number ASC, ep.id ASC
    `);

    let items = plansRes.rows.map((p) => ({
      ...p,
      exam_date: p.exam_date instanceof Date ? p.exam_date.toISOString().split('T')[0] : String(p.exam_date).split('T')[0],
    }));

    if (room_id) items = items.filter((p) => Number(p.room_id) === Number(room_id));
    if (exam_date) items = items.filter((p) => p.exam_date === exam_date);
    if (module_code) items = items.filter((p) => p.module_code.toLowerCase() === String(module_code).toLowerCase());

    const submitted = items.filter((p) => p.exam_status === 'Submitted').length;
    const present = items.filter((p) => p.exam_status === 'Present').length;
    const notSubmitted = items.filter((p) => p.exam_status === 'Not Submitted').length;

    return res.json({
      invigilator: {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
      },
      session: {
        room_id: room_id || null,
        room_name: req.user.room_name || (items[0]?.room_name || 'All Assigned Rooms'),
        exam_date: exam_date || (items[0]?.exam_date || 'All Dates'),
        module_code: module_code || null,
        action: req.user.action || 'Submitted',
      },
      stats: {
        total: items.length,
        submitted,
        present,
        notSubmitted,
      },
    });
  } catch (err) {
    console.error('Mobile session error:', err);
    return res.status(500).json({ error: 'Failed to load mobile scanner session' });
  }
});

module.exports = router;
