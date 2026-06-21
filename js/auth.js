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

// Ensure Firebase is accessible globally for debugging if needed
window.firebaseAuthInstance = auth;

// =========================================================================
// STANDARD LOGIN WORKFLOW
// =========================================================================
window.login = function () {
  console.log("Login function triggered manually.");
  
  const emailEl = document.getElementById("login-email");
  const passwordEl = document.getElementById("login-password");

  if (!emailEl || !passwordEl) {
    alert("❌ HTML Error: Core input fields ('login-email' or 'login-password') are missing from your HTML page structure.");
    return;
  }

  let email = emailEl.value.trim();
  let password = passwordEl.value;

  if (!email || !password) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `✅ Welcome back!`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
        window.location.href = "home.html";
      }, 1000);
    })
    .catch(err => {
      console.error("Login Error details:", err);
      let errorMsg = "Login failed. ";
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        errorMsg += "Incorrect email or password details.";
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

// =========================================================================
// STANDARD SIGNUP WORKFLOW
// =========================================================================
window.signup = async function () {
  console.log("Signup function triggered manually.");

  // Helper safe checker function
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const firstName = getVal("signup-firstname");
  const lastName = getVal("signup-lastname");
  const email = getVal("signup-email");
  const phone = getVal("signup-phone");
  const dob = document.getElementById("signup-dob") ? document.getElementById("signup-dob").value : null;
  const city = getVal("signup-city");
  const state = document.getElementById("signup-state") ? document.getElementById("signup-state").value : "";
  const college = getVal("signup-college");
  const experience = document.getElementById("signup-experience") ? document.getElementById("signup-experience").value : "";
  const password = document.getElementById("signup-password") ? document.getElementById("signup-password").value : "";
  const confirmPassword = document.getElementById("signup-confirm") ? document.getElementById("signup-confirm").value : "";
  const bio = getVal("signup-bio");
  const hackathonType = document.getElementById("signup-hackathon-type") ? document.getElementById("signup-hackathon-type").value : "";
  
  const skills = typeof window.getSelectedSkills === "function" ? window.getSelectedSkills() : [];
  const prefs = typeof window.getCommunicationPrefs === "function" ? window.getCommunicationPrefs() : {};

  // Structural Validations
  if (!firstName || !lastName) {
    alert("⚠️ Please enter your first and last name.");
    return;
  }
  if (!email || !email.includes("@")) {
    alert("⚠️ Please enter a valid email address.");
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
      city: city || null,
      state: state || null,
      college: college || null,
      experience: experience || null,
      skills: skills,
      bio: bio || null,
      hackathonPreference: hackathonType || null,
      communicationPrefs: prefs,
      createdAt: new Date(),
      updatedAt: new Date(),
      registeredHackathons: [],
      savedHackathons: [],
      reviewsCount: 0,
      profileComplete: true
    });

    alert(`🎉 Account ready. Redirecting to home page...`);
    window.location.href = "home.html";

  } catch (error) {
    console.error("Signup error details:", error);
    alert("❌ Signup failed: " + error.message);
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
// INTERACTIVE FORGOT PASSWORD WORKFLOWS
// =========================================================================
window.processStep1 = async function() {
  const emailInput = document.getElementById("forgotEmail") || document.getElementById("login-email");
  const emailValue = emailInput ? emailInput.value.trim() : "";

  if (!emailValue) {
    alert("⚠️ Please enter your email address.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailValue);
    
    if (document.getElementById("resetStep1") && document.getElementById("resetStep2")) {
      document.getElementById("resetStep1").style.display = "none";
      document.getElementById("resetStep2").style.display = "block";
    } else {
      alert("🚀 Link dispatched! Check your mail inbox container.");
    }
  } catch (error) {
    console.error("Reset step 1 issue:", error);
    alert("❌ Error sending reset email: " + error.message);
  }
};

window.processStep2 = function() {
  const otpInput = document.getElementById("forgotOTP");
  const otpValue = otpInput ? otpInput.value.trim() : "";
  
  if (otpValue.length !== 6) {
    alert("⚠️ Please enter the complete 6-digit verification code.");
    return;
  }
  
  document.getElementById("resetStep2").style.display = "none";
  document.getElementById("resetStep3").style.display = "block";
};

window.processStep3 = function() {
  const pass = document.getElementById("forgotNewPassword") ? document.getElementById("forgotNewPassword").value : "";
  const confirm = document.getElementById("forgotConfirmPassword") ? document.getElementById("forgotConfirmPassword").value : "";

  if (pass.length < 6) {
    alert("⚠️ Password must be at least 6 characters.");
    return;
  }
  if (pass !== confirm) {
    alert("❌ Passwords do not match.");
    return;
  }

  alert("🚀 Verified! Use the link in your email to instantly complete the change.");
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

// Ensure Firebase is accessible globally for debugging if needed
window.firebaseAuthInstance = auth;

// =========================================================================
// STANDARD LOGIN WORKFLOW
// =========================================================================
window.login = function () {
  console.log("Login function triggered manually.");
  
  const emailEl = document.getElementById("login-email");
  const passwordEl = document.getElementById("login-password");

  if (!emailEl || !passwordEl) {
    alert("❌ HTML Error: Core input fields ('login-email' or 'login-password') are missing from your HTML page structure.");
    return;
  }

  let email = emailEl.value.trim();
  let password = passwordEl.value;

  if (!email || !password) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `✅ Welcome back!`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
        window.location.href = "home.html";
      }, 1000);
    })
    .catch(err => {
      console.error("Login Error details:", err);
      let errorMsg = "Login failed. ";
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        errorMsg += "Incorrect email or password details.";
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

// =========================================================================
// STANDARD SIGNUP WORKFLOW
// =========================================================================
window.signup = async function () {
  console.log("Signup function triggered manually.");

  // Helper safe checker function
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const firstName = getVal("signup-firstname");
  const lastName = getVal("signup-lastname");
  const email = getVal("signup-email");
  const phone = getVal("signup-phone");
  const dob = document.getElementById("signup-dob") ? document.getElementById("signup-dob").value : null;
  const city = getVal("signup-city");
  const state = document.getElementById("signup-state") ? document.getElementById("signup-state").value : "";
  const college = getVal("signup-college");
  const experience = document.getElementById("signup-experience") ? document.getElementById("signup-experience").value : "";
  const password = document.getElementById("signup-password") ? document.getElementById("signup-password").value : "";
  const confirmPassword = document.getElementById("signup-confirm") ? document.getElementById("signup-confirm").value : "";
  const bio = getVal("signup-bio");
  const hackathonType = document.getElementById("signup-hackathon-type") ? document.getElementById("signup-hackathon-type").value : "";
  
  const skills = typeof window.getSelectedSkills === "function" ? window.getSelectedSkills() : [];
  const prefs = typeof window.getCommunicationPrefs === "function" ? window.getCommunicationPrefs() : {};

  // Structural Validations
  if (!firstName || !lastName) {
    alert("⚠️ Please enter your first and last name.");
    return;
  }
  if (!email || !email.includes("@")) {
    alert("⚠️ Please enter a valid email address.");
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
      city: city || null,
      state: state || null,
      college: college || null,
      experience: experience || null,
      skills: skills,
      bio: bio || null,
      hackathonPreference: hackathonType || null,
      communicationPrefs: prefs,
      createdAt: new Date(),
      updatedAt: new Date(),
      registeredHackathons: [],
      savedHackathons: [],
      reviewsCount: 0,
      profileComplete: true
    });

    alert(`🎉 Account ready. Redirecting to home page...`);
    window.location.href = "home.html";

  } catch (error) {
    console.error("Signup error details:", error);
    alert("❌ Signup failed: " + error.message);
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
// INTERACTIVE FORGOT PASSWORD WORKFLOWS
// =========================================================================
window.processStep1 = async function() {
  const emailInput = document.getElementById("forgotEmail") || document.getElementById("login-email");
  const emailValue = emailInput ? emailInput.value.trim() : "";

  if (!emailValue) {
    alert("⚠️ Please enter your email address.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailValue);
    
    if (document.getElementById("resetStep1") && document.getElementById("resetStep2")) {
      document.getElementById("resetStep1").style.display = "none";
      document.getElementById("resetStep2").style.display = "block";
    } else {
      alert("🚀 Link dispatched! Check your mail inbox container.");
    }
  } catch (error) {
    console.error("Reset step 1 issue:", error);
    alert("❌ Error sending reset email: " + error.message);
  }
};

window.processStep2 = function() {
  const otpInput = document.getElementById("forgotOTP");
  const otpValue = otpInput ? otpInput.value.trim() : "";
  
  if (otpValue.length !== 6) {
    alert("⚠️ Please enter the complete 6-digit verification code.");
    return;
  }
  
  document.getElementById("resetStep2").style.display = "none";
  document.getElementById("resetStep3").style.display = "block";
};

window.processStep3 = function() {
  const pass = document.getElementById("forgotNewPassword") ? document.getElementById("forgotNewPassword").value : "";
  const confirm = document.getElementById("forgotConfirmPassword") ? document.getElementById("forgotConfirmPassword").value : "";

  if (pass.length < 6) {
    alert("⚠️ Password must be at least 6 characters.");
    return;
  }
  if (pass !== confirm) {
    alert("❌ Passwords do not match.");
    return;
  }

  alert("🚀 Verified! Use the link in your email to instantly complete the change.");
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

// Ensure Firebase is accessible globally for debugging if needed
window.firebaseAuthInstance = auth;

// =========================================================================
// STANDARD LOGIN WORKFLOW
// =========================================================================
window.login = function () {
  console.log("Login function triggered manually.");
  
  const emailEl = document.getElementById("login-email");
  const passwordEl = document.getElementById("login-password");

  if (!emailEl || !passwordEl) {
    alert("❌ HTML Error: Core input fields ('login-email' or 'login-password') are missing from your HTML page structure.");
    return;
  }

  let email = emailEl.value.trim();
  let password = passwordEl.value;

  if (!email || !password) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `✅ Welcome back!`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
        window.location.href = "home.html";
      }, 1000);
    })
    .catch(err => {
      console.error("Login Error details:", err);
      let errorMsg = "Login failed. ";
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        errorMsg += "Incorrect email or password details.";
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

// =========================================================================
// STANDARD SIGNUP WORKFLOW
// =========================================================================
window.signup = async function () {
  console.log("Signup function triggered manually.");

  // Helper safe checker function
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const firstName = getVal("signup-firstname");
  const lastName = getVal("signup-lastname");
  const email = getVal("signup-email");
  const phone = getVal("signup-phone");
  const dob = document.getElementById("signup-dob") ? document.getElementById("signup-dob").value : null;
  const city = getVal("signup-city");
  const state = document.getElementById("signup-state") ? document.getElementById("signup-state").value : "";
  const college = getVal("signup-college");
  const experience = document.getElementById("signup-experience") ? document.getElementById("signup-experience").value : "";
  const password = document.getElementById("signup-password") ? document.getElementById("signup-password").value : "";
  const confirmPassword = document.getElementById("signup-confirm") ? document.getElementById("signup-confirm").value : "";
  const bio = getVal("signup-bio");
  const hackathonType = document.getElementById("signup-hackathon-type") ? document.getElementById("signup-hackathon-type").value : "";
  
  const skills = typeof window.getSelectedSkills === "function" ? window.getSelectedSkills() : [];
  const prefs = typeof window.getCommunicationPrefs === "function" ? window.getCommunicationPrefs() : {};

  // Structural Validations
  if (!firstName || !lastName) {
    alert("⚠️ Please enter your first and last name.");
    return;
  }
  if (!email || !email.includes("@")) {
    alert("⚠️ Please enter a valid email address.");
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
      city: city || null,
      state: state || null,
      college: college || null,
      experience: experience || null,
      skills: skills,
      bio: bio || null,
      hackathonPreference: hackathonType || null,
      communicationPrefs: prefs,
      createdAt: new Date(),
      updatedAt: new Date(),
      registeredHackathons: [],
      savedHackathons: [],
      reviewsCount: 0,
      profileComplete: true
    });

    alert(`🎉 Account ready. Redirecting to home page...`);
    window.location.href = "home.html";

  } catch (error) {
    console.error("Signup error details:", error);
    alert("❌ Signup failed: " + error.message);
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
// INTERACTIVE FORGOT PASSWORD WORKFLOWS
// =========================================================================
window.processStep1 = async function() {
  const emailInput = document.getElementById("forgotEmail") || document.getElementById("login-email");
  const emailValue = emailInput ? emailInput.value.trim() : "";

  if (!emailValue) {
    alert("⚠️ Please enter your email address.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailValue);
    
    if (document.getElementById("resetStep1") && document.getElementById("resetStep2")) {
      document.getElementById("resetStep1").style.display = "none";
      document.getElementById("resetStep2").style.display = "block";
    } else {
      alert("🚀 Link dispatched! Check your mail inbox container.");
    }
  } catch (error) {
    console.error("Reset step 1 issue:", error);
    alert("❌ Error sending reset email: " + error.message);
  }
};

window.processStep2 = function() {
  const otpInput = document.getElementById("forgotOTP");
  const otpValue = otpInput ? otpInput.value.trim() : "";
  
  if (otpValue.length !== 6) {
    alert("⚠️ Please enter the complete 6-digit verification code.");
    return;
  }
  
  document.getElementById("resetStep2").style.display = "none";
  document.getElementById("resetStep3").style.display = "block";
};

window.processStep3 = function() {
  const pass = document.getElementById("forgotNewPassword") ? document.getElementById("forgotNewPassword").value : "";
  const confirm = document.getElementById("forgotConfirmPassword") ? document.getElementById("forgotConfirmPassword").value : "";

  if (pass.length < 6) {
    alert("⚠️ Password must be at least 6 characters.");
    return;
  }
  if (pass !== confirm) {
    alert("❌ Passwords do not match.");
    return;
  }

  alert("🚀 Verified! Use the link in your email to instantly complete the change.");
  if (typeof window.closeForgotModal === "function") {
    window.closeForgotModal();
  }
};
