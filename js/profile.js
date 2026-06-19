import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let currentUser = null;
let userData = null;

// Check authentication and load profile
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  await loadUserProfile(user.uid);
});

// Load user profile from Firestore
async function loadUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (userDoc.exists()) {
      userData = userDoc.data();
      displayProfile();
      populateEditForm();
    } else {
      console.error("User profile not found");
      alert("Profile not found. Please contact support.");
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    alert("Error loading profile. Please try again.");
  }
}

// Display user profile
function displayProfile() {
  // Header
  const firstName = userData.firstName || "User";
  const lastName = userData.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initial = firstName.charAt(0).toUpperCase();

  document.getElementById("profileName").textContent = fullName;
  document.getElementById("profileEmail").textContent = userData.email;
  document.getElementById("profileAvatar").textContent = initial;

  // Stats
  document.getElementById("hackathonsCount").textContent = 
    userData.registeredHackathons?.length || 0;
  document.getElementById("reviewsCount").textContent = 
    userData.reviewsCount || 0;
  document.getElementById("savedCount").textContent = 
    userData.savedHackathons?.length || 0;

  // Overview Tab
  document.getElementById("overview-name").textContent = fullName;
  document.getElementById("overview-email").textContent = userData.email;
  document.getElementById("overview-phone").textContent = userData.phone || "Not provided";
  document.getElementById("overview-dob").textContent = 
    userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : "Not provided";

  document.getElementById("overview-city").textContent = userData.city || "Not provided";
  document.getElementById("overview-state").textContent = 
    formatState(userData.state) || "Not provided";
  document.getElementById("overview-college").textContent = userData.college || "Not provided";

  document.getElementById("overview-experience").textContent = 
    formatExperience(userData.experience) || "Not specified";

  // Skills
  const skillsDiv = document.getElementById("overview-skills");
  if (userData.skills && userData.skills.length > 0) {
    skillsDiv.innerHTML = userData.skills
      .map(skill => `<span class="skill-badge">${formatSkill(skill)}</span>`)
      .join("");
  } else {
    skillsDiv.innerHTML = '<span style="color: var(--text-secondary);">No skills added</span>';
  }

  // Preferences
  document.getElementById("overview-pref-type").textContent = 
    formatHackathonType(userData.hackathonPreference) || "Not specified";
  document.getElementById("overview-pref-email").textContent = 
    userData.communicationPrefs?.email ? "✅ Enabled" : "❌ Disabled";
  document.getElementById("overview-pref-notification").textContent = 
    userData.communicationPrefs?.notification ? "✅ Enabled" : "❌ Disabled";

  // Bio
  document.getElementById("overview-bio").textContent = userData.bio || "No bio added yet";
}

// Populate edit form
function populateEditForm() {
  document.getElementById("edit-firstname").value = userData.firstName || "";
  document.getElementById("edit-lastname").value = userData.lastName || "";
  document.getElementById("edit-phone").value = userData.phone || "";
  document.getElementById("edit-dob").value = userData.dateOfBirth || "";
  document.getElementById("edit-city").value = userData.city || "";
  document.getElementById("edit-college").value = userData.college || "";
  document.getElementById("edit-bio").value = userData.bio || "";
  document.getElementById("bioEditCount").textContent = (userData.bio || "").length + "/300";
}

// Save profile changes
window.saveProfile = async function() {
  if (!currentUser || !userData) return;

  try {
    const updates = {
      firstName: document.getElementById("edit-firstname").value.trim(),
      lastName: document.getElementById("edit-lastname").value.trim(),
      phone: document.getElementById("edit-phone").value.trim(),
      dateOfBirth: document.getElementById("edit-dob").value,
      city: document.getElementById("edit-city").value.trim(),
      college: document.getElementById("edit-college").value.trim(),
      bio: document.getElementById("edit-bio").value.trim(),
      updatedAt: new Date()
    };

    // Validate required fields
    if (!updates.firstName || !updates.city) {
      alert("⚠️ Please fill in First Name and City");
      return;
    }

    // Update in Firestore
    await updateDoc(doc(db, "users", currentUser.uid), updates);

    // Update local data
    userData = { ...userData, ...updates };

    // Refresh display
    displayProfile();

    // Show success message
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '✅ Profile updated successfully!';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      switchProfileTab('overview');
    }, 2000);

  } catch (error) {
    console.error("Error saving profile:", error);
    alert("❌ Error saving profile. Please try again.");
  }
};

// Cancel edit
window.cancelEdit = function() {
  populateEditForm();
  switchProfileTab('overview');
};

// Helper functions to format display values
function formatSkill(skill) {
  const skillMap = {
    'web': '🌐 Web Development',
    'mobile': '📱 Mobile App',
    'ai': '🤖 AI/ML',
    'data': '📊 Data Science',
    'blockchain': '⛓️ Blockchain',
    'iot': '🔌 IoT',
    'design': '🎨 UI/UX Design',
    'devops': '⚙️ DevOps'
  };
  return skillMap[skill] || skill;
}

function formatExperience(exp) {
  const expMap = {
    'beginner': '🌱 Beginner',
    'intermediate': '📈 Intermediate',
    'advanced': '⭐ Advanced',
    'expert': '🏆 Expert'
  };
  return expMap[exp] || exp;
}

function formatHackathonType(type) {
  const typeMap = {
    'online': '🌐 Online',
    'offline': '📍 Offline',
    'both': '🔄 Both'
  };
  return typeMap[type] || type;
}

function formatState(state) {
  const stateMap = {
    'karnataka': 'Karnataka',
    'maharashtra': 'Maharashtra',
    'tamil-nadu': 'Tamil Nadu',
    'telangana': 'Telangana',
    'uttar-pradesh': 'Uttar Pradesh',
    'delhi': 'Delhi',
    'punjab': 'Punjab',
    'haryana': 'Haryana',
    'west-bengal': 'West Bengal',
    'andhra-pradesh': 'Andhra Pradesh',
    'rajasthan': 'Rajasthan',
    'gujarat': 'Gujarat',
    'kerala': 'Kerala',
    'madhya-pradesh': 'Madhya Pradesh',
    'bihar': 'Bihar',
    'jharkhand': 'Jharkhand',
    'odisha': 'Odisha',
    'chhattisgarh': 'Chhattisgarh',
    'assam': 'Assam',
    'himachal-pradesh': 'Himachal Pradesh',
    'uttarakhand': 'Uttarakhand',
    'goa': 'Goa',
    'tripura': 'Tripura',
    'manipur': 'Manipur',
    'meghalaya': 'Meghalaya',
    'mizoram': 'Mizoram',
    'nagaland': 'Nagaland',
    'sikkim': 'Sikkim',
    'arunachal-pradesh': 'Arunachal Pradesh'
  };
  return stateMap[state] || state;
}
