import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const list = document.getElementById("notificationList");
const emptyNotifications = document.getElementById("emptyNotifications");

async function loadNotifications() {
  try {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(50));
    const snap = await getDocs(q);

    if (snap.empty) {
      emptyNotifications.style.display = "block";
      return;
    }

    list.innerHTML = "";

    snap.forEach((doc) => {
      let data = doc.data();
      const timestamp = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'Recently';
      const icon = data.type === "new_hackathon" ? "🆕" : "🔔";

      list.innerHTML += `
        <div class="card" ${data.hackathonId ? `onclick="openDetails('${data.hackathonId}')"` : ''} style="cursor: ${data.hackathonId ? 'pointer' : 'default'};">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <div style="flex: 1;">
              <h3 style="font-size: 18px; margin-bottom: 5px;">${icon} ${data.title}</h3>
              <p style="font-size: 12px; color: #94a3b8;">${timestamp}</p>
            </div>
          </div>
          <p style="color: #cbd5e1; line-height: 1.6;">${data.message}</p>
          ${data.hackathonId ? '<p style="font-size: 12px; color: #6366f1; margin-top: 10px;">Click to view hackathon →</p>' : ''}
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading notifications:", error);
    list.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 20px;">❌ Error loading notifications</p>';
  }
}

window.openDetails = function(id){
  if (id) {
    localStorage.setItem("hackathonId", id);
    window.location.href = "details.html";
  }
};

loadNotifications();
