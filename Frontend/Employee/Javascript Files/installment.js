import { apiGet, apiPut } from "../../js/api.js";
import "../../js/sessionCheck.js";

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
}
window.toggleMenu = toggleMenu;

const tableBody = document.querySelector("#customerTable tbody");
const searchInput = document.getElementById("searchName");
const clearBtn = document.getElementById("clearSearch");

const acctInput = document.getElementById("accountNumber");
const nameInput = document.getElementById("customerName");
const remainingInput = document.getElementById("remainingAmount");
const installmentInput = document.getElementById("installmentAmount");

const accountError = document.getElementById("accountNumberError");
const installmentError = document.getElementById("installmentAmountError");
const successMsg = document.getElementById("successMsg");

const modal = document.getElementById("witnessModal");
const closeBtn = document.getElementById("closeModal");

let customers = [];


async function loadCustomers() {
  try {
    const res = await apiGet("/customers/all");

    if (res.success && Array.isArray(res.data)) {
      customers = res.data.map(c => ({
        id: c._id,
        account: c.accountNo,
        name: c.custName,
        remaining: c.remainingAmount,
        totalPaid: c.totalPaid,
        monthlyInstallment: c.monthlyInstallment,
        witness: {
  name: c.witness?.name,
  phone: c.witness?.phone,
  cnic: c.witness?.cnic,
  address: c.witness?.address
}

      }));

      populateTable(customers);
    }
  } catch (err) {
    console.error("Failed to fetch customers:", err);
  }
}


function populateTable(list) {
  tableBody.innerHTML = "";

  if (!list.length) {
    document.getElementById("noResults").style.display = "block";
    return;
  } else {
    document.getElementById("noResults").style.display = "none";
  }

  list.forEach(c => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${c.account}</td>
      <td>${c.name}</td>
      <td>${c.remaining}</td>
      <td>${c.monthlyInstallment}</td>
      <td><button class="btn-witness">View</button></td>
    `;

    tr.addEventListener("click", () => {
      acctInput.value = c.account;
      nameInput.value = c.name;
      remainingInput.value = c.remaining;
      installmentInput.value = "";
      installmentInput.setAttribute(
        "placeholder",
        `Min: ${c.monthlyInstallment}`
      );
      accountError.textContent = "";
      installmentError.textContent = "";
      successMsg.style.display = "none";
    });

    tr.querySelector(".btn-witness").addEventListener("click", e => {
      e.stopPropagation(); 

      document.getElementById("wName").textContent = c.witness.name || "-";
      document.getElementById("wPhone").textContent = c.witness.phone || "-";
      document.getElementById("wCNIC").textContent = c.witness.cnic || "-";
      document.getElementById("wAddress").textContent = c.witness.address || "-";

      modal.style.display = "flex";
    });

    tableBody.appendChild(tr);
  });
}


searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(query)
  );
  populateTable(filtered);
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  populateTable(customers);
});


acctInput.addEventListener("input", () => {
  const val = acctInput.value.trim();
  accountError.textContent = "";
  successMsg.style.display = "none";

  if (!val) {
    nameInput.value = "";
    remainingInput.value = "";
    installmentInput.value = "";
    return;
  }

  const c = customers.find(x => x.account === val);
  if (c) {
    nameInput.value = c.name;
    remainingInput.value = c.remaining;
    installmentInput.value = "";
    installmentInput.setAttribute(
      "placeholder",
      `Min: ${c.monthlyInstallment}`
    );
  } else {
    nameInput.value = "";
    remainingInput.value = "";
    installmentInput.value = "";
    accountError.textContent = "No customer found with this account number.";
  }
});


document
  .getElementById("installmentForm")
  .addEventListener("submit", async e => {
    e.preventDefault();

    const acct = acctInput.value.trim();
    const instAmount = Number(installmentInput.value);

    if (!acct) {
      accountError.textContent = "Please enter account number.";
      return;
    }

    const customer = customers.find(c => c.account === acct);
    if (!customer) {
      accountError.textContent = "Account not found.";
      return;
    }

    if (!instAmount || instAmount <= 0) {
      installmentError.textContent = "Enter valid installment amount.";
      return;
    }

    if (instAmount < customer.monthlyInstallment) {
      installmentError.textContent = `Minimum PKR ${customer.monthlyInstallment}`;
      return;
    }

    if (instAmount > customer.remaining) {
      installmentError.textContent = "Cannot exceed remaining amount.";
      return;
    }

    try {
      const res = await apiPut(`/customers/${customer.id}`, {
        paidAmount: instAmount
      });

      if (res.success) {
  await loadCustomers();

  const updatedCustomer = customers.find(
    c => c.account === customer.account
  );

  if (updatedCustomer) {
    remainingInput.value = updatedCustomer.remaining;
    installmentInput.setAttribute(
      "placeholder",
      `Min: ${updatedCustomer.monthlyInstallment}`
    );
  }

  successMsg.style.display = "block";
  successMsg.textContent = `PKR ${instAmount} received from ${customer.name}`;
  installmentInput.value = "";
}

    } catch (err) {
      console.error(err);
      alert("Error saving installment");
    }
  });


if (closeBtn) {
  closeBtn.onclick = () => (modal.style.display = "none");
}

loadCustomers();
