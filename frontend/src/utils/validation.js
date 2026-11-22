/**
 * University of Kigali (UoK) BVMS — Shared Form & Password Validation Utilities
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const RWANDA_PHONE_REGEX = /^(07[2389]\d{7}|\+?2507[2389]\d{7})$/;
export const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]{2,60}$/;
export const CODE_REGEX = /^[A-Za-z0-9/_-]{2,30}$/;

/**
 * Password complexity requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&* etc.)
 */
export function evaluatePasswordStrength(password = '') {
  const checks = [
    { id: 'length', label: 'At least 8 characters', passed: password.length >= 8 },
    { id: 'upper', label: 'At least 1 uppercase letter (A-Z)', passed: /[A-Z]/.test(password) },
    { id: 'lower', label: 'At least 1 lowercase letter (a-z)', passed: /[a-z]/.test(password) },
    { id: 'number', label: 'At least 1 digit (0-9)', passed: /\d/.test(password) },
    { id: 'special', label: 'At least 1 special character (@$!%*?&#_-)', passed: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const isValid = passedCount === checks.length;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-red-500';
  if (passedCount >= 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-600';
  } else if (passedCount >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
  }

  return {
    checks,
    passedCount,
    isValid,
    strengthLabel,
    strengthColor,
  };
}

export function validateUserForm(form, isNew = false) {
  const errors = {};
  if (!NAME_REGEX.test((form.firstname || '').trim())) {
    errors.firstname = 'First name must be at least 2 letters (letters only).';
  }
  if (!NAME_REGEX.test((form.lastname || '').trim())) {
    errors.lastname = 'Last name must be at least 2 letters (letters only).';
  }
  if (!EMAIL_REGEX.test((form.email || '').trim())) {
    errors.email = 'Please enter a valid institutional or personal email address.';
  }
  if (!RWANDA_PHONE_REGEX.test((form.telephone || '').trim())) {
    errors.telephone = 'Enter a valid 10-digit Rwanda phone number (e.g. 0788123456).';
  }
  if (isNew && form.password) {
    const pwEval = evaluatePasswordStrength(form.password);
    if (!pwEval.isValid) {
      errors.password = 'Password must meet all security requirements below.';
    }
  }
  return errors;
}

export function validateDepartmentForm(form) {
  const errors = {};
  if (!/^[A-Za-z-]{2,15}$/.test((form.abbreviation || '').trim())) {
    errors.abbreviation = 'Abbreviation must be 2–15 letters (e.g. SCIT, SBM, SL).';
  }
  if ((form.dep_name || '').trim().length < 4) {
    errors.dep_name = 'School / Department name must be at least 4 characters.';
  }
  return errors;
}

export function validateFacultyForm(form) {
  const errors = {};
  if (!form.dep_id) {
    errors.dep_id = 'Please select a parent School / Department.';
  }
  if (!/^[A-Za-z0-9-]{2,20}$/.test((form.abbreviation || '').trim())) {
    errors.abbreviation = 'Program code must be 2–20 alphanumeric characters (e.g. BIT, BBA-FIN).';
  }
  if ((form.fac_name || '').trim().length < 4) {
    errors.fac_name = 'Program title must be at least 4 characters.';
  }
  return errors;
}

export function validateStudentForm(form) {
  const errors = {};
  if (!CODE_REGEX.test((form.reg_number || '').trim())) {
    errors.reg_number = 'Registration Number must be valid (e.g. UoK/2024/IT/001).';
  }
  if (!NAME_REGEX.test((form.firstname || '').trim())) {
    errors.firstname = 'First name must be at least 2 letters.';
  }
  if (!NAME_REGEX.test((form.lastname || '').trim())) {
    errors.lastname = 'Last name must be at least 2 letters.';
  }
  if (!EMAIL_REGEX.test((form.email || '').trim())) {
    errors.email = 'Enter a valid student email address.';
  }
  if (!RWANDA_PHONE_REGEX.test((form.telephone || '').trim())) {
    errors.telephone = 'Enter a valid 10-digit phone number (e.g. 0788123456).';
  }
  if (!form.department) {
    errors.department = 'Please select a School.';
  }
  if (!form.options) {
    errors.options = 'Please select a Program.';
  }
  const yr = Number(form.year);
  if (!yr || yr < 1 || yr > 5) {
    errors.year = 'Year of study must be between 1 and 5.';
  }
  return errors;
}

export function validateRoomForm(form) {
  const errors = {};
  if ((form.room || '').trim().length < 3) {
    errors.room = 'Room name must be at least 3 characters.';
  }
  const cap = Number(form.numberofstudent);
  if (!cap || cap < 1 || cap > 500) {
    errors.numberofstudent = 'Room capacity must be between 1 and 500 students.';
  }
  return errors;
}

export function validateModuleForm(form) {
  const errors = {};
  if (!/^[A-Za-z0-9-]{3,20}$/.test((form.module_code || '').trim())) {
    errors.module_code = 'Module code must be 3–20 alphanumeric characters (e.g. CIT3101).';
  }
  if ((form.module_name || '').trim().length < 3) {
    errors.module_name = 'Module title must be at least 3 characters.';
  }
  if (!form.dep_id) {
    errors.dep_id = 'Select a School / Department.';
  }
  if (!form.fac_id) {
    errors.fac_id = 'Select a Program / Option.';
  }
  return errors;
}
