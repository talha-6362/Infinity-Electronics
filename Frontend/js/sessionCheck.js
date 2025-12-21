
export const checkSession = () => {
  const sessionExpiry = Number(localStorage.getItem("sessionExpiry"));
  if (!sessionExpiry) return; 

  const timeLeft = sessionExpiry - Date.now();
  // console.log(`Session time left: ${timeLeft} ms`);

  if (timeLeft <= 0) {
    alert("Session expired! Redirecting to login.");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("sessionExpiry");
    window.location.href = "../login.html"; 
  }
};

setInterval(checkSession, 1000);
