import "../../js/sessionCheck.js"; 
import { BASE_URL } from "../../js/api.js"; 

function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("show");
}

/* ======================================================
   🔵 Fetch ALL products (flat array from backend)
====================================================== */
async function fetchProducts() {
  try {
    const res = await fetch(`${BASE_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();  // returns array
  } catch (err) {
    console.error("Fetch Products Error:", err);
    return [];
  }
}

/* ======================================================
   🟢 Convert array → category-wise grouped object
====================================================== */
function groupByCategory(products) {
  const grouped = {
    fans: [],
    refrigerators: [],
    mobiles: [],
    bikes: [],
    washing: [],
    dryers: []
  };

  products.forEach(p => {
    const cat = p.category?.toLowerCase();

    if (cat === "fan") grouped.fans.push(p);
    else if (cat === "refrigerator") grouped.refrigerators.push(p);
    else if (cat === "mobile") grouped.mobiles.push(p);
    else if (cat === "bike") grouped.bikes.push(p);
    else if (cat === "washing machine") grouped.washing.push(p);
    else if (cat === "dryer") grouped.dryers.push(p);
  });

  return grouped;
}

/* ======================================================
   🟠 Display all category-wise grouped products
====================================================== */
function displayProducts(grouped) {
  const categoryIds = {
    fans: "fansGrid",
    refrigerators: "refrigeratorsGrid",
    mobiles: "mobilesGrid",
    bikes: "bikesGrid",
    washing: "washingGrid",
    dryers: "dryersGrid"
  };

  Object.keys(categoryIds).forEach(cat => {
    const grid = document.getElementById(categoryIds[cat]);
    const items = grouped[cat];

    grid.innerHTML = items.length
      ? items
          .map(
            (p) => `
        <div class="product-card">
  <img src="http://localhost:5000/${p.image}" alt="${p.name}" onerror="this.src='Images/placeholder.png'">
  <div class="product-info">
    <h3>${p.name}</h3>
    <p><b>Model:</b> ${p.model}</p>   <!-- 👈 NEW LINE -->
    <p><b>Price:</b> PKR ${p.price}</p>
    <p><b>Warranty:</b> ${p.warranty}</p>
    <p>${p.description}</p>
<button onclick="goToRequestPage('${p._id}', '${p.name}', '${p.model}', '${p.price}', '${p.description}')">
  Request Now
</button>

  </div>
</div>
 `
          )
          .join("")
      : "<p>No products available.</p>";
  });
}

function goToRequestPage(id, name, model, price, specs) {
  localStorage.setItem(
    "selectedProduct",
    JSON.stringify({ id, name, model, price, specs })
  );
  window.location.href = "Request.html";
}
window.goToRequestPage = goToRequestPage;


// viewProducts.js ke end me ya start me
function searchProducts() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const products = document.querySelectorAll(".product-card");

  products.forEach(p => {
    const name = p.querySelector("h3").textContent.toLowerCase();
    if (name.includes(input)) p.style.display = "block";
    else p.style.display = "none";
  });
}
// ===== TOGGLE FEEDBACK FORM =====
function toggleFeedback() {
  const content = document.getElementById("feedbackContent");
  content.style.display = content.style.display === "block" ? "none" : "block";
}
window.toggleFeedback = toggleFeedback;

const feedbackForm = document.querySelector(".feedback-form");
feedbackForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = feedbackForm.querySelector("input[placeholder='Your Name']").value.trim();
  const email = feedbackForm.querySelector("#fbEmail").value.trim();
  const message = feedbackForm.querySelector("textarea").value.trim();
  const thankMsg = feedbackForm.querySelector(".thank-msg");

  if (!name || !email || !message) return alert("All fields are required");

  try {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();
    if (data.success) {
      thankMsg.style.display = "block";
      feedbackForm.reset();
    } else {
      alert(data.message || "Failed to submit feedback");
    }
  } catch (err) {
    console.error("Feedback submission error:", err);
    alert("Server error!");
  }
});



document.addEventListener("DOMContentLoaded", async () => {
  const products = await fetchProducts();     
  const grouped = groupByCategory(products);  
  displayProducts(grouped);
});
window.searchProducts = searchProducts;
window.goToRequestPage = goToRequestPage;
window.toggleMenu = toggleMenu;
window.searchProducts = searchProducts;
