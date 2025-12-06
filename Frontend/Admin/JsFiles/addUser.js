import { BASE_URL, apiPost, apiPut } from "../../js/api.js";

const token = localStorage.getItem("token");
if (!token) {
  alert("You must login as admin!");
  window.location.href = "../login.html";
}

const addUserForm = document.getElementById("addUserForm");
const promoteUserForm = document.getElementById("promoteUserForm");
const existingUserSelect = document.getElementById("existingUser");
const addError = document.getElementById("addError");
const promoteError = document.getElementById("promoteError");

async function loadUsers() {
  try {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to fetch users:", text);
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    existingUserSelect.innerHTML = '<option value="">-- Select User --</option>';
    data.forEach(user => {
      existingUserSelect.innerHTML += `<option value="${user._id}">${user.email} (${user.role})</option>`;
    });

  } catch (err) {
    console.error("Error loading users:", err);
    promoteError.textContent = "Failed to load users. Check console.";
  }
}

addUserForm.addEventListener("submit", async e => {
  e.preventDefault();
  addError.textContent = "";

  const userData = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    city: document.getElementById("city").value.trim(),
    address: document.getElementById("address").value.trim(),
    password: document.getElementById("password").value.trim(),
    role: document.getElementById("role").value
  };

  if (!userData.role) return addError.textContent = "Please select a role";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) return addError.textContent = "Invalid email";
  if (!/^03\d{9}$/.test(userData.phone)) return addError.textContent = "Invalid phone number";
  if (userData.password.length < 4) return addError.textContent = "Password too short";

  try {
    const res = await apiPost("/auth/register", userData, token);
    if (res.message === "User registered successfully") {
      alert("User added successfully!");
      addUserForm.reset();
      loadUsers();
    } else {
      addError.textContent = res.message;
    }
  } catch (err) {
    console.error(err);
    addError.textContent = "Server error!";
  }
});

promoteUserForm.addEventListener("submit", async e => {
  e.preventDefault();
  promoteError.textContent = "";

  const userId = existingUserSelect.value;
  const newRole = document.getElementById("newRole").value;
  if (!userId || !newRole) return promoteError.textContent = "Select user and role";

  try {
    const res = await apiPut(`/users/${userId}`, { role: newRole }, token);
    if (res.message === "User updated") {
      alert("User role updated successfully!");
      promoteUserForm.reset();
      loadUsers();
    } else {
      promoteError.textContent = res.message;
    }
  } catch (err) {
    console.error(err);
    promoteError.textContent = "Server error!";
  }
});

document.addEventListener("DOMContentLoaded", loadUsers);
