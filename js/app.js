import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let allHackathons = [];
let trendingHackathons = [];

const list = document.getElementById("hackathonList");
const trendingList = document.getElementById("trendingList");

// Memory array to track and clean up running countdown timer intervals
let runningIntervals = [];

async function loadHackathons() {
  try {
    const querySnapshot = await getDocs(collection(db, "hackathons"));
    allHackathons = [];

    querySnapshot.forEach((doc) => {
      let data = doc.data();
      data.id = doc.id;
      data.rating = data.rating || 0;
      data.views = data.views || 0;
      allHackathons.push(data);
    });

    // Sort by rating for trending shelf display (Top 3)
    trendingHackathons = [...allHackathons].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);

    displayTrending(trendingHackathons);
    displayHackathons(allHackathons);
  } catch (error) {
    console.error("Error loading hackathons:", error);
    list.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 20px;">❌ Error loading hackathons. Please try again.</p>';
  }
}

function displayTrending(dataArray) {
  trendingList.innerHTML = "";

  if (dataArray.length === 0) {
    trendingList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #cbd5e1;">No trending hackathons yet</p>';
    return;
  }

  dataArray.forEach((data) => {
    const badge = data.rating > 4 ? '<div class="trending-badge">🔥 TRENDING</div>' : '';
    const modeClass = data.mode === "Online" ? "online" : "offline";
    const campusIdentifier = data.collegeName ? `🏫 ${data.collegeName}` : "🏢 External Org Event";
    
    trendingList.innerHTML += `
      <div class="card trending-card" onclick="openDetails('${data.id}')">
        ${badge}
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
          <div>
            <small style="color: var(--secondary); font-weight: bold; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px;">${campusIdentifier}</small>
            <h3>${data.name}</h3>
            <p style="font-size: 12px; color: #94a3b8;">${data.organizer}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; color: #fbbf24;">${'★'.repeat(Math.round(data.rating || 0))}</div>
            <p style="font-size: 12px; color: #cbd5e1;">${data.rating ? data.rating.toFixed(1) : '0'}/5</p>
          </div>
        </div>

        <div style="background: rgba(236, 72, 153, 0.08); border-left: 3px solid var(--accent); padding: 4px 10px; border-radius: 6px; margin: 8px 0;">
          <span id="trend-clock-${data.id}" style="font-family: monospace; font-weight: bold; font-size: 13px; color: var(--accent);">Calculating...</span>
        </div>

        <p>💰 Prize: ${data.prizePool}</p>
        <div class="card-footer">
          <span class="badge ${modeClass}">${data.mode}</span>
          <span class="badge">👁️ ${data.views || 0} views</span>
        </div>
      </div>
    `;

    // Fire Live Clock Worker Thread for Trending section
    if (data.registrationDeadline) {
      startLiveTimer(`trend-clock-${data.id}`, data.registrationDeadline);
    }
  });
}

function displayHackathons(dataArray) {
  // Clear any existing active timer intervals to prevent background memory leaks
  runningIntervals.forEach(clearInterval);
  runningIntervals = [];

  list.innerHTML = "";

  if (dataArray.length === 0) {
    list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><p style="font-size: 48px; margin-bottom: 10px;">🔍</p><p style="color: #cbd5e1;">No hackathons found. Try adjusting your filters.</p></div>';
    return;
  }

  dataArray.forEach((data) => {
    const modeClass = data.mode === "Online" ? "online" : "offline";
    const ratingStars = data.rating ? '★'.repeat(Math.round(data.rating)) : '☆☆☆☆☆';
    const campusIdentifier = data.collegeName ? `🏫 ${data.collegeName}` : "🏢 External Org Event";
    
    list.innerHTML += `
      <div class="card" onclick="openDetails('${data.id}')">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
          <div style="flex: 1;">
            <small style="color: var(--secondary); font-weight: bold; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 2px;">${campusIdentifier}</small>
            <h3>${data.name}</h3>
            <p style="font-size: 13px; color: #94a3b8;">Organizer: ${data.organizer}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; color: #fbbf24;">${ratingStars}</div>
            <p style="font-size: 12px; color: #cbd5e1;">${data.rating ? data.rating.toFixed(1) : '0'}/5</p>
          </div>
        </div>

        <div style="background: rgba(236, 72, 153, 0.08); border-left: 3px solid var(--accent); padding: 6px 12px; border-radius: 6px; margin: 12px 0;">
          <span style="font-size: 11px; text-transform: uppercase; display: block; color: #cbd5e1; font-weight: 600;">Time Remaining:</span>
          <span id="main-clock-${data.id}" style="font-family: monospace; font-weight: bold; font-size: 14px; color: var(--accent);">Initializing...</span>
        </div>
        
        <p style="color: #cbd5e1; margin: 8px 0;">💰 Prize: <strong>${data.prizePool}</strong></p>
        ${data.location ? `<p style="color: #cbd5e1; margin: 8px 0;">📍 Location: ${data.location}</p>` : ''}
        <p style="color: #cbd5e1; margin: 8px 0; font-size: 13px;">${data.description ? data.description.substring(0, 80) + '...' : 'No description'}</p>
        
        <div class="card-footer">
          <span class="badge ${modeClass}">${data.mode}</span>
          <span class="badge">👁️ ${data.views || 0}</span>
          <button onclick="openDetails('${data.id}'); event.stopPropagation();" class="secondary" style="flex: 1; margin-left: auto;">View Details →</button>
        </div>
      </div>
    `;

    // Fire Live Clock Worker Thread for Main list view
    if (data.registrationDeadline) {
      startLiveTimer(`main-clock-${data.id}`, data.registrationDeadline);
    }
  });
}

// Live Countdown Processing Loop Function
function startLiveTimer(elementId, deadlineString) {
  const targetTime = new Date(deadlineString).getTime();

  function tick() {
    const clockView = document.getElementById(elementId);
    if (!clockView) return;

    const distance = targetTime - new Date().getTime();

    if (distance < 0) {
      clockView.textContent = "🔒 Registrations Closed";
      clockView.style.color = "#ef4444";
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    clockView.textContent = `${d}d ${h}h ${m}m ${s}s`;
  }

  tick();
  const nativeInterval = setInterval(tick, 1000);
  runningIntervals.push(nativeInterval);
}

window.openDetails = function(id){
  localStorage.setItem("hackathonId", id);
  // Increment views visually in the array context cache
  const hackathon = allHackathons.find(h => h.id === id);
  if (hackathon) {
    hackathon.views = (hackathon.views || 0) + 1;
  }
  window.location.href = "details.html";
}

// 🔍 SEARCH FUNCTION
window.searchHackathons = function () {
  let value = document.getElementById("searchBox").value.toLowerCase();

  let filtered = allHackathons.filter(item =>
    item.name.toLowerCase().includes(value) ||
    item.organizer.toLowerCase().includes(value) ||
    (item.collegeName && item.collegeName.toLowerCase().includes(value)) ||
    (item.location && item.location.toLowerCase().includes(value))
  );

  displayHackathons(filtered);
};

// 🎯 FILTER FUNCTION
window.filterHackathons = function () {
  let value = document.getElementById("filter").value;

  if (value === "all") {
    displayHackathons(allHackathons);
  } else {
    let filtered = allHackathons.filter(item =>
      item.mode === value
    );
    displayHackathons(filtered);
  }
};

// ⭐ SORT BY TRENDING
window.sortByTrending = function () {
  let sorted = [...allHackathons].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  displayHackathons(sorted);
  alert("Sorted by ratings! ⭐");
};

// Initial data parsing trigger
loadHackathons();