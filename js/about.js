import { db } from "./firebase.js";
import { 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getAuth, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

// 🔒 Founder Email Security Check Rule
const FOUNDER_EMAIL = "dd1564876@gmail.com"; 

const cardTarget = document.getElementById("dynamicFounderSection");
const editPanel = document.getElementById("founderEditPanel");

let profileData = {};

// 1. Check if the user logged into the app is the Founder
onAuthStateChanged(auth, (user) => {
  if (user && user.email.toLowerCase() === FOUNDER_EMAIL.toLowerCase()) {
    // Reveal the input management forms only to you
    if (editPanel) editPanel.style.display = "block";
  } else {
    if (editPanel) editPanel.style.display = "none";
  }
  // Pull current data profiles from Firebase
  loadFounderProfile();
});

// 2. Fetch the profile dataset from Firestore
async function loadFounderProfile() {
  try {
    const docRef = doc(db, "meta", "founderProfile");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      profileData = docSnap.data();
    } else {
      // Default baseline values matching your static HTML profile data layout exactly
      profileData = {
        "Name": "HB Dhanush",
        "Role": "Founder & Lead Developer",
        "Bio": "A passionate developer and hackathon enthusiast with a vision to make hackathon discovery seamless for every aspiring innovator in India. I am created this platform to bridge the gap between opportunities and talent.",
        "Email": "dd1564876@gmail.com",
        "Twitter": "https://twitter.com",
        "LinkedIn": "https://www.linkedin.com/in/hb-dhanush-719425370/",
        "GitHub": "https://github.com/Dhanush-0303",
        "Instagram": "https://www.instagram.com/itz_dhanuu_18/"
      };
      
      // Save the baseline configurations automatically if Firestore document is totally blank
      await setDoc(docRef, profileData);
    }

    renderCard();
  } catch (error) {
    console.error("Error loading founder profile registry:", error);
    if (cardTarget) {
      cardTarget.innerHTML = `<p style="color: #ef4444; text-align: center;">❌ Error rendering core developer specifications map profile.</p>`;
    }
  }
}

// 3. Render the markup dynamically on the fly
function renderCard() {
  if (!cardTarget) return;

  let platformLinksHTML = "";

  // Dynamic iteration parsing through custom added option keys
  Object.keys(profileData).forEach((key) => {
    // Filter structural properties to isolate profile metadata links/options
    if (key === "Name" || key === "Role" || key === "Bio" || key === "Email") return;

    const valueStr = profileData[key];
    if (valueStr.startsWith("http://") || valueStr.startsWith("https://")) {
      platformLinksHTML += `<a href="${valueStr}" target="_blank" style="margin: 0 10px; color: #06b6d4; text-decoration: none; font-weight: 500;">${key}</a>`;
    } else {
      platformLinksHTML += `<span style="margin: 0 10px; color: #cbd5e1;"><strong>${key}:</strong> ${valueStr}</span>`;
    }
  });

  cardTarget.innerHTML = `
    <div class="founder-section" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 16px; padding: 30px; display: flex; gap: 25px; align-items: center; flex-wrap: wrap;">
      
      <div class="founder-avatar" style="flex-shrink: 0; width: 120px; height: 120px; border-radius: 50%; overflow: hidden; border: 3px solid #06b6d4;">
        <img src="dhanu.jpeg" alt="HB Dhanush Profile" style="width: 100%; height: 100%; object-fit: cover;">
      </div>

      <div class="founder-info" style="flex: 1; min-width: 250px;">
        <h3 style="font-size: 24px; margin: 0; color: var(--text-primary);">${profileData.Name || "HB Dhanush"}</h3>
        <p style="color: #06b6d4; margin: 5px 0 15px 0;"><strong>${profileData.Role || "Founder & Lead Developer"}</strong></p>
        
        <p style="line-height: 1.8; color: #cbd5e1; margin-bottom: 15px;">
          ${profileData.Bio || ""}
        </p>
        
        <p style="margin-bottom: 12px; font-size: 14px;">
          <strong>📧 Email:</strong> <a href="mailto:${profileData.Email || 'dd1564876@gmail.com'}" style="color: #6366f1; text-decoration: none;">${profileData.Email || 'dd1564876@gmail.com'}</a>
        </p>

        <p style="margin-top: 15px; font-size: 14px;">
          <strong>🔗 Connect Links:</strong>
          <span style="display: inline-block;">${platformLinksHTML}</span>
        </p>
      </div>

    </div>
  `;
}

// 4. Update core layout configuration variables safely down to operational collection index
window.saveFounderOption = async function() {
  const labelKey = document.getElementById("editFieldLabel").value.trim();
  const valueContent = document.getElementById("editFieldValue").value.trim();

  if (!labelKey) {
    alert("⚠️ Please specify an option label name!");
    return;
  }

  try {
    // Omit logic function: deleting key entirely if left completely blank
    if (valueContent === "") {
      delete profileData[labelKey];
    } else {
      profileData[labelKey] = valueContent;
    }

    const docRef = doc(db, "meta", "founderProfile");
    await setDoc(docRef, profileData);

    alert(`✅ Option updated successfully!`);

    // Reset interaction forms fields
    document.getElementById("editFieldLabel").value = "";
    document.getElementById("editFieldValue").value = "";

    renderCard();
  } catch (error) {
    console.error("Firestore database transactional payload error:", error);
    alert("❌ Check your database storage connectivity context rules configuration layers.");
  }
};
