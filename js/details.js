import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let id = localStorage.getItem("hackathonId");
let currentRating = 0;

const detailsDiv = document.getElementById("details");

async function loadDetails() {
  if (!id) {
    detailsDiv.innerHTML = "<p>No hackathon selected.</p>";
    return;
  }

  try {
    const docRef = doc(db, "hackathons", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let data = docSnap.data();

      const startDate = data.startDate ? new Date(data.startDate).toLocaleDateString() : 'N/A';
      const endDate = data.endDate ? new Date(data.endDate).toLocaleDateString() : 'N/A';
      const ratingStars = data.rating ? '★'.repeat(Math.round(data.rating)) : '☆☆☆☆☆';
      
      // 🏫 Campus Tag Mapping Logic
      const campusTag = data.collegeName ? `🏫 ${data.collegeName}` : "🏢 External Organization Event";

      detailsDiv.innerHTML = `
        <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 16px; padding: 30px; backdrop-filter: blur(10px);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <div>
              <small style="color: var(--secondary); font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">${campusTag}</small>
              <h2>${data.name}</h2>
              <p style="color: #cbd5e1; margin-top: 5px;">by <strong style="color: #06b6d4;">${data.organizer}</strong></p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 32px; color: #fbbf24;">${ratingStars}</div>
              <p style="color: #cbd5e1;">${data.rating ? data.rating.toFixed(1) : '0'}/5 (${data.reviewCount || 0} reviews)</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
            <div style="background: rgba(99, 102, 241, 0.1); padding: 15px; border-radius: 10px; border-left: 4px solid var(--primary);">
              <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Prize Pool</p>
              <p style="font-size: 20px; color: #06b6d4; font-weight: bold; margin-top: 5px;">${data.prizePool}</p>
            </div>
            <div style="background: rgba(99, 102, 241, 0.1); padding: 15px; border-radius: 10px; border-left: 4px solid var(--secondary);">
              <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Mode</p>
              <p style="font-size: 20px; color: #06b6d4; font-weight: bold; margin-top: 5px;">${data.mode || 'N/A'}</p>
            </div>
            <div style="background: rgba(99, 102, 241, 0.1); padding: 15px; border-radius: 10px; border-left: 4px solid #fbbf24;">
              <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Dates</p>
              <p style="font-size: 14px; color: #06b6d4; font-weight: bold; margin-top: 5px;">${startDate} - ${endDate}</p>
            </div>
          </div>

          <hr style="border: none; border-top: 1px solid var(--border-color); margin: 20px 0;">

          <h3 style="color: #06b6d4; margin-top: 20px; margin-bottom: 10px;">📝 Description</h3>
          <p style="line-height: 1.8; color: #cbd5e1; white-space: pre-line;">${data.description || 'No description available'}</p>

          ${data.eligibility ? `
            <h3 style="color: #06b6d4; margin-top: 20px; margin-bottom: 10px;">✅ Eligibility</h3>
            <p style="line-height: 1.8; color: #cbd5e1; background: rgba(99, 102, 241, 0.03); padding: 12px; border-radius: 8px; white-space: pre-line;">${data.eligibility}</p>
          ` : ''}

          ${data.rules ? `
            <h3 style="color: #06b6d4; margin-top: 20px; margin-bottom: 10px;">⚖️ Rules & Guidelines</h3>
            <p style="line-height: 1.8; color: #cbd5e1; background: rgba(99, 102, 241, 0.03); padding: 12px; border-radius: 8px; white-space: pre-line;">${data.rules}</p>
          ` :