let weeklyChartInstance = null;
let monthlyChartInstance = null;

const API_BASE =  "http://localhost:5000/api/finance";


function money(n) {
  return (n || 0).toLocaleString() + " PKR";
}

function renderTable(tableId, data) {
  console.log(` Table Data (${tableId}):`, data);
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center">No data</td></tr>`;
    return;
  }

  data.forEach(item => {
    tbody.innerHTML += `
      <tr>
<td>${item.product === "Unknown (N/A)" ? "---" : item.product}</td>
        <td>${item.units}</td>
        <td>${(item.total || 0).toLocaleString()} PKR</td>
      </tr>`;
  });
}


async function fetchWeekly() {
  const res = await fetch(`${API_BASE}/report/weekly`);
  const json = await res.json();
  console.log("🔍 Weekly API Response:", json);
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function fetchMonths() {
  const res = await fetch(`${API_BASE}/report/months`);
  const json = await res.json();
   console.log("🔍 Monthly API Response:", json);
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function fetchMonthly(month, year) {
  const q = year ? `?year=${year}` : "";
  const res = await fetch(`${API_BASE}/report/monthly/${month}${q}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}


function renderWeeklyChart(rows) {
  const ctx = document.getElementById("weeklyChart").getContext("2d");
  if (weeklyChartInstance) weeklyChartInstance.destroy();

  const labels = rows.map(r => r.product || "Unknown");
  const data = rows.map(r => r.total);

  weeklyChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: generateColors(labels.length)
      }]
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } }
  });
}

function renderMonthlyChart(rows) {
  const ctx = document.getElementById("monthlyChart").getContext("2d");
  if (monthlyChartInstance) monthlyChartInstance.destroy();

  const labels = rows.map(r => r.product || "Unknown");
  const data = rows.map(r => r.total);

  monthlyChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: generateColors(labels.length)
      }]
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } }
  });
}

function generateColors(n) {
  const base = [
    "#0073e6", "#009942", "#3C00FF", "#FC33FF",
    "#FF8C00", "#2E8B57", "#8A2BE2", "#DC143C"
  ];
  return Array.from({ length: n }, (_, i) => base[i % base.length]);
}


async function updateWeeklyUI() {
  try {
    const data = await fetchWeekly();
    const rows = data.rows || [];

    document.getElementById("totalWeekly").textContent = money(data.totalWeekly);
    renderTable("weeklySales", rows);
    renderWeeklyChart(rows);
  } catch (err) {
    console.error("Weekly load error:", err);
  }
}

async function populateMonthsDropdown() {
  try {
    const months = await fetchMonths();
    const select = document.getElementById("monthSelect");
    select.innerHTML = "";

    if (!months || months.length === 0) {
      const now = new Date();
      const label = now.toLocaleString("en-US", { month: "long", year: "numeric" });
      select.innerHTML = `<option value="${now.getMonth()+1}" data-year="${now.getFullYear()}">${label}</option>`;
      return;
    }

    months.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.month;
      opt.dataset.year = m.year;
      opt.textContent = m.label;
      select.appendChild(opt);
    });

    select.selectedIndex = 0;
  } catch (err) {
    console.error("Month load error:", err);
  }
}

async function updateMonthlyChart() {
  try {
    const select = document.getElementById("monthSelect");
    const month = select.value;
    const year = select.options[select.selectedIndex].dataset.year;

    const data = await fetchMonthly(month, year);
    const rows = data.rows || [];

    document.getElementById("totalMonthly").textContent = money(data.totalMonthly);
    document.getElementById("topItem").textContent =
      (data.topItem && data.topItem.product) ? data.topItem.product : "---";

    renderTable("monthlySales", rows);
    renderMonthlyChart(rows);
  } catch (err) {
    console.error("Monthly load error:", err);
  }
}

async function downloadReport() {
  const container = document.querySelector(".container");

  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);

    const imgW = pageWidth - 20;
    const imgH = (imgProps.height * imgW) / imgProps.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgW, imgH);
    pdf.save(`Finance_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  } catch (err) {
    console.error("PDF Error:", err);
    alert("PDF failed. See console.");
  }
}


async function init() {
  await populateMonthsDropdown();
  await updateWeeklyUI();
  await updateMonthlyChart();

  document.getElementById("monthSelect").addEventListener("change", updateMonthlyChart);

  window.addEventListener("resize", () => {
    weeklyChartInstance?.resize();
    monthlyChartInstance?.resize();
  });
}

init();

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
}
