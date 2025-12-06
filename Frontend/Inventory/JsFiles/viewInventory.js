function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
}

const tableBody = document.getElementById("tableBody");
const noResult = document.getElementById("noResult");
const searchInput = document.getElementById("productSearch");
const sortRadios = document.querySelectorAll('input[name="sort"]');

let products = [];
const token = localStorage.getItem("token"); 

async function fetchProducts() {
  try {
    const res = await fetch("http://localhost:5000/api/products", {
      headers: token ? { "Authorization": "Bearer " + token } : {}
    });
    const data = await res.json();
    products = Array.isArray(data) ? data : data.products || [];
    applyFiltersAndSort();
  } catch (err) {
    console.error("Error fetching products:", err);
    tableBody.innerHTML = "<tr><td colspan='5'>Failed to load products.</td></tr>";
  }
}

function renderTable(data) {
  tableBody.innerHTML = "";

  if (data.length === 0) {
    noResult.textContent = "No products found.";
    return;
  } else noResult.textContent = "";

  data.forEach((item) => {
    const row = `<tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.price.toLocaleString()} PKR</td>
      <td>${item.units}</td>
      <td>${token ? `<button class="delete-btn" onclick="deleteProduct('${item._id}')">Delete</button>` : ""}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  try {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json();
    if (res.ok) fetchProducts(); 
    else alert(data.message || "Delete failed");
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
}

function filterProducts(query) {
  return products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
}

function sortProducts(data, sortValue) {
  switch (sortValue) {
    case "priceAsc":
      return data.sort((a, b) => a.price - b.price);
    case "priceDesc":
      return data.sort((a, b) => b.price - a.price);
    case "stockAsc":
      return data.sort((a, b) => a.units - b.units);
    case "stockDesc":
      return data.sort((a, b) => b.units - a.units);
    default:
      return data;
  }
}

function applyFiltersAndSort() {
  const query = searchInput.value.trim();
  let filtered = filterProducts(query);

  const sortValue = document.querySelector('input[name="sort"]:checked').value;
  filtered = sortProducts(filtered, sortValue);

  renderTable(filtered);
}

searchInput.addEventListener("input", applyFiltersAndSort);
sortRadios.forEach(radio => radio.addEventListener("change", applyFiltersAndSort));

fetchProducts();
