import "../../js/sessionCheck.js";

const tableBody = document.getElementById("tableBody");
const noResult = document.getElementById("noResult");
const searchInput = document.getElementById("productSearch");
const sortRadios = document.querySelectorAll('input[name="sort"]');
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.getElementById("navLinks");

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.role) {
  alert("Please login first!");
  window.location.href = "../login.html";
}

const role = user.role;
const userId = String(user.userId || user.id);

let products = [];

function setupNavbarToggle() {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

async function fetchProducts() {
  try {
    const res = await fetch("http://localhost:5000/api/products", {
      headers: token ? { Authorization: "Bearer " + token } : {}
    });

    const result = await res.json();
    products = Array.isArray(result) ? result : result.data || [];
    applyFiltersAndSort();
  } catch (err) {
    console.error("Fetch products error:", err);
    tableBody.innerHTML =
      "<tr><td colspan='5'>Failed to load products.</td></tr>";
  }
}

function renderTable(data) {
  if (!data.length) {
    tableBody.innerHTML = "";
    noResult.textContent = "No products found.";
    return;
  }
  noResult.textContent = "";

  const rows = data.map(item => {
    let actionBtn = "";
    const isInventoryAdded = item.addedByRole === "inventory";
    const addedByUserId = item.addedBy || item.userId;

    if (role === "admin") {
      actionBtn = `<button class="delete-btn" data-id="${item._id}">Delete</button>`;
    }
    else if (role === "inventory" && isInventoryAdded) {
      actionBtn = `<button class="delete-btn" data-id="${item._id}">Delete</button>`;
    }
    else if (role === "user" && addedByUserId === userId) {
      actionBtn = `<button class="delete-btn" data-id="${item._id}">Delete</button>`;
    }

    return `
      <tr>
        <td>${item.name || 'N/A'}</td>
        <td>${item.category || 'N/A'}</td>
        <td>${item.price?.toLocaleString() || 0} PKR</td>
        <td>${item.units || 0}</td>
        <td>${actionBtn}</td>
      </tr>
    `;
  }).join("");

  tableBody.innerHTML = rows;
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    alert(data.message || "Product deleted");
    fetchProducts();

  } catch (err) {
    console.error("Delete error:", err);
    alert("Delete failed");
  }
}

function filterProducts(query) {
  return products.filter(p => p.name?.toLowerCase().includes(query.toLowerCase()));
}

function sortProducts(data, sortValue) {
  const sorted = [...data];
  switch (sortValue) {
    case "priceAsc": return sorted.sort((a,b)=>a.price-b.price);
    case "priceDesc": return sorted.sort((a,b)=>b.price-a.price);
    case "stockAsc": return sorted.sort((a,b)=>a.units-b.units);
    case "stockDesc": return sorted.sort((a,b)=>b.units-a.units);
    default: return sorted;
  }
}

function applyFiltersAndSort() {
  const query = searchInput.value.trim();
  const sortValue = document.querySelector('input[name="sort"]:checked').value;
  let filtered = filterProducts(query);
  filtered = sortProducts(filtered, sortValue);
  renderTable(filtered);
}

searchInput.addEventListener("input", applyFiltersAndSort);
sortRadios.forEach(radio => radio.addEventListener("change", applyFiltersAndSort));

tableBody.addEventListener("click", e => {
  if (e.target.classList.contains("delete-btn")) {
    deleteProduct(e.target.dataset.id);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (navLinks.classList.contains("show")) {
    navLinks.classList.remove("show");
  }

  setupNavbarToggle();
  fetchProducts();
});