import "../../js/sessionCheck.js";
import { BASE_URL, apiPost } from "../../js/api.js"; 
import "../../js/sessionCheck.js";
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
}

window.addEventListener("DOMContentLoaded", () => {

  const product = JSON.parse(localStorage.getItem("selectedProduct"));
  if (product) {
    document.getElementById("productName").value = product.name || "";
    document.getElementById("productModel").value = product.model || "";
    document.getElementById("productPrice").value = product.price || "";
    document.getElementById("productSpecs").value = product.specs || "";
  }

  const requestForm = document.getElementById("requestForm");
  const thankYouMessage = document.getElementById("thankYouMessage");

  if (requestForm && thankYouMessage) {

    requestForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const requestData = {
        custName: document.getElementById("custName").value,
        phone: document.getElementById("custPhone").value,
        cnic: document.getElementById("custCNIC").value,
        address: document.getElementById("custAddress").value,

        productId: product.id,
        productName: document.getElementById("productName").value,
        productModel: document.getElementById("productModel").value,
        productPrice: document.getElementById("productPrice").value,
        productSpecs: document.getElementById("productSpecs").value,
      };

      try {
        const response = await apiPost("/requests", requestData);

        console.log("Request submitted successfully:", response);
        requestForm.style.display = "none";
        thankYouMessage.style.display = "block";

        localStorage.removeItem("selectedProduct");

      } catch (error) {
        console.error("Failed to submit request:", error);
        alert("Failed to submit your request. Please try again later.");
      }
    });
  }
});

window.toggleMenu = toggleMenu;
