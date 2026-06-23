/**
 * Validation Functions for HackHub
 * All input validation logic in one place
 */

export function validateName(fullName) {
  const name = fullName.trim();
  if (!name) return { valid: false, error: 'Name is required' };
  if (name.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
  if (name.length > 50) return { valid: false, error: 'Name must be less than 50 characters' };
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  return { valid: true, value: name };
}

export function validateEmail(email) {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed) return { valid: false, error: 'Email is required' };
  if (!emailRegex.test(trimmed)) return { valid: false, error: 'Invalid email format' };
  return { valid: true, value: trimmed };
}

export function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return { valid: false, error: 'Phone number is required' };
  if (cleaned.length !== 10) return { valid: false, error: 'Phone number must be 10 digits' };
  if (!cleaned.startsWith('6') && !cleaned.startsWith('7') && !cleaned.startsWith('8') && !cleaned.startsWith('9')) {
    return { valid: false, error: 'Invalid phone number (must start with 6-9)' };
  }
  return { valid: true, value: cleaned };
}

export function validatePassword(password) {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Password must contain an uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, error: 'Password must contain a lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, error: 'Password must contain a number' };
  if (!/[^a-zA-Z0-9]/.test(password)) return { valid: false, error: 'Password must contain a special character' };
  return { valid: true, value: password };
}

export function validateDOB(day, month, year) {
  if (!day || !month || !year) return { valid: false, error: 'Please select your date of birth' };

  const d = parseInt(day);
  const m = parseInt(month);
  const y = parseInt(year);

  const dob = new Date(y, m - 1, d);
  const today = new Date();
  const age = today.getFullYear() - y;

  if (age < 13) return { valid: false, error: 'You must be at least 13 years old' };
  if (age > 120) return { valid: false, error: 'Invalid date of birth' };

  return {
    valid: true,
    value: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    age: age
  };
}

export function validateOTP(otp) {
  if (!otp) return { valid: false, error: 'OTP is required' };
  if (!/^\d{6}$/.test(otp)) return { valid: false, error: 'OTP must be 6 digits' };
  return { valid: true, value: otp };
}

export function validateLogin(identifier, password) {
  if (!identifier || !password) {
    return { valid: false, error: 'Please enter email/phone and password' };
  }

  // Check if email or phone
  const isEmail = identifier.includes('@');
  const cleanedPhone = identifier.replace(/\D/g, '');

  if (isEmail) {
    const emailCheck = validateEmail(identifier);
    if (!emailCheck.valid) return emailCheck;
    return { valid: true, identifier: emailCheck.value, type: 'email' };
  } else {
    if (cleanedPhone.length !== 10) {
      return { valid: false, error: 'Phone number must be 10 digits' };
    }
    return { valid: true, identifier: cleanedPhone, type: 'phone' };
  }
}

export function getErrorMessage(firebaseErrorCode) {
  const errorMap = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already in use',
    'auth/weak-password': 'Password is too weak',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/invalid-phone-number': 'Invalid phone number',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/account-exists-with-different-credential': 'Account already exists with different sign-in method',
    'auth/auth-domain-config-required': 'Firebase not properly configured',
    'auth/credential-already-in-use': 'Credential already in use',
    'auth/invalid-verification-code': 'Invalid verification code',
    'auth/missing-verification-code': 'Verification code is missing',
    'auth/invalid-verification-id': 'Verification ID is invalid'
  };

  return errorMap[firebaseErrorCode] || 'An error occurred. Please try again.';
}

export function getPasswordStrength(password) {
  let score = 0;
  let feedback = [];

  if (!password) return { score: 0, level: 'Weak', percentage: 20, feedback: ['Enter a password'] };

  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Add special characters');

  const levels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const percentages = [20, 40, 60, 80, 100];

  return {
    score: score,
    level: levels[Math.min(score - 1, 4)] || 'Weak',
    percentage: percentages[Math.min(score - 1, 4)] || 20,
    feedback: feedback
  };
}