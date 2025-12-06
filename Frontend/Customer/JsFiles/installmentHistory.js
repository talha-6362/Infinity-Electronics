import "../../js/sessionCheck.js";
import { BASE_URL } from "../../js/api.js";

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
}

window.toggleMenu = toggleMenu;

window.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const errorMsg = document.getElementById("errorMsg");
  const tableContainer = document.getElementById("tableContainer");
  const tbody = document.querySelector("#installmentTable tbody");

  function clearTable() {
    if (tbody) tbody.innerHTML = "";
  }

  async function handleSearch() {
    const inputVal = searchInput.value.trim();
    errorMsg.textContent = "";
    tableContainer.style.display = "none";
    clearTable();

    if (!inputVal) {
      errorMsg.textContent = "Please enter your CNIC.";
      return;
    }

    if (!/^[0-9]{13}$/.test(inputVal)) {
      errorMsg.textContent = "Please enter valid 13-digit CNIC.";
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/requests/${inputVal}`);
      const result = await res.json();

      if (!result.success || !result.data.length) {
        errorMsg.textContent = "No request found for this CNIC.";
        return;
      }

      result.data.forEach((req, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${req._id}</td>
            <td>${req.productName}</td>
            <td>${req.accountNo}</td>
            <td>${req.custName}</td>
            <td>${req.productModel}</td>
            <td>${req.productPrice}</td>
            <td>${req.status}</td>

          </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      tableContainer.style.display = "block";

    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Server error, please try again later.";
    }
  }

  searchBtn.addEventListener("click", handleSearch);

  searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter") handleSearch();
  });
});
