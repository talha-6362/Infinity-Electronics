function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
}


document.getElementById("addItemForm").addEventListener("submit", function(event) {
  event.preventDefault();
  
  const name = document.getElementById("itemName").value.trim();
  const image = document.getElementById("itemImage").value.trim();
  const warranty = document.getElementById("itemWarranty").value.trim();
  const units = document.getElementById("itemUnits").value.trim();
  const price = document.getElementById("itemPrice").value.trim();
  const desc = document.getElementById("itemDescription").value.trim();

  const nameError = document.getElementById("nameError");
  const imageError = document.getElementById("imageError");
  const warrantyError = document.getElementById("warrantyError");
  const unitsError = document.getElementById("unitsError");
  const priceError = document.getElementById("priceError");
  const descError = document.getElementById("descError");

  nameError.textContent = imageError.textContent = warrantyError.textContent =
  unitsError.textContent = priceError.textContent = descError.textContent = "";

  let isValid = true;

  if (name === "") {
    nameError.textContent = "Product name is required.";
    isValid = false;
  }
  if (image === "") {
    imageError.textContent = "Image URL is required.";
    isValid = false;
  }
  if (warranty === "") {
    warrantyError.textContent = "Warranty period is required.";
    isValid = false;
  }
  if (units === "" || isNaN(units) || units <= 0) {
    unitsError.textContent = "Enter a valid number of units.";
    isValid = false;
  }
  if (price === "" || isNaN(price) || price <= 0) {
    priceError.textContent = "Enter a valid price in numbers.";
    isValid = false;
  }
  if (desc === "") {
    descError.textContent = "Description cannot be empty.";
    isValid = false;
  }

  if (isValid) {
    alert("Item added successfully to inventory!");
    document.getElementById("addItemForm").reset();
  }
});
