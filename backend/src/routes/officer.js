const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();
router.use(authenticateToken);

// ==================== INVIGILATORS MANAGEMENT ====================
router.get('/invigilators', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM invigilator ORDER BY invigilator_id ASC');
    return res.json({ invigilators: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load invigilators' });
  }
});

router.post('/invigilators', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    const { firstname, lastname, email, telephone } = req.body;
    if (!firstname || !lastname || !email || !telephone) {
      return res.status(400).json({ error: 'All invigilator fields are required' });
    }

    const invRes = await db.query(
      `INSERT INTO invigilator (firstname, lastname, email, telephone)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [firstname.trim(), lastname.trim(), email.trim(), telephone.trim()]
    );

    // Also create a login user account for the invigilator (matches 2021 invigilator.jsp behavior)
    const defaultHash = await bcrypt.hash('12345', 10);
    await db.query(
      `INSERT INTO users (firstname, lastname, email, telephone, password, user_type, must_change_password)
       VALUES ($1, $2, $3, $4, $5, 'Invigilator', TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [firstname.trim(), lastname.trim(), email.trim(), telephone.trim(), defaultHash]
    );

    return res.status(201).json({
      message: 'Invigilator registered and user account created (Default password: 12345)',
      invigilator: invRes.rows[0],
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invigilator email already registered' });
  }
});

router.put('/invigilators/:id', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, telephone } = req.body;
    const oldRes = await db.query('SELECT email FROM invigilator WHERE invigilator_id = $1', [id]);
    await db.query(
      'UPDATE invigilator SET firstname = $1, lastname = $2, email = $3, telephone = $4 WHERE invigilator_id = $5',
      [firstname, lastname, email, telephone, id]
    );
    if (oldRes.rows.length > 0) {
      await db.query(
        'UPDATE users SET firstname = $1, lastname = $2, email = $3, telephone = $4 WHERE LOWER(email) = LOWER($5)',
        [firstname, lastname, email, telephone, oldRes.rows[0].email]
      );
    }
    return res.json({ message: 'Invigilator updated successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to update invigilator' });
  }
});

router.delete('/invigilators/:id', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const oldRes = await db.query('SELECT email FROM invigilator WHERE invigilator_id = $1', [id]);
    await db.query('DELETE FROM invigilator WHERE invigilator_id = $1', [id]);
    if (oldRes.rows.length > 0) {
      await db.query('DELETE FROM users WHERE LOWER(email) = LOWER($1)', [oldRes.rows[0].email]);
    }
    return res.json({ message: 'Invigilator deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to delete invigilator' });
  }
});

// ==================== ROOMS MANAGEMENT ====================
router.get('/rooms', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM room ORDER BY room_id ASC');
    return res.json({ rooms: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load rooms' });
  }
});

router.post('/rooms', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    const { room, numberofstudent } = req.body;
    if (!room || !numberofstudent) {
      return res.status(400).json({ error: 'Room name and capacity are required' });
    }
    const result = await db.query(
      'INSERT INTO room (room, numberofstudent) VALUES ($1, $2) RETURNING *',
      [room.trim(), Number(numberofstudent)]
    );
    return res.status(201).json({
      message: 'Examination room registered successfully',
      room: result.rows[0],
    });
  } catch (err) {
    return res.status(400).json({ error: 'Room name already exists' });
  }
});

router.put('/rooms/:id', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { room, numberofstudent } = req.body;
    await db.query(
      'UPDATE room SET room = $1, numberofstudent = $2 WHERE room_id = $3',
      [room.trim(), Number(numberofstudent), id]
    );
    return res.json({ message: 'Room updated successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to update room' });
  }
});

router.delete('/rooms/:id', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM room WHERE room_id = $1', [req.params.id]);
    return res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to delete room' });
  }
});

// ==================== MODULES MANAGEMENT ====================
router.get('/modules', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*,
             d.dep_name, d.abbreviation AS dep_abbreviation,
             f.fac_name, f.abbreviation AS fac_abbreviation
      FROM module m
      LEFT JOIN department d ON m.dep_id = d.dep_id
      LEFT JOIN faculity f ON m.fac_id = f.fac_id
      ORDER BY m.id ASC
    `);
    return res.json({ modules: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load modules' });
  }
});

router.post('/modules', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    const { module_code, module_name, dep_id, fac_id, year } = req.body;
    if (!module_code || !module_name || !dep_id || !fac_id || !year) {
      return res.status(400).json({ error: 'All module fields are required' });
    }
    const result = await db.query(
      `INSERT INTO module (module_code, module_name, dep_id, fac_id, year)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [module_code.trim().toUpperCase(), module_name.trim(), Number(dep_id), Number(fac_id), Number(year)]
    );
    return res.status(201).json({
      message: 'Module registered successfully',
      module: result.rows[0],
    });
  } catch (err) {
    return res.status(400).json({ error: 'Module code already exists' });
  }
});

router.put('/modules/:id', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { module_code, module_name, dep_id, fac_id, year } = req.body;
    await db.query(
      `UPDATE module
       SET module_code = $1, module_name = $2, dep_id = $3, fac_id = $4, year = $5
       WHERE id = $6`,
      [module_code.trim().toUpperCase(), module_name.trim(), Number(dep_id), Number(fac_id), Number(year), id]
    );
    return res.json({ message: 'Module updated successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to update module' });
  }
});

router.delete('/modules/:id', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM module WHERE id = $1', [req.params.id]);
    return res.json({ message: 'Module deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to delete module' });
  }
});

// ==================== INVIGILATOR ROOM ASSIGNMENTS ====================
router.get('/invigilator-assignments', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT mi.id, mi.invigilator_id, mi.room_id,
             TO_CHAR(mi.exam_date, 'YYYY-MM-DD') AS exam_date,
             i.firstname, i.lastname, i.email, i.telephone,
             r.room, r.numberofstudent
      FROM manage_invigilator mi
      JOIN invigilator i ON mi.invigilator_id = i.invigilator_id
      JOIN room r ON mi.room_id = r.room_id
      ORDER BY mi.exam_date DESC, r.room ASC
    `);
    return res.json({ assignments: result.rows });
  } catch (err) {
    // Fallback if TO_CHAR is not registered in pg-mem
    const fallbackRes = await db.query(`
      SELECT mi.id, mi.invigilator_id, mi.room_id, mi.exam_date,
             i.firstname, i.lastname, i.email, i.telephone,
             r.room, r.numberofstudent
      FROM manage_invigilator mi
      JOIN invigilator i ON mi.invigilator_id = i.invigilator_id
      JOIN room r ON mi.room_id = r.room_id
      ORDER BY mi.id DESC
    `);
    const rows = fallbackRes.rows.map((r) => ({
      ...r,
      exam_date: r.exam_date instanceof Date ? r.exam_date.toISOString().split('T')[0] : String(r.exam_date).split('T')[0],
    }));
    return res.json({ assignments: rows });
  }
});

router.post('/invigilator-assignments', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    const { invigilator_id, room_id, exam_date } = req.body;
    if (!invigilator_id || !room_id || !exam_date) {
      return res.status(400).json({ error: 'Invigilator, room, and exam date are required' });
    }
    const result = await db.query(
      `INSERT INTO manage_invigilator (invigilator_id, room_id, exam_date)
       VALUES ($1, $2, $3) RETURNING *`,
      [Number(invigilator_id), Number(room_id), exam_date]
    );
    return res.status(201).json({
      message: 'Invigilator assigned to examination room successfully',
      assignment: result.rows[0],
    });
  } catch (err) {
    return res.status(400).json({ error: 'This invigilator is already assigned to this room on this date' });
  }
});

router.put('/invigilator-assignments/:id', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { invigilator_id, room_id, exam_date } = req.body;
    await db.query(
      'UPDATE manage_invigilator SET invigilator_id = $1, room_id = $2, exam_date = $3 WHERE id = $4',
      [Number(invigilator_id), Number(room_id), exam_date, id]
    );
    return res.json({ message: 'Invigilator assignment updated successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to update assignment' });
  }
});

router.delete('/invigilator-assignments/:id', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM manage_invigilator WHERE id = $1', [req.params.id]);
    return res.json({ message: 'Assignment removed successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to remove assignment' });
  }
});

// ==================== TIMETABLE & ROOM STUDENT ALLOCATION ====================
// GET /api/officer/eligible-students?room_id=1&module_code=CIT3101&exam_date=2026-11-20
router.get('/eligible-students', async (req, res) => {
  try {
    const { room_id, module_code, exam_date } = req.query;
    if (!room_id || !module_code || !exam_date) {
      return res.status(400).json({ error: 'room_id, module_code, and exam_date are required' });
    }

    const roomRes = await db.query('SELECT * FROM room WHERE room_id = $1', [Number(room_id)]);
    if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    const room = roomRes.rows[0];

    const modRes = await db.query(
      `SELECT m.*, d.dep_name, d.abbreviation AS dep_abbreviation,
              f.fac_name, f.abbreviation AS fac_abbreviation
       FROM module m
       JOIN department d ON m.dep_id = d.dep_id
       JOIN faculity f ON m.fac_id = f.fac_id
       WHERE m.module_code = $1`,
      [module_code]
    );
    if (modRes.rows.length === 0) return res.status(404).json({ error: 'Module not found' });
    const mod = modRes.rows[0];

    // Current occupancy of this room on this date
    const occRes = await db.query(
      'SELECT COUNT(*) AS count FROM exam_plan WHERE room_id = $1 AND exam_date = $2',
      [Number(room_id), exam_date]
    );
    const currentOccupied = Number(occRes.rows[0].count);
    const remainingCapacity = Math.max(0, room.numberofstudent - currentOccupied);

    // Get students in the module's department, faculty, and year who are NOT already scheduled on that date
    const stuRes = await db.query(
      `SELECT s.*
       FROM student s
       WHERE s.department = $1 AND s.options = $2 AND s.year = $3
       AND s.reg_number NOT IN (
         SELECT reg_number FROM exam_plan WHERE exam_date = $4
       )
       ORDER BY s.reg_number ASC`,
      [mod.dep_id, mod.fac_id, mod.year, exam_date]
    );

    return res.json({
      room,
      module: mod,
      exam_date,
      currentOccupied,
      remainingCapacity,
      eligibleStudents: stuRes.rows,
    });
  } catch (err) {
    console.error('Eligible students error:', err);
    return res.status(500).json({ error: 'Failed to check eligible students' });
  }
});

// POST /api/officer/timetable - Allocate selected students (or auto-allocate) to a room
router.post('/timetable', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    const { room_id, module_code, exam_date, reg_numbers } = req.body;
    if (!room_id || !module_code || !exam_date || !Array.isArray(reg_numbers) || reg_numbers.length === 0) {
      return res.status(400).json({ error: 'Room, module, exam date, and at least one student are required' });
    }

    const roomRes = await db.query('SELECT * FROM room WHERE room_id = $1', [Number(room_id)]);
    if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    const room = roomRes.rows[0];

    const occRes = await db.query(
      'SELECT COUNT(*) AS count FROM exam_plan WHERE room_id = $1 AND exam_date = $2',
      [Number(room_id), exam_date]
    );
    let currentOccupied = Number(occRes.rows[0].count);

    if (currentOccupied >= room.numberofstudent) {
      return res.status(400).json({ error: `Room ${room.room} has reached its maximum capacity (${room.numberofstudent} students)` });
    }

    let addedCount = 0;
    for (const reg of reg_numbers) {
      if (currentOccupied >= room.numberofstudent) break;
      currentOccupied++;
      const bookletCode = `UOK-BK-${exam_date.replace(/-/g, '')}-${room_id}-${String(currentOccupied).padStart(3, '0')}`;
      try {
        await db.query(
          `INSERT INTO exam_plan (room_id, exam_date, module_code, reg_number, booklet_code, seat_number, exam_status)
           VALUES ($1, $2, $3, $4, $5, $6, 'Not Submitted')`,
          [Number(room_id), exam_date, module_code, reg, bookletCode, currentOccupied]
        );
        addedCount++;
      } catch (e) {
        // Ignore duplicate
      }
    }

    return res.status(201).json({
      message: `${addedCount} student(s) successfully allocated to ${room.room} on ${exam_date}`,
      addedCount,
    });
  } catch (err) {
    console.error('Timetable allocation error:', err);
    return res.status(500).json({ error: 'Failed to allocate students to timetable' });
  }
});

// GET /api/officer/exam-plans - Full filterable list of exam plans with student, room, module, and invigilator details
router.get('/exam-plans', async (req, res) => {
  try {
    const { exam_date, room_id, module_code } = req.query;
    const allPlansRes = await db.query(`
      SELECT ep.id, ep.room_id, ep.exam_date, ep.module_code, ep.reg_number,
             ep.booklet_code, ep.seat_number, ep.exam_status,
             ep.checked_in_at, ep.submitted_at, ep.incident_note,
             s.firstname, s.lastname, s.email, s.telephone, s.year,
             d.dep_name, d.abbreviation AS dep_abbreviation,
             f.fac_name, f.abbreviation AS fac_abbreviation,
             m.module_name,
             r.room AS room_name, r.numberofstudent AS room_capacity
      FROM exam_plan ep
      JOIN student s ON ep.reg_number = s.reg_number
      JOIN department d ON s.department = d.dep_id
      JOIN faculity f ON s.options = f.fac_id
      JOIN module m ON ep.module_code = m.module_code
      JOIN room r ON ep.room_id = r.room_id
      ORDER BY ep.id ASC
    `);

    const invAssignRes = await db.query(`
      SELECT mi.room_id, mi.exam_date, i.invigilator_id, i.firstname, i.lastname, i.email
      FROM manage_invigilator mi
      JOIN invigilator i ON mi.invigilator_id = i.invigilator_id
    `);

    const invMap = {};
    for (const ia of invAssignRes.rows) {
      const dateStr = ia.exam_date instanceof Date ? ia.exam_date.toISOString().split('T')[0] : String(ia.exam_date).split('T')[0];
      const key = `${ia.room_id}_${dateStr}`;
      invMap[key] = ia;
    }

    let plans = allPlansRes.rows.map((p) => {
      const dateStr = p.exam_date instanceof Date ? p.exam_date.toISOString().split('T')[0] : String(p.exam_date).split('T')[0];
      const inv = invMap[`${p.room_id}_${dateStr}`] || null;
      return {
        ...p,
        exam_date: dateStr,
        invigilator_id: inv ? inv.invigilator_id : null,
        invigilator_name: inv ? `${inv.firstname} ${inv.lastname}` : 'Unassigned',
      };
    });

    if (exam_date) {
      plans = plans.filter((p) => p.exam_date === exam_date);
    }
    if (room_id) {
      plans = plans.filter((p) => Number(p.room_id) === Number(room_id));
    }
    if (module_code) {
      plans = plans.filter((p) => p.module_code === module_code);
    }

    return res.json({ examPlans: plans });
  } catch (err) {
    console.error('Exam plans error:', err);
    return res.status(500).json({ error: 'Failed to load exam plans' });
  }
});

// DELETE /api/officer/exam-plans/:id
router.delete('/exam-plans/:id', authorizeRoles('examination_officer', 'admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM exam_plan WHERE id = $1', [req.params.id]);
    return res.json({ message: 'Student removed from exam plan' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to remove exam plan entry' });
  }
});

module.exports = router;
