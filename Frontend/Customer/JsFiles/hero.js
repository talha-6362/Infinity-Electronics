const hero = document.getElementById("hero");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const images = [
  "JsFiles/Image/abouthead.jpg",
  "JsFiles/Image/hero2.avif",
  "JsFiles/Image/electronics.jpg",
];

let index = 0;
let autoSlide; 

function updateBackground() {
  hero.style.backgroundImage = `url('${images[index]}')`;
}

nextBtn.addEventListener("click", () => {
  index = (index + 1) % images.length;
  updateBackground();
  resetAutoSlide(); 
});

prevBtn.addEventListener("click", () => {
  index = (index - 1 + images.length) % images.length;
  updateBackground();
  resetAutoSlide();
});

function startAutoSlide() {
  autoSlide = setInterval(() => {
    index = (index + 1) % images.length;
    updateBackground();
  }, 5000);
}

function resetAutoSlide() {
  clearInterval(autoSlide);
  startAutoSlide();
}

startAutoSlide();
updateBackground();

