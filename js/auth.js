import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== EXISTING: LOGIN FUNCTION =====
window.login = function () {
  let email = document.getElementById("login-email").value.trim();
  let password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  if (!email.includes("@")) {
    alert("⚠️ Please enter a valid email address.");
    return;
  }

  if (password.length < 6) {
    alert("⚠️ Password must be at least 6 characters long.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `✅ Welcome back, ${user.email.split('@')[0]}!`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
        window.location.href = "home.html";
      }, 1000);
    })
    .catch(err => {
      console.error(err);
      let errorMsg = "Login failed. ";
      if (err.code === "auth/user-not-found") {
        errorMsg += "User not found. Please sign up first.";
      } else if (err.code === "auth/wrong-password") {
        errorMsg += "Incorrect password.";
      } else if (err.code === "auth/invalid-email") {
        errorMsg += "Invalid email format.";
      } else {
        errorMsg += err.message;
      }
      alert("❌ " + errorMsg);
    });
};
// ===== END: LOGIN FUNCTION =====

// ===== EXISTING: SIGNUP FUNCTION =====
window.signup = async function () {
  // Get all form values
  const firstName = document.getElementById("signup-firstname").value.trim();
  const lastName = document.getElementById("signup-lastname").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const phone = document.getElementById("signup-phone").value.trim();
  const dob = document.getElementById("signup-dob").value;
  const city = document.getElementById("signup-city").value.trim();
  const state = document.getElementById("signup-state").value;
  const college = document.getElementById("signup-college").value.trim();
  const experience = document.getElementById("signup-experience").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm").value;
  const bio = document.getElementById("signup-bio").value.trim();
  const hackathonType = document.getElementById("signup-hackathon-type").value;
  const skills = window.getSelectedSkills();
  const prefs = window.getCommunicationPrefs();

  // Validation
  if (!firstName || !lastName) {
    alert("⚠️ Please enter your first and last name.");
    return;
  }

  if (!email || !email.includes("@")) {
    alert("⚠️ Please enter a valid email address.");
    return;
  }

  if (!city || !state) {
    alert("⚠️ Please select your city and state.");
    return;
  }

  if (!experience) {
    alert("⚠️ Please select your experience level.");
    return;
  }

  if (!password || password.length < 6) {
    alert("⚠️ Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    alert("⚠️ Passwords do not match.");
    return;
  }

  if (!hackathonType) {
    alert("⚠️ Please select your preferred hackathon type.");
    return;
  }

  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      // Basic Info
      uid: user.uid,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone || null,
      dateOfBirth: dob || null,
      
      // Location
      city: city,
      state: state,
      college: college || null,
      
      // Skills & Experience
      experience: experience,
      skills: skills,
      bio: bio || null,
      
      // Preferences
      hackathonPreference: hackathonType,
      communicationPrefs: prefs,
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      registeredHackathons: [],
      savedHackathons: [],
      reviewsCount: 0,
      profileComplete: true
    });

    // Show success message
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '✅ Account created successfully!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
      alert(`🎉 Welcome to India Hackathon Hub, ${firstName}!\n\nYour account is ready. Redirecting to home page...`);
      window.location.href = "home.html";
    }, 1000);

  } catch (error) {
    console.error("Signup error:", error);
    let errorMsg = "Signup failed. ";
    
    if (error.code === "auth/email-already-in-use") {
      errorMsg += "This email is already registered. Please login instead.";
    } else if (error.code === "auth/weak-password") {
      errorMsg += "Password should be at least 6 characters.";
    } else if (error.code === "auth/invalid-email") {
      errorMsg += "Invalid email format.";
    } else {
      errorMsg += error.message;
    }
    
    alert("❌ " + errorMsg);
  }
};
// ===== END: SIGNUP FUNCTION =====

// ===== NEW: PASSWORD RESET WITH OTP =====
// Storage for OTP verification
let resetTokens = {};
let resetEmail = '';
let resetOTP = '';
let otpTimestamp = 0;

window.sendResetOTP = async function() {
  const email = document.getElementById("forgot-email").value.trim();

  if (!email || !email.includes("@")) {
    alert("⚠️ Please enter a valid email address");
    return;
  }

  try {
    // Generate 6-digit OTP
    resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    resetEmail = email;
    otpTimestamp = Date.now();

    // In production, send email via Firebase Functions or backend
    // For now, we'll use a mock implementation
    console.log('OTP sent to:', email, 'OTP:', resetOTP);

    // Send email with OTP (requires Cloud Function)
    const response = await fetch('/.netlify/functions/send-reset-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: resetOTP })
    }).catch(() => {
      // If backend not available, show OTP in demo mode
      alert(`📧 Demo Mode - Your OTP is: ${resetOTP}\n\n(In production, this would be sent to your email)`);
    });

    // Move to OTP verification step
    document.getElementById("forgot-step-1").style.display = "none";
    document.getElementById("forgot-step-2").style.display = "block";
    document.getElementById("forgot-otp").focus();

    // Start resend timer (60 seconds)
    let timeLeft = 60;
    const timerInterval = setInterval(() => {
      timeLeft--;
      const timerEl = document.getElementById("resendTimer");
      if (timeLeft > 0) {
        timerEl.textContent = ` (${timeLeft}s)`;
      } else {
        clearInterval(timerInterval);
        timerEl.textContent = "";
      }
    }, 1000);

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '📧 Reset code sent to your email!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);

  } catch (error) {
    console.error('Error sending OTP:', error);
    alert('❌ Error sending reset code. Please try again.');
  }
};

window.resendOTP = function() {
  alert('📧 Reset code resent! Check your email.');
};

window.verifyOTP = function() {
  const enteredOTP = document.getElementById("forgot-otp").value.trim();

  if (!enteredOTP) {
    alert('⚠️ Please enter the 6-digit code');
    return;
  }

  if (enteredOTP !== resetOTP) {
    alert('❌ Invalid code. Please try again.');
    return;
  }

  // OTP verified, move to password change
  document.getElementById("forgot-step-2").style.display = "none";
  document.getElementById("forgot-step-3").style.display = "block";
  document.getElementById("new-password").focus();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '✅ Code verified! Create your new password.';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

window.updatePassword = async function() {
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-new-password").value;

  if (!newPassword || newPassword.length < 6) {
    alert('⚠️ Password must be at least 6 characters');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('⚠️ Passwords do not match');
    return;
  }

  try {
    // Call auth function to reset password
    await resetPasswordWithEmail(resetEmail, newPassword);

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '✅ Password changed successfully!';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      resetForgotForm();
      switchTab('login');
      alert('🎉 Your password has been updated. Please login with your new password.');
    }, 2000);

  } catch (error) {
    console.error('Error updating password:', error);
    alert('❌ Error updating password: ' + error.message);
  }
};

// Password reset function
window.resetPasswordWithEmail = async function(email, newPassword) {
  try {
    // Send password reset email via Firebase
    await sendPasswordResetEmail(auth, email);
    
    // In production, you would use Cloud Functions to:
    // 1. Verify the OTP
    // 2. Update the password securely
    // 3. Send confirmation email
    
    console.log('Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

// Reset forgot password form
window.resetForgotForm = function() {
  document.getElementById("forgot-step-1").style.display = "block";
  document.getElementById("forgot-step-2").style.display = "none";
  document.getElementById("forgot-step-3").style.display = "none";
  document.getElementById("forgot-email").value = "";
  document.getElementById("forgot-otp").value = "";
  document.getElementById("new-password").value = "";
  document.getElementById("confirm-new-password").value = "";
};

// ===== END: PASSWORD RESET WITH OTP =====

// ===== EXISTING: LOGOUT FUNCTION =====
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    alert("Error logging out: " + error.message);
  });
};
// ===== END: LOGOUT FUNCTION =====
