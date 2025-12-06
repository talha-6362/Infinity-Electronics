import { BASE_URL } from "../../js/api.js"; 

const feedbackList = document.getElementById("feedbackList");
const token = localStorage.getItem("token"); 

async function loadFeedbacks() {
  try {
    const res = await fetch(`${BASE_URL}/feedback/all`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to fetch feedbacks");

    const feedbacks = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderFeedbacks(feedbacks);

  } catch (err) {
    console.error("Error loading feedbacks:", err);
    feedbackList.innerHTML = "<p>Failed to load feedbacks. Check console.</p>";
  }
}

function renderFeedbacks(feedbacks) {
  feedbackList.innerHTML = "";
  feedbacks.forEach(fb => {
    const card = document.createElement("div");
    card.classList.add("feedback-card");
    card.innerHTML = `
      <div class="feedback-header">
        <h3>${fb.name}</h3>
        <span>${fb.email}</span>
        <span><strong>Date:</strong> ${new Date(fb.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="feedback-body">
        <p>${fb.message}</p>
      </div>
    `;
    feedbackList.appendChild(card);
  });
}

window.searchFeedback = function() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".feedback-card");
  cards.forEach(card => {
    const name = card.querySelector("h3").innerText.toLowerCase();
    const email = card.querySelector("span").innerText.toLowerCase();
    card.style.display = (name.includes(query) || email.includes(query)) ? "block" : "none";
  });
};

document.addEventListener("DOMContentLoaded", loadFeedbacks);
