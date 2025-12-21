import { apiGet, apiPut } from "../../js/api.js";
import "../../js/sessionCheck.js";
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
  const searchType = document.getElementById("searchType")?.value || "account";
  const inputValue = document.getElementById("searchAccount").value.trim();
  const error = document.getElementById("searchError");
  const form = document.getElementById("updateForm");

  error.textContent = "";
  form.style.display = "none";

  if (!inputValue) {
    error.textContent = "Please enter a value.";
    return;
  }

  if (searchType === "account" && !accountRegex.test(inputValue)) {
    error.textContent = "Enter a valid numeric account number.";
    return;
  }
  if (searchType === "cnic" && !cnicRegex.test(inputValue)) {
    error.textContent = "Enter a valid 13-digit CNIC.";
    return;
  }

  try {
    let res;
    if (searchType === "account") {
      res = await apiGet(`/customers/account/${inputValue}`);
      if (!res.success) { error.textContent = res.message; return; }
      populateForm(res.data);
    } else {
      res = await apiGet(`/customers/history/${inputValue}`);
      if (!res.success || res.data.length === 0) { error.textContent = "No record found"; return; }
      populateForm(res.data[0]); // Latest record
    }
  } catch (err) {
    console.error(err);
    error.textContent = "Error fetching customer.";
  }
});

function populateForm(customer) {
  const form = document.getElementById("updateForm");
  form.style.display = "block";
  form.dataset.id = customer._id;

  document.getElementById("custName").value = customer.custName;
  document.getElementById("custPhone").value = customer.custPhone;
  document.getElementById("custCNIC").value = customer.custCNIC;
  document.getElementById("custItem").value = customer.productName || "";

  if (!document.getElementById("witnessSection")) {
    const div = document.createElement("div");
    div.id = "witnessSection";
    div.innerHTML = `
      <h3>Witness Details</h3>
      <div class="form-group"><label>Name</label><input type="text" id="wName"></div>
      <div class="form-group"><label>Phone</label><input type="text" id="wPhone"></div>
      <div class="form-group"><label>CNIC</label><input type="text" id="wCNIC"></div>
      <div class="form-group"><label>Address</label><input type="text" id="wAddress"></div>
    `;
    form.insertBefore(div, form.querySelector(".btn-center"));
  }

  document.getElementById("wName").value = customer.witness?.name || "";
  document.getElementById("wPhone").value = customer.witness?.phone || "";
  document.getElementById("wCNIC").value = customer.witness?.cnic || "";
  document.getElementById("wAddress").value = customer.witness?.address || "";
}

document.getElementById("updateForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  let isValid = true;
  document.querySelectorAll(".error").forEach(el => el.textContent = "");

  const fields = [
    { id: "custName", regex: nameRegex, msg: "Only letters allowed." },
    { id: "custPhone", regex: phoneRegex, msg: "Phone must be 11 digits." },
    { id: "custCNIC", regex: cnicRegex, msg: "CNIC must be 13 digits." }
  ];

  for (let f of fields) {
    const input = document.getElementById(f.id);
    const errorEl = document.getElementById(f.id + "Error");
    if (!f.regex.test(input.value.trim())) { errorEl.textContent = f.msg; isValid=false; }
  }
  if (!isValid) return;

  const id = this.dataset.id;
  const payload = {
    custName: document.getElementById("custName").value,
    custPhone: document.getElementById("custPhone").value,
    custCNIC: document.getElementById("custCNIC").value,
    witnessName: document.getElementById("wName").value,
    witnessPhone: document.getElementById("wPhone").value,
    witnessCNIC: document.getElementById("wCNIC").value,
    witnessAddress: document.getElementById("wAddress").value
  };

  try {
    const res = await apiPut(`/customers/update/${id}`, payload);
    if (res.success) {
      alert("Customer and Witness updated successfully!");
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
