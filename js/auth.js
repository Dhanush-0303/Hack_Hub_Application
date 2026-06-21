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
      alert(`🎉 Welcome to India Hackathon Hub, ${firstName}!\n\nYour account is ready.
