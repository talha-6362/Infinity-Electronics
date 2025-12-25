import { BASE_URL, apiPut } from "../../js/api.js";
import "../../js/sessionCheck.js";
const token = localStorage.getItem("token");

if (!token) {
  alert("Unauthorized access!");
  window.location.href = "../../login.html";
}

const orderTableBody = document.getElementById("orderTableBody");
let orderChart, priceChart;

async function loadOrders() {
  try {
    const res = await fetch(`${BASE_URL}/requests/all`, {
      headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to fetch requests:", text);
      throw new Error(`HTTP ${res.status}`);
    }

    const { data: requests } = await res.json(); 
    renderTable(requests);
    renderCharts(requests);

  } catch (err) {
    console.error("Error loading requests:", err);
    orderTableBody.innerHTML = `<tr><td colspan="7">Failed to load requests. Check console.</td></tr>`;
  }
}

function renderTable(requests) {
  orderTableBody.innerHTML = "";
  requests.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order._id}</td>
      <td>${order.customerName}</td>
      <td>${order.productName}</td>
      <td>${order.productModel}</td>
      <td>${parseInt(order.productPrice).toLocaleString()} PKR</td>
      <td><span class="status ${order.status}">${order.status}</span></td>
      <td>
        <button class="action-btn approve" onclick="updateStatus('${order._id}', 'approved')">Approve</button>
        <button class="action-btn reject" onclick="updateStatus('${order._id}', 'rejected')">Reject</button>
        <button class="action-btn pending" onclick="updateStatus('${order._id}', 'pending')">Pending</button>
      </td>
    `;
    orderTableBody.appendChild(row);
  });
}

window.updateStatus = async (orderId, newStatus) => {
  try {
    const res = await apiPut(`/requests/status/${orderId}`, { status: newStatus }, token);
    if (res.success) {
      loadOrders();
    } else {
      alert(res.message || "Failed to update status");
    }
  } catch (err) {
    console.error(err);
    alert("Server error!");
  }
};

function renderCharts(requests) {
  const statusLabels = ["pending", "approved", "rejected"];
  const statusColors = ["#ffd600", "#4caf50", "#f44336"];

  const statusCount = statusLabels.map(
    label => requests.filter(o => o.status === label).length
  );

  const statusPrice = statusLabels.map(
    label => requests
      .filter(o => o.status === label)
      .reduce((sum, o) => sum + parseInt(o.productPrice), 0)
  );

  if (orderChart) orderChart.destroy();
  if (priceChart) priceChart.destroy();

  const ctx1 = document.getElementById("orderChart").getContext("2d");
  const ctx2 = document.getElementById("priceChart").getContext("2d");

  orderChart = new Chart(ctx1, {
    type: "pie",
    data: { labels: statusLabels, datasets: [{ data: statusCount, backgroundColor: statusColors }] },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } }
  });

  priceChart = new Chart(ctx2, {
    type: "pie",
    data: { labels: statusLabels, datasets: [{ data: statusPrice, backgroundColor: statusColors }] },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } }
  });
}

document.addEventListener("DOMContentLoaded", loadOrders);
