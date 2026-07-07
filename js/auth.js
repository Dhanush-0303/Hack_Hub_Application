/**
 * HackHub Authentication System - CONSOLIDATED VERSION
 * Works with Firebase + Email/Phone OTP + Google Sign-in
 */

import { auth, db } from '../firebase-config.js';
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateDOB,
  validateOTP,
  validateLogin,
  getErrorMessage,
  getPasswordStrength
} from '../validation.js';

// ===== STATE MANAGEMENT =====
let confirmationResult = null;
let recaptchaVerifier = null;
let signupData = {
  fullName: '',
  contact: '',
  contactType: '',
  password: '',
  dob: '',
  age: 0
};
let otpAttempts = 0;
const MAX_OTP_ATTEMPTS = 5;
const OTP_EXPIRY = 5 * 60 * 1000;
let otpTimestamp = 0;

// ===== MESSAGE FUNCTIONS =====
function showMsg(id, text, type = 'error') {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`⚠️ Message container not found: ${id}`);
    return;
  }
  el.innerHTML = `<div class="msg msg-${type}">${text}</div>`;
}

function clearMsg(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 14px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== INIT RECAPTCHA VERIFIER =====
function initRecaptchaVerifier() {
  if (!recaptchaVerifier) {
    try {
      const container = document.getElementById('s2Send');
      if (!container) {
        console.error('❌ reCAPTCHA container not found. Make sure <div id="s2Send"></div> exists in HTML');
        return false;
      }

      recaptchaVerifier = new RecaptchaVerifier(auth, 's2Send', {
        'size': 'invisible',
        'callback': (token) => {
          console.log('✅ reCAPTCHA verified');
        },
        'expired-callback': () => {
          console.warn('⚠️ reCAPTCHA expired');
          recaptchaVerifier = null;
        }
      });
      console.log('✅ RecaptchaVerifier initialized');
      return true;
    } catch (error) {
      console.error('❌ RecaptchaVerifier error:', error);
      showToast('reCAPTCHA initialization failed. Refresh the page.', 'error');
      return false;
    }
  }
  return true;
}

// ===== LOGIN WITH EMAIL/PHONE & PASSWORD =====
window.doLogin = async function() {
  try {
    const identifier = document.getElementById('loginInput')?.value || '';
    const password = document.getElementById('loginPass')?.value || '';

    if (!identifier || !password) {
      showMsg('loginMsg', 'Please enter email/phone and password', 'error');
      return;
    }

    showMsg('loginMsg', 'Signing in...', 'success');
    
    let userEmail = identifier;
    const isPhone = /^\d{10}$/.test(identifier.replace(/\D/g, ''));
    
    if (isPhone) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', identifier));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          showMsg('loginMsg', 'No account found with this phone number.', 'error');
          return;
        }

        userEmail = querySnapshot.docs[0].data().email;
      } catch (error) {
        console.error('❌ Firestore query error:', error);
        showMsg('loginMsg', 'Database error. Check console.', 'error');
        return;
      }
    }

    const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
    const user = userCredential.user;

    sessionStorage.setItem('hackhub_user_id', user.uid);
    sessionStorage.setItem('hackhub_user_email', user.email);
    
    showToast(`Welcome back!`, 'success');
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1500);

  } catch (error) {
    console.error('❌ Login error:', error);
    const errorMsg = getErrorMessage(error.code);
    showMsg('loginMsg', errorMsg, 'error');
  }
};

// ===== GOOGLE SIGN-IN =====
window.loginWithGoogle = async function() {
  try {
    console.log('🔵 Google Sign-in initiated');
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ 'prompt': 'consent' });
    
    showToast('Opening Google sign-in...', 'info');
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log('✅ Google sign-in successful:', user.email);

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          fullName: user.displayName || 'User',
          email: user.email,
          phone: user.phoneNumber || null,
          profilePhoto: user.photoURL || null,
          provider: 'google',
          dateOfBirth: null,
          city: null,
          state: null,
          bio: null,
          skills: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          registeredHackathons: [],
          savedHackathons: [],
          accountStatus: 'active'
        });
        showToast('Account created successfully!', 'success');
      } else {
        showToast('Welcome back!', 'success');
      }
    } catch (firestoreError) {
      console.error('⚠️ Firestore error (non-critical):', firestoreError);
    }

    sessionStorage.setItem('hackhub_user_id', user.uid);
    sessionStorage.setItem('hackhub_user_email', user.email);

    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1500);

  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('ℹ️ User closed the popup');
    } else {
      showToast('Google sign-in failed. Check console for details.', 'error');
    }
  }
};

// ===== SIGNUP STEP 1: FULL NAME =====
window.s1Next = function() {
  const fullName = document.getElementById('s1Name')?.value || '';
  const nameVal = validateName(fullName);
  
  if (!nameVal.valid) {
    showMsg('s1Msg', nameVal.error);
    return;
  }

  clearMsg('s1Msg');
  signupData.fullName = nameVal.value;
  navigate('s2');
};

// ===== SIGNUP STEP 2: EMAIL OR PHONE =====
window.s2Next = async function() {
  const contact = document.getElementById('s2Contact')?.value || '';
  const isEmail = contact.includes('@');
  
  const contactVal = isEmail ? validateEmail(contact) : validatePhone(contact);
  if (!contactVal.valid) {
    showMsg('s2Msg', contactVal.error);
    return;
  }

  clearMsg('s2Msg');
  signupData.contact = contactVal.value;
  signupData.contactType = isEmail ? 'email' : 'phone';

  const displayLabel = isEmail ? contactVal.value : `+91 ${contactVal.value}`;
  document.getElementById('s3Dest').innerHTML = `<strong>${displayLabel}</strong>`;

  await sendOTP(contactVal.value, isEmail);
};

// ===== SEND OTP (Email or Phone) =====
async function sendOTP(contact, isEmail) {
  try {
    if (isEmail) {
      const otp = generateOTP();
      console.log(`📧 [DEMO] Email OTP: ${otp}`);
      
      sessionStorage.setItem('temp_otp', otp);
      sessionStorage.setItem('temp_otp_time', Date.now().toString());
      
      showToast(`OTP: ${otp} (Check console)`, 'success');
      otpTimestamp = Date.now();
      otpAttempts = 0;
      navigate('s3');

    } else {
      // Phone OTP
      if (!initRecaptchaVerifier()) {
        showMsg('s2Msg', 'reCAPTCHA initialization failed. Refresh the page.');
        return;
      }

      const phoneNumber = '+91' + contact;
      showMsg('s2Msg', 'Sending OTP...', 'success');

      try {
        confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        otpTimestamp = Date.now();
        otpAttempts = 0;
        showToast('OTP sent to your phone!', 'success');
        clearMsg('s2Msg');
        navigate('s3');
      } catch (error) {
        console.error('❌ Phone OTP error:', error);
        if (error.code === 'auth/too-many-requests') {
          showMsg('s2Msg', 'Too many requests. Try again in a few minutes.');
        } else if (error.code === 'auth/invalid-phone-number') {
          showMsg('s2Msg', 'Invalid phone number.');
        } else {
          showMsg('s2Msg', 'Failed to send OTP: ' + error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    showMsg('s2Msg', 'Failed to send OTP.');
  }
}

// ===== GENERATE OTP =====
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ===== RESEND OTP =====
window.resendOTP = async function() {
  const now = Date.now();
  if (now - otpTimestamp > OTP_EXPIRY) {
    showToast('OTP expired. Generating new one...', 'info');
    await sendOTP(signupData.contact, signupData.contactType === 'email');
  } else {
    showToast('Resend available after 60 seconds', 'info');
  }
};

// ===== SIGNUP STEP 3: OTP VERIFICATION =====
window.s3Next = async function() {
  const otp = document.getElementById('otpRow')
    ? [...document.querySelectorAll('.otp-cell')].map(c => c.value).join('')
    : '';

  const otpVal = validateOTP(otp);
  if (!otpVal.valid) {
    showMsg('s3Msg', otpVal.error);
    return;
  }

  if (Date.now() - otpTimestamp > OTP_EXPIRY) {
    showMsg('s3Msg', 'OTP expired. Request a new one.');
    return;
  }

  if (otpAttempts >= MAX_OTP_ATTEMPTS) {
    showMsg('s3Msg', 'Too many attempts. Request new OTP.');
    return;
  }

  try {
    showMsg('s3Msg', 'Verifying OTP...', 'success');

    if (signupData.contactType === 'phone' && confirmationResult) {
      const userCredential = await confirmationResult.confirm(otpVal.value);
      clearMsg('s3Msg');
      navigate('s4');
    } else {
      // Email OTP verification
      const storedOTP = sessionStorage.getItem('temp_otp');
      
      if (storedOTP === otpVal.value) {
        sessionStorage.removeItem('temp_otp');
        sessionStorage.removeItem('temp_otp_time');
        clearMsg('s3Msg');
        navigate('s4');
      } else {
        otpAttempts++;
        showMsg('s3Msg', `Invalid OTP. ${MAX_OTP_ATTEMPTS - otpAttempts} attempts left.`, 'error');
      }
    }
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    otpAttempts++;
    showMsg('s3Msg', 'OTP verification failed. Try again.');
  }
};

// ===== SIGNUP STEP 4: PASSWORD =====
window.s4Next = function() {
  const password = document.getElementById('s4Pass')?.value || '';
  const confirmPass = document.getElementById('s4Confirm')?.value || '';

  const pwVal = validatePassword(password);
  if (!pwVal.valid) {
    showMsg('s4Msg', pwVal.error);
    return;
  }

  if (password !== confirmPass) {
    showMsg('s4Msg', 'Passwords do not match.');
    return;
  }

  clearMsg('s4Msg');
  signupData.password = password;
  navigate('s5');
};

// ===== PASSWORD STRENGTH CHECKER =====
window.checkPwStrength = function() {
  const pw = document.getElementById('s4Pass')?.value || '';
  const pwBar = document.getElementById('pwBar');
  const pwHint = document.getElementById('pwHint');

  const strength = getPasswordStrength(pw);

  if (pwBar) {
    pwBar.style.width = strength.percentage + '%';
    pwBar.className = 'pw-bar';
    if (strength.score >= 2) pwBar.classList.add('medium');
    if (strength.score >= 4) pwBar.classList.add('strong');
  }

  if (pwHint) {
    pwHint.textContent = pw ? strength.level : 'Enter a password';
  }
};

// ===== SIGNUP STEP 5: DATE OF BIRTH =====
window.s5Next = function() {
  const day = document.getElementById('dobDay')?.value;
  const month = document.getElementById('dobMonth')?.value;
  const year = document.getElementById('dobYear')?.value;

  const dobVal = validateDOB(day, month, year);
  if (!dobVal.valid) {
    showMsg('s5Msg', dobVal.error);
    return;
  }

  clearMsg('s5Msg');
  signupData.dob = dobVal.value;
  signupData.age = dobVal.age;

  const firstName = signupData.fullName.split(' ')[0];
  document.getElementById('successTitle').textContent = `Welcome, ${firstName}!`;

  navigate('s6');
};

// ===== COMPLETE SIGNUP =====
window.completeSignup = async function() {
  try {
    showToast('Creating your account...', 'info');

    const userEmail = signupData.contactType === 'email' 
      ? signupData.contact 
      : `user_${Date.now()}@hackhub.local`;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userEmail,
      signupData.password
    );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: signupData.fullName
    });

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      fullName: signupData.fullName,
      email: signupData.contactType === 'email' ? signupData.contact : null,
      phone: signupData.contactType === 'phone' ? signupData.contact : null,
      dateOfBirth: signupData.dob,
      age: signupData.age,
      provider: 'email',
      profilePhoto: null,
      bio: null,
      city: null,
      state: null,
      skills: [],
      experience: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      registeredHackathons: [],
      savedHackathons: [],
      accountStatus: 'active'
    });

    sessionStorage.setItem('hackhub_user_id', user.uid);
    sessionStorage.setItem('hackhub_user_email', user.email);

    showToast('Account created successfully!', 'success');
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1500);

  } catch (error) {
    console.error('❌ Signup error:', error);
    const errorMsg = getErrorMessage(error.code);
    showToast(errorMsg, 'error');
  }
};

// ===== FORGOT PASSWORD =====
window.doReset = async function() {
  const email = document.getElementById('forgotEmail')?.value || '';
  const emailVal = validateEmail(email);

  if (!emailVal.valid) {
    showMsg('forgotMsg', emailVal.error);
    return;
  }

  try {
    showMsg('forgotMsg', 'Sending reset link...', 'success');
    await sendPasswordResetEmail(auth, emailVal.value);
    showToast('Reset link sent! Check your email.', 'success');
    setTimeout(() => {
      navigate('login', true);
    }, 2000);
  } catch (error) {
    console.error('❌ Password reset error:', error);
    if (error.code === 'auth/user-not-found') {
      showMsg('forgotMsg', 'No account found with this email.');
    } else {
      showMsg('forgotMsg', 'Failed to send reset link.');
    }
  }
};

// ===== LOGOUT =====
window.doLogout = async function() {
  try {
    await signOut(auth);
    sessionStorage.removeItem('hackhub_user_id');
    sessionStorage.removeItem('hackhub_user_email');
    window.location.href = 'login.html';
  } catch (error) {
    console.error('❌ Logout error:', error);
  }
};

// ===== SESSION MANAGEMENT =====
window.initializeSession = function() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      sessionStorage.setItem('hackhub_user_id', user.uid);
      sessionStorage.setItem('hackhub_user_email', user.email);
    } else {
      sessionStorage.removeItem('hackhub_user_id');
      sessionStorage.removeItem('hackhub_user_email');
    }
  });
};

// ===== UTILITY FUNCTIONS =====
window.isUserLoggedIn = function() {
  return sessionStorage.getItem('hackhub_user_id') !== null;
};

window.getCurrentUser = function() {
  return {
    uid: sessionStorage.getItem('hackhub_user_id'),
    email: sessionStorage.getItem('hackhub_user_email')
  };
};

// ===== INITIALIZE ON PAGE LOAD =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeSession();
    console.log('✅ Auth system initialized');
  });
} else {
  initializeSession();
  console.log('✅ Auth system initialized');
}
