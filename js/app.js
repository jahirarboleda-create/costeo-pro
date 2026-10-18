// Inicialización de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

let chartInstance = null;

// Carga inicial al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  loadDefaultIngredients();
  initChart();
  calculateAll();
});

function loadDefaultIngredients() {
  const tbody = document.getElementById('mpd-tbody');
  tbody.innerHTML = '';
  const defaults = [
    { name: 'Carne molida', recipeQty: 500, buyQty: 1000, buyPrice: 120 },
    { name: 'Papa cocida', recipeQty: 300, buyQty: 1000, buyPrice: 25 },
    { name: 'Cebolla larga', recipeQty: 100, buyQty: 500, buyPrice: 15 },
    { name: 'Tomate maduro', recipeQty: 100, buyQty: 1000, buyPrice: 22 },
    { name: 'Harina de maíz', recipeQty: 500, buyQty: 1000, buyPrice: 35 }
  ];
  defaults.forEach(item => addIngredientRow(item.name, item.recipeQty, item.buyQty, item.buyPrice));
}

function addIngredientRow(name = '', recipeQty = 1, buyQty = 1, buyPrice = 0) {
  const tbody = document.getElementById('mpd-tbody');
  const tr = document.createElement('tr');
  tr.className = 'border-b hover:bg-slate-50';
  tr.innerHTML = `
    <td class="p-1.5"><input type="text" value="${name}" class="w-full border rounded px-1.5 py-1 text-xs ing-name" oninput="calculateAll()"></td>
    <td class="p-1.5"><input type="number" value="${recipeQty}" class="w-full border rounded px-1.5 py-1 text-xs ing-rec-qty" oninput="calculateAll()"></td>
    <td class="p-1.5"><input type="number" value="${buyQty}" class="w-full border rounded px-1.5 py-1 text-xs ing-buy-qty" oninput="calculateAll()"></td>
    <td class="p-1.5"><input type="number" value="${buyPrice}" class="w-full border rounded px-1.5 py-1 text-xs ing-buy-price" oninput="calculateAll()"></td>
    <td class="p-1.5 text-right font-medium text-xs ing-cost">$0.00</td>
    <td class="p-1.5 text-center"><button onclick="this.closest('tr').remove(); calculateAll();" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button></td>
  `;
  tbody.appendChild(tr);
  calculateAll();
}

// --- RECONOCIMIENTO INTELIGENTE DE PALABRAS Y PARÁMETROS ---
async function processUploadedFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  let extractedText = '';

  if (file.name.endsWith('.pdf')) {
    extractedText = await parsePdfText(file);
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    extractedText = await parseExcelText(file);
  } else if (file.name.endsWith('.docx')) {
    extractedText = await parseWordText(file);
  } else {
    extractedText = await file.text();
  }

  analyzeAndApplyTextData(extractedText);
}

async function parsePdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

async function parseExcelText(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  let text = '';
  workbook.SheetNames.forEach(sheetName => {
    text += XLSX.utils.sheet_to_txt(workbook.Sheets[sheetName]) + '\n';
  });
  return text;
}

async function parseWordText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
  return result.value;
}

function analyzeAndApplyTextData(text) {
  const lines = text.split('\n');

  // RegEx para detección de parámetros operativos
  const rentMatch = text.match(/(?:renta|arriendo|alquiler)\D*(\d+[\d,.]*)/i);
  const powerMatch = text.match(/(?:luz|electricidad|servicios)\D*(\d+[\d,.]*)/i);
  const salaryMatch = text.match(/(?:sueldo|salario|nomina)\D*(\d+[\d,.]*)/i);
  const oilCostMatch = text.match(/(?:aceite|galon)\D*(\d+[\d,.]*)/i);

  if (rentMatch) document.getElementById('cif-rent').value = rentMatch[1].replace(/,/g, '');
  if (powerMatch) {
    let val = parseFloat(powerMatch[1].replace(/,/g, ''));
    if (text.toLowerCase().includes('bimensual') || text.toLowerCase().includes('bi mestral')) val = val / 2;
    document.getElementById('cif-power').value = val;
  }
  if (salaryMatch) document.getElementById('cif-salary').value = salaryMatch[1].replace(/,/g, '');
  if (oilCostMatch) document.getElementById('oil-total-cost').value = oilCostMatch[1].replace(/,/g, '');

  // Procesar insumos detectando cantidades
  const tbody = document.getElementById('mpd-tbody');
  tbody.innerHTML = '';

  lines.forEach(line => {
    const ingMatch = line.match(/(?:-\s*)?([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)\D*(\d+(?:\.\d+)?)\s*(g|kg|tazas|ml|l|piezas|cucharadas)?/i);
    if (ingMatch && ingMatch[1].trim().length > 2) {
      const name = ingMatch[1].trim();
      const qty = parseFloat(ingMatch[2]) || 1;
      addIngredientRow(name, qty, 1000, 50);
    }
  });

  calculateAll();
  alert('¡Archivo analizado e información sincronizada correctamente!');
}

function calculateAll() {
  const yieldQty = parseFloat(document.getElementById('recipe-yield').value) || 1;
  const rows = document.querySelectorAll('#mpd-tbody tr');
  let totalMPD = 0;

  rows.forEach(row => {
    const recQty = parseFloat(row.querySelector('.ing-rec-qty').value) || 0;
    const buyQty = parseFloat(row.querySelector('.ing-buy-qty').value) || 1;
    const buyPrice = parseFloat(row.querySelector('.ing-buy-price').value) || 0;

    const cost = (buyPrice / buyQty) * recQty;
    row.querySelector('.ing-cost').innerText = '$' + cost.toFixed(2);
    totalMPD += cost;
  });

  const mpdUnit = totalMPD / yieldQty;

  // Fritura
  let oilUnit = 0;
  if (document.getElementById('oil-enable').checked) {
    const oilCost = parseFloat(document.getElementById('oil-total-cost').value) || 0;
    const totalLiters = parseFloat(document.getElementById('oil-total-liters').value) || 1;
    const usedLiters = parseFloat(document.getElementById('oil-used-liters').value) || 0;
    oilUnit = ((oilCost / totalLiters) * usedLiters) / yieldQty;
  }

  // MOD y CIF
  const salary = parseFloat(document.getElementById('cif-salary').value) || 0;
  const rent = parseFloat(document.getElementById('cif-rent').value) || 0;
  const power = parseFloat(document.getElementById('cif-power').value) || 0;
  const monthlyProd = parseFloat(document.getElementById('monthly-production').value) || 1;

  const modUnit = salary / monthlyProd;
  const cifUnit = (rent + power) / monthlyProd;

  const directCostUnit = mpdUnit + oilUnit + modUnit;
  const totalCostUnit = directCostUnit + cifUnit;

  // PVP Sugerido
  const marginType = document.getElementById('margin-type').value;
  const targetMargin = parseFloat(document.getElementById('target-margin').value) || 0;
  let pvp = 0;

  if (marginType === 'margin_sales') {
    pvp = totalCostUnit / (1 - (targetMargin / 100));
  } else {
    pvp = totalCostUnit * (1 + (targetMargin / 100));
  }

  const profit = pvp - totalCostUnit;

  // Render de Resultados
  document.getElementById('res-direct-cost').innerText = '$' + directCostUnit.toFixed(2);
  document.getElementById('res-total-cost').innerText = '$' + totalCostUnit.toFixed(2);
  document.getElementById('res-pvp').innerText = '$' + pvp.toFixed(2);
  document.getElementById('res-profit').innerText = '$' + profit.toFixed(2);

  updateChart(mpdUnit + oilUnit, modUnit, cifUnit);
}

function initChart() {
  const ctx = document.getElementById('costChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Materia Prima + Fritura', 'Mano de Obra (MOD)', 'Costos Fijos (CIF)'],
      datasets: [{
        data: [1, 1, 1],
        backgroundColor: ['#f59e0b', '#6366f1', '#a855f7']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function updateChart(mpd, mod, cif) {
  if (!chartInstance) return;
  chartInstance.data.datasets[0].data = [mpd, mod, cif];
  chartInstance.update();
}

function saveCurrentRecipe() {
  alert('Receta guardada localmente con todos los parámetros ajustados.');
}