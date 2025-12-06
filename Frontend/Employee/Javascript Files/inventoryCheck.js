function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
}

let allProducts = [];

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:5000/api/products");
    allProducts = await response.json();

    console.log("Products loaded:", allProducts);

    displayProducts(allProducts); 
  } catch (error) {
    console.error("Error fetching:", error);
  }
}

loadProducts();

function displayProducts(products) {
  const tableBody = document.getElementById("tableBody");
  const resultTable = document.getElementById("resultTable");
  const noResult = document.getElementById("noResult");

  tableBody.innerHTML = "";
  noResult.textContent = "";

  if (products.length === 0) {
    resultTable.style.display = "none";
    noResult.textContent = " No products found!";
    return;
  }

  products.forEach(p => {
    const row = `
      <tr>
        <td>${p.name}</td>
        <td>${p.model}</td>
        <td>${p.category}</td>
        <td>${p.warranty}</td>
        <td>${p.units}</td>
        <td>${p.price} PKR</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });

  resultTable.style.display = "table";
}

function applyFilters() {
  let filtered = [...allProducts];

  const searchValue = document.getElementById("productSearch").value.trim().toLowerCase();

  
  if (searchValue !== "") {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchValue)
    );
  }

  
  const sortPrice = document.getElementById("sortPrice").checked;
  const sortUnits = document.getElementById("sortUnits").checked;
  const sortCategory = document.getElementById("sortCategory").checked;

  if (sortPrice) {
    filtered.sort((a, b) => a.price - b.price);
  }

  if (sortUnits) {
    filtered.sort((a, b) => a.units - b.units);
  }

  if (sortCategory) {
    filtered.sort((a, b) => a.category.localeCompare(b.category));
  }

  displayProducts(filtered);
}
