
import { apiGet, apiPut } from "../../js/api.js";

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
}
window.toggleMenu = toggleMenu;

const tableBody = document.querySelector('#customerTable tbody');
const searchInput = document.getElementById('searchName');
const clearBtn = document.getElementById('clearSearch');

const acctInput = document.getElementById('accountNumber');
const nameInput = document.getElementById('customerName');
const remainingInput = document.getElementById('remainingAmount');
const installmentInput = document.getElementById('installmentAmount');

const accountError = document.getElementById('accountNumberError');
const installmentError = document.getElementById('installmentAmountError');
const successMsg = document.getElementById('successMsg');

let customers = [];

async function loadCustomers() {
  try {
    const res = await apiGet("/customers/all");
    console.log("Fetched customers:", res);

    if (res.success && Array.isArray(res.data)) {
      customers = res.data.map(c => ({
        id: c._id,
        account: c.accountNo,
        name: c.custName,
        remaining: Number(c.productPrice) - Number(c.advancePayment),
        monthlyInstallment: Math.round((Number(c.productPrice) - Number(c.advancePayment)) / 12)
      }));
      populateTable(customers);
    } else {
      console.warn("No customer data received.");
    }
  } catch (err) {
    console.error("Failed to fetch customers:", err);
  }
}

function populateTable(list) {
  tableBody.innerHTML = '';

  if (!list.length) {
    document.getElementById('noResults').style.display = 'block';
    return;
  } else {
    document.getElementById('noResults').style.display = 'none';
  }

  list.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.account}</td>
      <td>${c.name}</td>
      <td>${c.remaining}</td>
      <td>Min Installment: ${c.monthlyInstallment}</td>
    `;

    tr.addEventListener('click', () => {
      acctInput.value = c.account;
      nameInput.value = c.name;
      remainingInput.value = c.remaining;
      installmentInput.value = '';
      accountError.textContent = '';
      installmentError.textContent = '';
      successMsg.style.display = 'none';
      installmentInput.setAttribute('placeholder', `Min: ${c.monthlyInstallment}`);
    });

    tableBody.appendChild(tr);
  });
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = customers.filter(c => c.name.toLowerCase().includes(query));
  populateTable(filtered);
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  populateTable(customers);
  searchInput.focus();
});

acctInput.addEventListener('input', () => {
  accountError.textContent = '';
  successMsg.style.display = 'none';

  const val = acctInput.value.trim();
  if (!val) {
    nameInput.value = '';
    remainingInput.value = '';
    installmentInput.value = '';
    return;
  }

  const selectedCustomer = customers.find(c => c.account === val);
  if (selectedCustomer) {
    nameInput.value = selectedCustomer.name;
    remainingInput.value = selectedCustomer.remaining;
    installmentInput.value = '';
    installmentInput.setAttribute('placeholder', `Min: ${selectedCustomer.monthlyInstallment}`);
  } else {
    nameInput.value = '';
    remainingInput.value = '';
    installmentInput.value = '';
    if (val.length >= 2) {
      accountError.textContent = 'No customer found with this account number.';
    }
  }
});

document.getElementById('installmentForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  accountError.textContent = '';
  installmentError.textContent = '';
  successMsg.style.display = 'none';

  const acct = acctInput.value.trim();
  const inst = installmentInput.value.trim();

  if (!acct) {
    accountError.textContent = 'Please enter account number.';
    acctInput.focus();
    return;
  }

  const selectedCustomer = customers.find(c => c.account === acct);
  if (!selectedCustomer) {
    accountError.textContent = 'Account not found. Please choose from the list.';
    acctInput.focus();
    return;
  }

  const instAmount = Number(inst);
  if (!inst || isNaN(instAmount) || instAmount <= 0) {
    installmentError.textContent = 'Enter a valid installment amount.';
    installmentInput.focus();
    return;
  }

  if (instAmount < selectedCustomer.monthlyInstallment) {
    installmentError.textContent = `Installment cannot be less than PKR ${selectedCustomer.monthlyInstallment}.`;
    installmentInput.focus();
    return;
  }

  if (instAmount > selectedCustomer.remaining) {
    installmentError.textContent = 'Installment cannot exceed remaining amount!';
    installmentInput.focus();
    return;
  }

  const newRemaining = Math.max(0, selectedCustomer.remaining - instAmount);

  try {
    const res = await apiPut(`/customers/${selectedCustomer.id}`, {
      remainingAmount: newRemaining
    });

    if (res.code === 11000) {
      accountError.textContent = "Duplicate Error: This account number already exists!";
      return;
    }

    if (res.success) {
      selectedCustomer.remaining = newRemaining;
      remainingInput.value = newRemaining;
      populateTable(customers);

      successMsg.style.display = 'block';
      successMsg.textContent = `Saved: PKR ${instAmount} received for ${selectedCustomer.name}. Remaining: PKR ${newRemaining}.`;

      installmentInput.value = '';
    } else {
      alert("Error updating customer: " + res.message);
    }
  } catch (err) {
    console.error("Failed to update customer:", err);
    alert("Error updating customer.");
  }
});

loadCustomers();
