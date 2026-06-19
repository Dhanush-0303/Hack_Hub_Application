import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.addHackathon = async function () {
  // Get all form values
  const name = document.getElementById("name").value.trim();
  const organizer = document.getElementById("organizer").value.trim();
  const prizePool = document.getElementById("prizePool").value.trim();
  const mode = document.getElementById("mode").value;
  const location = document.getElementById("location").value.trim();
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const registrationDeadline = document.getElementById("registrationDeadline").value;
  const teamSize = document.getElementById("teamSize").value.trim();
  const registrationLink = document.getElementById("registrationLink").value.trim();
  const contactEmail = document.getElementById("contactEmail").value.trim();
  const description = document.getElementById("description").value.trim();
  const eligibility = document.getElementById("eligibility").value.trim();
  const rules = document.getElementById("rules").value.trim();

  // Validation
  if (!name || !organizer || !prizePool || !mode || !description) {
    alert("⚠️ Please fill in all required fields (marked with *)");
    return;
  }

  if (mode === "") {
    alert("⚠️ Please select a mode (Online/Offline/Hybrid)");
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (contactEmail && !emailRegex.test(contactEmail)) {
    alert("⚠️ Please enter a valid email address");
    return;
  }

  try {
    // Show loading state
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span> Adding...';
    button.disabled = true;

    // Create hackathon document
    const hackathonRef = await addDoc(collection(db, "hackathons"), {
      name,
      organizer,
      prizePool,
      mode,
      location: location || null,
      startDate: startDate || null,
      endDate: endDate || null,
      registrationDeadline: registrationDeadline || null,
      teamSize: teamSize || null,
      registrationLink: registrationLink || null,
      contactEmail: contactEmail || null,
      description,
      eligibility: eligibility || null,
      rules: rules || null,
      rating: 0,
      reviewCount: 0,
      views: 0,
      createdAt: serverTimestamp(),
      createdBy: "Admin"
    });

    // Create notification
    await addDoc(collection(db, "notifications"), {
      title: "🆕 New Hackathon Added!",
      message: `${name} has just been listed on India Hackathon Hub! Check it out and register now.`,
      hackathonId: hackathonRef.id,
      createdAt: serverTimestamp(),
      type: "new_hackathon"
    });

    // Reset form
    document.getElementById("name").value = "";
    document.getElementById("organizer").value = "";
    document.getElementById("prizePool").value = "";
    document.getElementById("mode").value = "";
    document.getElementById("location").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("registrationDeadline").value = "";
    document.getElementById("teamSize").value = "";
    document.getElementById("registrationLink").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("description").value = "";
    document.getElementById("eligibility").value = "";
    document.getElementById("rules").value = "";

    // Reset button
    button.innerHTML = originalText;
    button.disabled = false;

    // Show success message
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '✅ Hackathon added successfully! Users will see it in their feed.';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);

    alert(`✅ Hackathon "${name}" has been added successfully!\n\nUsers will be notified about this new opportunity.`);
  }
  catch (error) {
    console.error("Error:", error);
    alert(`❌ Error: ${error.message}`);
    const button = event.target;
    button.innerHTML = "➕ Add Hackathon";
    button.disabled = false;
  }
};
