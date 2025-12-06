import { apiGet, apiPut } from "../../js/api.js";

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
}
window.toggleMenu = toggleMenu;

const nameRegex = /^[A-Za-z ]+$/;
const phoneRegex = /^[0-9]{11}$/;
const cnicRegex = /^[0-9]{13}$/;
const accountRegex = /^[0-9]+$/;

document.getElementById("searchBtn").addEventListener("click", async function () {
  const accInput = document.getElementById("searchAccount").value.trim();
  const error = document.getElementById("searchError");
  const form = document.getElementById("updateForm");

  error.textContent = "";
  form.style.display = "none";

  if (!accountRegex.test(accInput)) {
    error.textContent = "Please enter a valid numeric account number.";
    return;
  }

  try {
    const res = await apiGet(`/customers/account/${accInput}`);

    if (!res.success) {
      error.textContent = res.message;
      return;
    }

    const customer = res.data;
    form.style.display = "block";
    form.dataset.id = customer._id; 

    document.getElementById("custName").value = customer.custName;
    document.getElementById("custPhone").value = customer.custPhone;
    document.getElementById("custCNIC").value = customer.custCNIC;
    document.getElementById("custItem").value = customer.productId?.name || "";

  } catch (err) {
    console.error(err);
    error.textContent = "Error fetching customer.";
  }
});

document.getElementById("updateForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  let isValid = true;
  document.querySelectorAll(".error").forEach(e => (e.textContent = ""));

  const fields = [
    { id: "custName", regex: nameRegex, msg: "Only letters allowed." },
    { id: "custPhone", regex: phoneRegex, msg: "Phone number must be 11 digits." },
    { id: "custCNIC", regex: cnicRegex, msg: "CNIC must be 13 digits." }
  ];

  for (let field of fields) {
    const input = document.getElementById(field.id);
    const errorEl = document.getElementById(field.id + "Error");

    if (!field.regex.test(input.value.trim())) {
      errorEl.textContent = field.msg;
      isValid = false;
    }
  }

  if (!isValid) return;

  const id = this.dataset.id;

  const payload = {
    custName: document.getElementById("custName").value,
    custPhone: document.getElementById("custPhone").value,
    custCNIC: document.getElementById("custCNIC").value,
  };

  try {
    const res = await apiPut(`/customers/update/${id}`, payload);

    if (res.success) {
      alert("Customer updated successfully!");
      this.reset();
      this.style.display = "none";
    } else {
      alert("Error: " + res.message);
    }

  } catch (err) {
    console.error(err);
    alert("Failed to update customer.");
  }
});
