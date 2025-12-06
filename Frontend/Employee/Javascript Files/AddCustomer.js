import { apiGet, apiPost } from "../../js/api.js";

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("show");
}
window.toggleMenu = toggleMenu;

const nameRegex = /^[A-Za-z ]+$/;
const phoneRegex = /^[0-9]{11}$/;
const cnicRegex = /^[0-9]{13}$/;

const searchInput = document.getElementById("searchCustomer");
const searchError = document.getElementById("searchError");
const dropdown = document.getElementById("productName");


searchInput.addEventListener("change", async () => {
  const value = searchInput.value.trim();
  if (!value) return;

  try {
    const res = await apiGet(`/requests/customer/${value}`);
console.log("Customer API Response: ", res);

if (!res?.success || !res?.data) {
  searchError.textContent = "Customer not found!";
  return;
}

const customer = res.data;

searchError.textContent = "";

document.getElementById("accountNo").value = customer.accountNo || "";
document.getElementById("custName").value = customer.custName || "";
document.getElementById("custPhone").value = customer.phone || "";
document.getElementById("custCNIC").value = customer.cnic || "";
document.getElementById("custAddress").value = customer.address || "";

dropdown.innerHTML = `<option value="">Select a Product</option>`;
if (customer.products?.length > 0) {
  customer.products.forEach((p) => {
    const option = document.createElement("option");
    option.value = p._id;
    option.textContent = `${p.productName} (${p.productModel})`;
    dropdown.appendChild(option);
  });
}
 else {
      console.warn("No products assigned to customer.");
    }

    document.getElementById("productPrice").value = "";
    document.getElementById("advancePayment").value = "";
    document.getElementById("monthlyInstallment").value = "";

  } catch (err) {
    console.error("Error fetching customer:", err);
    searchError.textContent = "Error fetching customer.";
  }
});

dropdown.addEventListener("change", async function () {
  const productId = this.value;
  const priceInput = document.getElementById("productPrice");

  if (!productId) {
    priceInput.value = "";
    document.getElementById("advancePayment").value = "";
    document.getElementById("monthlyInstallment").value = "";
    return;
  }

  try {
    const res = await apiGet(`/products/${productId}`);
    console.log("Product API raw response:", res);

    
    const product = res.data || res;

    if (!product) {
      console.error("Product not found");
      priceInput.value = "";
      return;
    }

    priceInput.value = product.price;
    document.getElementById("advancePayment").value = Math.round(product.price * 0.05);
    calculateMonthlyInstallment();

  } catch (err) {
    console.error("Error loading product:", err);
  }
});

function calculateMonthlyInstallment() {
  const price = Number(document.getElementById("productPrice").value);
  const advance = Number(document.getElementById("advancePayment").value);
  const monthlyInput = document.getElementById("monthlyInstallment");
  const error = document.getElementById("advancePaymentError");

  if (!price) return;

  if (advance > price) {
    error.textContent = "Advance cannot be greater than product price!";
    monthlyInput.value = "";
    return;
  }

  error.textContent = "";
  monthlyInput.value = Math.round((price - advance) / 12);
}

document.getElementById("advancePayment").addEventListener("input", calculateMonthlyInstallment);


document.getElementById("saleForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  let isValid = true;
  document.querySelectorAll(".error").forEach(el => (el.textContent = ""));

  const requiredFields = [
    "custName", "custPhone", "custCNIC", "custAddress",
    "productName", "productPrice", "advancePayment",
    "monthlyInstallment", "witnessName", "witnessPhone",
    "witnessCNIC", "witnessAddress"
  ];

  requiredFields.forEach(id => {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(id + "Error");
    if (!input.value.trim()) {
      errorEl.textContent = "This field is required";
      isValid = false;
    }
  });

  const validations = [
    { id: "custName", regex: nameRegex, msg: "Only letters allowed." },
    { id: "custPhone", regex: phoneRegex, msg: "Phone must be 11 digits." },
    { id: "custCNIC", regex: cnicRegex, msg: "CNIC must be 13 digits." },
    { id: "witnessName", regex: nameRegex, msg: "Only letters allowed." },
    { id: "witnessPhone", regex: phoneRegex, msg: "Phone must be 11 digits." },
    { id: "witnessCNIC", regex: cnicRegex, msg: "CNIC must be 13 digits." }
  ];

  validations.forEach(v => {
    const input = document.getElementById(v.id);
    const errorEl = document.getElementById(v.id + "Error");
    if (input.value && !v.regex.test(input.value)) {
      errorEl.textContent = v.msg;
      isValid = false;
    }
  });

  if (!isValid) return;

  const payload = {
    accountNo: document.getElementById("accountNo").value,
    custName: custName.value,
    custPhone: custPhone.value,
    custCNIC: custCNIC.value,
    custAddress: custAddress.value,
    productId: dropdown.value,
    productPrice: Number(productPrice.value),
    advancePayment: Number(advancePayment.value),
    monthlyInstallment: Number(monthlyInstallment.value),
    witnessName: witnessName.value,
    witnessPhone: witnessPhone.value,
    witnessCNIC: witnessCNIC.value,
    witnessAddress: witnessAddress.value
  };

  try {
    const res = await apiPost("/customers/add", payload);

    if (res.success) {
      accountNo.value = res.data.accountNo;
      alert("Customer Added Successfully! Account No: " + res.data.accountNo);
      saleForm.reset();
      dropdown.innerHTML = `<option value="">Select a Product</option>`;
    } else {
      alert("Error: " + res.message);
    }

  } catch (err) {
    console.error(err);
    alert("Error submitting customer.");
  }
});
