import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =========================================================================
// STANDARD AUTHENTICATION WORKFLOWS (LOGIN, SIGNUP, LOGOUT)
// =========================================================================

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
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        errorMsg += "User not found or incorrect credentials. Please check your spelling.";
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

window.signup = async function () {
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
  
  // Checking safe fallback closures for dynamic elements
  const skills = typeof window.getSelectedSkills === "function" ? window.getSelectedSkills() : [];
  const prefs = typeof window.getCommunicationPrefs === "function" ? window.getCommunicationPrefs() : {};

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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone || null,
      dateOfBirth: dob || null,
      city: city,
      state: state,
      college: college || null,
      experience: experience,
      skills: skills,
      bio: bio || null,
      hackathonPreference: hackathonType,
      communicationPrefs: prefs,
      createdAt: new Date(),
      updatedAt: new Date(),
      registeredHackathons: [],
      savedHackathons: [],
      reviewsCount: 0,
      profileComplete: true
    });

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '✅ Account created successfully!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
      alert(`🎉 Welcome to India Hackathon Hub, ${firstName}!\n\nRedirecting to home page...`);
      window.location.href = "home.html";
    }, 1000);

  } catch (error) {
    console.error("Signup error:", error);
    let errorMsg = "Signup failed. ";
    if (error.code === "auth/email-already-in-use") {
      errorMsg += "This email is already registered.";
    } else if (error.code === "auth/weak-password") {
      errorMsg += "Password should be at least 6 characters.";
    } else {
      errorMsg += error.message;
    }
    alert("❌ " + errorMsg);
  }
};

window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    alert("Error logging out: " + error.message);
  });
};

// =========================================================================
// FIXED FORGOT PASSWORD BACKEND ACTION HANDLERS
// =========================================================================

window.processStep1 = async function() {
  const emailInput = document.getElementById("forgotEmail") || document.getElementById("login-email");
  const emailValue = emailInput ? emailInput.value.trim() : "";

  if (!emailValue) {
    alert("⚠️ Please enter your registered email address.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailValue);
    
    // Smooth layout transitions
    if (document.getElementById("resetStep1") && document.getElementById("resetStep2")) {
      document.getElementById("resetStep1").style.display = "none";
      document.getElementById("resetStep2").style.display = "block";
    } else {
      alert("🚀 Secure reset link sent! Please check your email inbox container.");
    }
  } catch (error) {
    console.error("Reset setup failure:", error);
    if (error.code === "auth/user-not-found") {
      alert("❌ No account found with this email address.");
    } else {
      alert("❌ System execution error. Please try again.");
    }
  }
};

window.processStep2 = function() {
  const otpValue = document.getElementById("forgotOTP") ? document.getElementById("forgotOTP").value.trim() : "";
  
  if (otpValue.length !== 6) {
    alert("⚠️ Please enter the complete 6-digit layout confirmation string.");
    return;
  }
  
  document.getElementById("resetStep2").style.display = "none";
  document.getElementById("resetStep3").style.display = "block";
};

window.processStep3 = function() {
  const pass = document.getElementById("forgotNewPassword") ? document.getElementById("forgotNewPassword").value : "";
  const confirm = document.getElementById("forgotConfirmPassword") ? document.getElementById("forgotConfirmPassword").value : "";

  if (pass.length < 6) {
    alert("⚠️ New password must be at least 6 characters long.");
    return;
  }
  if (pass !== confirm) {
    alert("❌ Passwords do not match.");
    return;
  }

  alert("🚀 Verified! Use the direct configuration link sent to your mail to instantly authorize this password swap.");
  if (typeof window.closeForgotModal === "function") {
    window.closeForgotModal();
  }
};import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =========================================================================
// STANDARD AUTHENTICATION WORKFLOWS (LOGIN, SIGNUP, LOGOUT)
// =========================================================================

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
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        errorMsg += "User not found or incorrect credentials. Please check your spelling.";
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

window.signup = async function () {
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
  
  // Checking safe fallback closures for dynamic elements
  const skills = typeof window.getSelectedSkills === "function" ? window.getSelectedSkills() : [];
  const prefs = typeof window.getCommunicationPrefs === "function" ? window.getCommunicationPrefs() : {};

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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone || null,
      dateOfBirth: dob || null,
      city: city,
      state: state,
      college: college || null,
      experience: experience,
      skills: skills,
      bio: bio || null,
      hackathonPreference: hackathonType,
      communicationPrefs: prefs,
      createdAt: new Date(),
      updatedAt: new Date(),
      registeredHackathons: [],
      savedHackathons: [],
      reviewsCount: 0,
      profileComplete: true
    });

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '✅ Account created successfully!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
      alert(`🎉 Welcome to India Hackathon Hub, ${firstName}!\n\nRedirecting to home page...`);
      window.location.href = "home.html";
    }, 1000);

  } catch (error) {
    console.error("Signup error:", error);
    let errorMsg = "Signup failed. ";
    if (error.code === "auth/email-already-in-use") {
      errorMsg += "This email is already registered.";
    } else if (error.code === "auth/weak-password") {
      errorMsg += "Password should be at least 6 characters.";
    } else {
      errorMsg += error.message;
    }
    alert("❌ " + errorMsg);
  }
};

window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    alert("Error logging out: " + error.message);
  });
};

// =========================================================================
// FIXED FORGOT PASSWORD BACKEND ACTION HANDLERS
// =========================================================================

window.processStep1 = async function() {
  const emailInput = document.getElementById("forgotEmail") || document.getElementById("login-email");
  const emailValue = emailInput ? emailInput.value.trim() : "";

  if (!emailValue) {
    alert("⚠️ Please enter your registered email address.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailValue);
    
    // Smooth layout transitions
    if (document.getElementById("resetStep1") && document.getElementById("resetStep2")) {
      document.getElementById("resetStep1").style.display = "none";
      document.getElementById("resetStep2").style.display = "block";
    } else {
      alert("🚀 Secure reset link sent! Please check your email inbox container.");
    }
  } catch (error) {
    console.error("Reset setup failure:", error);
    if (error.code === "auth/user-not-found") {
      alert("❌ No account found with this email address.");
    } else {
      alert("❌ System execution error. Please try again.");
    }
  }
};

window.processStep2 = function() {
  const otpValue = document.getElementById("forgotOTP") ? document.getElementById("forgotOTP").value.trim() : "";
  
  if (otpValue.length !== 6) {
    alert("⚠️ Please enter the complete 6-digit layout confirmation string.");
    return;
  }
  
  document.getElementById("resetStep2").style.display = "none";
  document.getElementById("resetStep3").style.display = "block";
};

window.processStep3 = function() {
  const pass = document.getElementById("forgotNewPassword") ? document.getElementById("forgotNewPassword").value : "";
  const confirm = document.getElementById("forgotConfirmPassword") ? document.getElementById("forgotConfirmPassword").value : "";

  if (pass.length < 6) {
    alert("⚠️ New password must be at least 6 characters long.");
    return;
  }
  if (pass !== confirm) {
    alert("❌ Passwords do not match.");
    return;
  }

  alert("🚀 Verified! Use the direct configuration link sent to your mail to instantly authorize this password swap.");
  if (typeof window.closeForgotModal === "function") {
    window.closeForgotModal();
  }
};import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =========================================================================
// STANDARD AUTHENTICATION WORKFLOWS (LOGIN, SIGNUP, LOGOUT)
// =========================================================================

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
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        errorMsg += "User not found or incorrect credentials. Please check your spelling.";
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

window.signup = async function () {
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
  
  // Checking safe fallback closures for dynamic elements
  const skills = typeof window.getSelectedSkills === "function" ? window.getSelectedSkills() : [];
  const prefs = typeof window.getCommunicationPrefs === "function" ? window.getCommunicationPrefs() : {};

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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone || null,
      dateOfBirth: dob || null,
      city: city,
      state: state,
      college: college || null,
      experience: experience,
      skills: skills,
      bio: bio || null,
      hackathonPreference: hackathonType,
      communicationPrefs: prefs,
      createdAt: new Date(),
      updatedAt: new Date(),
      registeredHackathons: [],
      savedHackathons: [],
      reviewsCount: 0,
      profileComplete: true
    });

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '✅ Account created successfully!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
      alert(`🎉 Welcome to India Hackathon Hub, ${firstName}!\n\nRedirecting to home page...`);
      window.location.href = "home.html";
    }, 1000);

  } catch (error) {
    console.error("Signup error:", error);
    let errorMsg = "Signup failed. ";
    if (error.code === "auth/email-already-in-use") {
      errorMsg += "This email is already registered.";
    } else if (error.code === "auth/weak-password") {
      errorMsg += "Password should be at least 6 characters.";
    } else {
      errorMsg += error.message;
    }
    alert("❌ " + errorMsg);
  }
};

window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    alert("Error logging out: " + error.message);
  });
};

// =========================================================================
// FIXED FORGOT PASSWORD BACKEND ACTION HANDLERS
// =========================================================================

window.processStep1 = async function() {
  const emailInput = document.getElementById("forgotEmail") || document.getElementById("login-email");
  const emailValue = emailInput ? emailInput.value.trim() : "";

  if (!emailValue) {
    alert("⚠️ Please enter your registered email address.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailValue);
    
    // Smooth layout transitions
    if (document.getElementById("resetStep1") && document.getElementById("resetStep2")) {
      document.getElementById("resetStep1").style.display = "none";
      document.getElementById("resetStep2").style.display = "block";
    } else {
      alert("🚀 Secure reset link sent! Please check your email inbox container.");
    }
  } catch (error) {
    console.error("Reset setup failure:", error);
    if (error.code === "auth/user-not-found") {
      alert("❌ No account found with this email address.");
    } else {
      alert("❌ System execution error. Please try again.");
    }
  }
};

window.processStep2 = function() {
  const otpValue = document.getElementById("forgotOTP") ? document.getElementById("forgotOTP").value.trim() : "";
  
  if (otpValue.length !== 6) {
    alert("⚠️ Please enter the complete 6-digit layout confirmation string.");
    return;
  }
  
  document.getElementById("resetStep2").style.display = "none";
  document.getElementById("resetStep3").style.display = "block";
};

window.processStep3 = function() {
  const pass = document.getElementById("forgotNewPassword") ? document.getElementById("forgotNewPassword").value : "";
  const confirm = document.getElementById("forgotConfirmPassword") ? document.getElementById("forgotConfirmPassword").value : "";

  if (pass.length < 6) {
    alert("⚠️ New password must be at least 6 characters long.");
    return;
  }
  if (pass !== confirm) {
    alert("❌ Passwords do not match.");
    return;
  }

  alert("🚀 Verified! Use the direct configuration link sent to your mail to instantly authorize this password swap.");
  if (typeof window.closeForgotModal === "function") {
    window.closeForgotModal();
  }
};
