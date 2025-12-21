import "../../js/sessionCheck.js";
let API_DATA = {};
let amountChart, countChart;

async function init() {
  const customers = await loadInstallments();
  API_DATA = groupByMonth(customers);
  loadMonthOptions();
  filterByMonth();
}

async function loadInstallments() {
  const res = await fetch("http://localhost:5000/api/customers/installments/summary");
  const json = await res.json();
  return json.data;
}

function groupByMonth(data) {
  const result = {};

  data.forEach(c => {
    const month = new Date(c.createdAt).toLocaleString("en-US", {
      month: "short",
      year: "numeric"
    });

    if (!result[month]) result[month] = { paid: [], unpaid: [] };

    result[month].paid.push({
      name: c.name,
      product: c.product,
      amount: Number(c.paid) || 0,
      date: new Date(c.createdAt).toLocaleDateString()
    });

    if ((c.remaining || 0) > 0) {
      result[month].unpaid.push({
        name: c.name,
        product: c.product,
        amount: Number(c.remaining) || 0,
        phone: c.phone
      });
    }
  });

  return result;
}

function loadMonthOptions() {
  const monthSelect = document.getElementById("monthSelect");
  monthSelect.innerHTML = "";

  Object.keys(API_DATA).forEach(m => {
    monthSelect.innerHTML += `<option value="${m}">${m}</option>`;
  });
}

function filterByMonth() {
  const month = document.getElementById("monthSelect").value;
  const { paid, unpaid } = API_DATA[month];

  renderTables(paid, unpaid);
  showSummary(paid, unpaid);
  renderCharts(paid, unpaid);
}

function renderTables(paid, unpaid) {
  document.querySelector("#paidTable tbody").innerHTML =
    paid.map(i => `
      <tr>
        <td>${i.name}</td>
        <td>${i.product}</td>
        <td>${i.amount.toLocaleString()} PKR</td>
        <td>${i.date}</td>
      </tr>
    `).join("");

  document.querySelector("#unpaidTable tbody").innerHTML =
    unpaid.map(i => `
      <tr>
        <td>${i.name}</td>
        <td>${i.product}</td>
        <td>${i.amount.toLocaleString()} PKR</td>
        <td>${i.phone}</td>
      </tr>
    `).join("");
}

function showSummary(paid, unpaid) {
  const totalPaid = paid.reduce((a, b) => a + b.amount, 0);
  const totalUnpaid = unpaid.reduce((a, b) => a + b.amount, 0);

  document.getElementById("totalPaid").textContent = `${totalPaid.toLocaleString()} PKR`;
  document.getElementById("totalUnpaid").textContent = `${totalUnpaid.toLocaleString()} PKR`;
  document.getElementById("countPaid").textContent = paid.length;
  document.getElementById("countUnpaid").textContent = unpaid.length;
}

function renderCharts(paid, unpaid) {
  const amountCtx = document.getElementById("amountChart").getContext("2d");
  const countCtx = document.getElementById("countChart").getContext("2d");

  const totalPaid = paid.reduce((a, b) => a + b.amount, 0);
  const totalUnpaid = unpaid.reduce((a, b) => a + b.amount, 0);

  if (amountChart) amountChart.destroy();
  if (countChart) countChart.destroy();

  amountChart = new Chart(amountCtx, {
    type: "bar",
    data: {
      labels: ["Paid", "Unpaid"],
      datasets: [{
        label: "Amount (PKR)",
        data: [totalPaid, totalUnpaid],
        backgroundColor: ["#0073e6", "#ff4d4d"]
      }]
    }
  });

  countChart = new Chart(countCtx, {
    type: "bar",
    data: {
      labels: ["Paid Installments", "Unpaid Installments"],
      datasets: [{
        label: "Count",
        data: [paid.length, unpaid.length],
        backgroundColor: ["#0073e6", "#ff4d4d"]
      }]
    }
  });
}

document.querySelector(".menu-toggle").addEventListener("click", () => {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
});


init();
