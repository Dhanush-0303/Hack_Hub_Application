import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const list = document.getElementById("bookmarkList");
const emptyState = document.getElementById("emptyState");

async function loadBookmarks() {
  try {
    const snap = await getDocs(collection(db, "bookmarks"));

    if (snap.empty) {
      emptyState.style.display = "block";
      return;
    }

    list.innerHTML = "";

    snap.forEach((docSnap) => {
      let data = docSnap.data();
      const modeClass = data.mode === "Online" ? "online" : "offline";
      const ratingStars = data.rating ? '★'.repeat(Math.round(data.rating)) : '☆☆☆☆☆';

      list.innerHTML += `
        <div class="card" onclick="openDetails('${docSnap.id}')">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <div style="flex: 1;">
              <h3>${data.name}</h3>
              <p style="font-size: 13px; color: #94a3b8;">${data.organizer}</p>
            </div>
            <button onclick="removeBookmark('${docSnap.id}'); event.stopPropagation();" class="danger" style="padding: 8px 12px; font-size: 12px;">✕ Remove</button>
          </div>
          
          <p style="color: #cbd5e1; margin: 8px 0;">💰 <strong>${data.prizePool}</strong></p>
          ${data.location ? `<p style="color: #cbd5e1; margin: 8px 0;">📍 ${data.location}</p>` : ''}
          
          <div style="display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap;">
            <span class="badge ${modeClass}">${data.mode}</span>
            <span class="badge" style="background: linear-gradient(135deg, #fbbf24, #f59e0b);">⭐ ${data.rating ? data.rating.toFixed(1) : '0'}/5</span>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading bookmarks:", error);
    list.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 20px;">❌ Error loading bookmarks</p>';
  }
}

window.removeBookmark = async function(id) {
  if (!confirm("⚠️ Remove this hackathon from bookmarks?")) {
    return;
  }

  try {
    await deleteDoc(doc(db, "bookmarks", id));
    alert("✅ Removed from bookmarks");
    loadBookmarks();
  } catch (error) {
    console.error("Error removing bookmark:", error);
    alert("❌ Error removing bookmark");
  }
};

window.openDetails = function(id){
  localStorage.setItem("hackathonId", id);
  window.location.href = "details.html";
};

loadBookmarks();
