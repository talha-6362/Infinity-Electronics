const checkSession = () => {
  const sessionExpiry = localStorage.getItem("sessionExpiry");
  if (!sessionExpiry) return;

  const timeLeft = sessionExpiry - Date.now();
  // console.log("⏳ Time left (ms):", timeLeft); 

  if (timeLeft <= 0) {
    alert(" Session expired! Redirecting to login.");
    localStorage.clear(); 
    window.location.href = "../login.html";
  }
};

setInterval(checkSession, 1000);
