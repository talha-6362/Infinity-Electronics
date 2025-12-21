import "../../js/sessionCheck.js";
import { BASE_URL } from "../../js/api.js";
import "../../js/sessionCheck.js";
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
      } else {
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
      }

      await loadPaymentHistory(inputVal);

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


async function loadPaymentHistory(cnic) {
  const container = document.getElementById("paymentContainer");
  const detailsDiv = document.getElementById("paymentDetails");

  if (!container || !detailsDiv) return;

  container.style.display = "none";
  detailsDiv.innerHTML = "";

  try {
    const res = await fetch(`${BASE_URL}/customers/history/${cnic}`);
    const data = await res.json();

    if (!data.success || !data.data.length) return;

    data.data.forEach(p => {
      const div = document.createElement("div");
      div.className = "payment-card";

      div.innerHTML = `
        <h4>${p.product} (${p.model || "-"})</h4>
        <p><b>Account No:</b> ${p.accountNo}</p>
        <p><b>Total Price:</b> PKR ${p.totalPrice}</p>
        <p><b>Total Paid:</b> PKR ${p.totalPaid}</p>
        <p><b>Remaining:</b> PKR ${p.remaining}</p>

        <table class="inner-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${
              p.installments.length
                ? p.installments.map((i, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>PKR ${i.amount}</td>
                      <td>${new Date(i.paidAt).toLocaleDateString()}</td>
                    </tr>
                  `).join("")
                : `<tr><td colspan="3">No payments yet</td></tr>`
            }
          </tbody>
        </table>
      `;

      detailsDiv.appendChild(div);
    });

    container.style.display = "block";

  } catch (err) {
    console.error("Payment history error:", err);
  }
}
