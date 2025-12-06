function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("show");
}

const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("keyup", (e) => {
    const term = e.target.value.toLowerCase();
    const productCards = document.querySelectorAll(".product-card, .card");

    productCards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(term) ? "block" : "none";
    });
  });
}
