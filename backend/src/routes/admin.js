const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Protect all admin routes; allow reading departments/faculties/students by other staff roles too
router.use(authenticateToken);

// GET /api/admin/stats - Dashboard metrics for any role
router.get('/stats', async (req, res) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) AS count FROM users');
    const studentsCount = await db.query('SELECT COUNT(*) AS count FROM student');
    const departmentsCount = await db.query('SELECT COUNT(*) AS count FROM department');
    const facultiesCount = await db.query('SELECT COUNT(*) AS count FROM faculity');
    const invigilatorsCount = await db.query('SELECT COUNT(*) AS count FROM invigilator');
    const modulesCount = await db.query('SELECT COUNT(*) AS count FROM module');
    const roomsCount = await db.query('SELECT COUNT(*) AS count FROM room');
    const examPlansCount = await db.query('SELECT COUNT(*) AS count FROM exam_plan');
    const submittedCount = await db.query("SELECT COUNT(*) AS count FROM exam_plan WHERE exam_status = 'Submitted'");
    const presentCount = await db.query("SELECT COUNT(*) AS count FROM exam_plan WHERE exam_status = 'Present'");

    return res.json({
      users: Number(usersCount.rows[0].count),
      students: Number(studentsCount.rows[0].count),
      departments: Number(departmentsCount.rows[0].count),
      faculties: Number(facultiesCount.rows[0].count),
      invigilators: Number(invigilatorsCount.rows[0].count),
      modules: Number(modulesCount.rows[0].count),
      rooms: Number(roomsCount.rows[0].count),
      totalAllocatedBooklets: Number(examPlansCount.rows[0].count),
      submittedBooklets: Number(submittedCount.rows[0].count),
      presentBooklets: Number(presentCount.rows[0].count),
      dbStatus: db.getDbStatus(),
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard statistics' });
  }
});

// ==================== USERS MANAGEMENT (Admin only) ====================
router.get('/users', authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, firstname, lastname, email, telephone, user_type, must_change_password FROM users ORDER BY id ASC'
    );
    return res.json({ users: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load users' });
  }
});

router.post('/users', authorizeRoles('admin'), async (req, res) => {
  try {
    const { firstname, lastname, email, telephone, user_type, password } = req.body;
    if (!firstname || !lastname || !email || !telephone || !user_type) {
      return res.status(400).json({ error: 'All user fields are required' });
    }

    const defaultPass = password || '12345';
    const hash = await bcrypt.hash(defaultPass, 10);

    const result = await db.query(
      `INSERT INTO users (firstname, lastname, email, telephone, password, user_type, must_change_password)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, firstname, lastname, email, telephone, user_type`,
      [firstname.trim(), lastname.trim(), email.trim(), telephone.trim(), hash, user_type, !password]
    );

    // If user is Invigilator, also ensure they exist in invigilator table
    if (user_type.toLowerCase() === 'invigilator') {
      await db.query(
        `INSERT INTO invigilator (firstname, lastname, email, telephone)
         VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
        [firstname.trim(), lastname.trim(), email.trim(), telephone.trim()]
      );
    }

    return res.status(201).json({
      message: 'User registered successfully (Default password: ' + defaultPass + ')',
      user: result.rows[0],
    });
  } catch (err) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }
});

router.put('/users/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, telephone, user_type } = req.body;
    await db.query(
      'UPDATE users SET firstname = $1, lastname = $2, email = $3, telephone = $4, user_type = $5 WHERE id = $6',
      [firstname, lastname, email, telephone, user_type, id]
    );
    return res.json({ message: 'User updated successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userRes = await db.query('SELECT email FROM users WHERE id = $1', [id]);
    if (userRes.rows.length > 0) {
      await db.query('DELETE FROM invigilator WHERE LOWER(email) = LOWER($1)', [userRes.rows[0].email]);
    }
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to delete user' });
  }
});

// ==================== SCHOOLS / DEPARTMENTS ====================
router.get('/departments', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM department ORDER BY dep_id ASC');
    return res.json({ departments: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.post('/departments', authorizeRoles('admin'), async (req, res) => {
  try {
    const { abbreviation, dep_name } = req.body;
    if (!abbreviation || !dep_name) {
      return res.status(400).json({ error: 'Abbreviation and School/Department Name are required' });
    }
    const result = await db.query(
      'INSERT INTO department (abbreviation, dep_name) VALUES ($1, $2) RETURNING *',
      [abbreviation.trim().toUpperCase(), dep_name.trim()]
    );
    return res.status(201).json({
      message: 'School / Department registered successfully',
      department: result.rows[0],
    });
  } catch (err) {
    return res.status(400).json({ error: 'School / Department abbreviation already exists' });
  }
});

router.put('/departments/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { abbreviation, dep_name } = req.body;
    await db.query(
      'UPDATE department SET abbreviation = $1, dep_name = $2 WHERE dep_id = $3',
      [abbreviation.trim().toUpperCase(), dep_name.trim(), id]
    );
    return res.json({ message: 'School / Department updated successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to update department' });
  }
});

router.delete('/departments/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM department WHERE dep_id = $1', [req.params.id]);
    return res.json({ message: 'School / Department deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Cannot delete department with linked programs or students' });
  }
});

// ==================== PROGRAMS / FACULTIES (OPTIONS) ====================
router.get('/faculties', async (req, res) => {
  try {
    const { dep_id } = req.query;
    let sql = `
      SELECT f.*, d.dep_name, d.abbreviation AS dep_abbreviation
      FROM faculity f
      JOIN department d ON f.dep_id = d.dep_id
    `;
    const params = [];
    if (dep_id) {
      sql += ' WHERE f.dep_id = $1';
      params.push(dep_id);
    }
    sql += ' ORDER BY f.fac_id ASC';
    const result = await db.query(sql, params);
    return res.json({ faculties: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch faculties/programs' });
  }
});

router.post('/faculties', authorizeRoles('admin'), async (req, res) => {
  try {
    const { abbreviation, fac_name, dep_id } = req.body;
    if (!abbreviation || !fac_name || !dep_id) {
      return res.status(400).json({ error: 'All program fields are required' });
    }
    const result = await db.query(
      'INSERT INTO faculity (abbreviation, fac_name, dep_id) VALUES ($1, $2, $3) RETURNING *',
      [abbreviation.trim().toUpperCase(), fac_name.trim(), Number(dep_id)]
    );
    return res.status(201).json({
      message: 'Program / Option registered successfully',
      faculty: result.rows[0],
    });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to register program' });
  }
});

router.put('/faculties/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { abbreviation, fac_name, dep_id } = req.body;
    await db.query(
      'UPDATE faculity SET abbreviation = $1, fac_name = $2, dep_id = $3 WHERE fac_id = $4',
      [abbreviation.trim().toUpperCase(), fac_name.trim(), Number(dep_id), id]
    );
    return res.json({ message: 'Program / Option updated successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to update program' });
  }
});

router.delete('/faculties/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM faculity WHERE fac_id = $1', [req.params.id]);
    return res.json({ message: 'Program / Option deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Cannot delete program with enrolled students' });
  }
});

// ==================== STUDENTS MANAGEMENT ====================
router.get('/students', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*,
             d.dep_name, d.abbreviation AS dep_abbreviation,
             f.fac_name, f.abbreviation AS fac_abbreviation
      FROM student s
      LEFT JOIN department d ON s.department = d.dep_id
      LEFT JOIN faculity f ON s.options = f.fac_id
      ORDER BY s.id ASC
    `);
    return res.json({ students: result.rows });
  } catch (err) {
    console.error('Students fetch error:', err);
    return res.status(500).json({ error: 'Failed to load students' });
  }
});

router.post('/students', authorizeRoles('admin'), async (req, res) => {
  try {
    const { reg_number, firstname, lastname, email, telephone, department, options, year } = req.body;
    if (!reg_number || !firstname || !lastname || !email || !telephone || !department || !options || !year) {
      return res.status(400).json({ error: 'All student fields are required' });
    }
    const result = await db.query(
      `INSERT INTO student (reg_number, firstname, lastname, email, telephone, department, options, year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        reg_number.trim(),
        firstname.trim(),
        lastname.trim(),
        email.trim(),
        telephone.trim(),
        Number(department),
        Number(options),
        Number(year),
      ]
    );
    return res.status(201).json({
      message: 'Student added successfully',
      student: result.rows[0],
    });
  } catch (err) {
    return res.status(400).json({ error: 'Student Registration Number or Email already exists' });
  }
});

// Bulk CSV Student Import
router.post('/students/bulk', authorizeRoles('admin'), async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'No student rows provided for bulk import' });
    }
    let inserted = 0;
    let skipped = 0;

    for (const s of students) {
      try {
        await db.query(
          `INSERT INTO student (reg_number, firstname, lastname, email, telephone, department, options, year)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            String(s.reg_number).trim(),
            String(s.firstname).trim(),
            String(s.lastname).trim(),
            String(s.email).trim(),
            String(s.telephone || '0780000000').trim(),
            Number(s.department || 1),
            Number(s.options || 1),
            Number(s.year || 1),
          ]
        );
        inserted++;
      } catch (e) {
        skipped++;
      }
    }

    return res.json({
      message: `Bulk import complete: ${inserted} student(s) added, ${skipped} skipped (duplicates).`,
      inserted,
      skipped,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Bulk student import failed' });
  }
});

router.put('/students/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reg_number, firstname, lastname, email, telephone, department, options, year } = req.body;
    await db.query(
      `UPDATE student
       SET reg_number = $1, firstname = $2, lastname = $3, email = $4,
           telephone = $5, department = $6, options = $7, year = $8
       WHERE id = $9`,
      [
        reg_number.trim(),
        firstname.trim(),
        lastname.trim(),
        email.trim(),
        telephone.trim(),
        Number(department),
        Number(options),
        Number(year),
        id,
      ]
    );
    return res.json({ message: 'Student updated successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to update student' });
  }
});

router.delete('/students/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM student WHERE id = $1', [req.params.id]);
    return res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;
