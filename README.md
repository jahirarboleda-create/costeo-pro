
# 🥟 CosteoPro Suite - Calculadora & Inteligencia de Recetas

**CosteoPro** es una aplicación web moderna y responsiva diseñada para restaurantes, negocios de comida y emprendedores gastronómicos. Facilita el cálculo preciso del precio de costo unitario, márgenes de ganancia, punto de equilibrio y sugerencia del precio de venta público (PVP) a partir de fichas técnicas de recetas.

---

## 🌟 Características Principales

- **Carga Inteligente de Documentos:** Motor de extracción que lee y analiza archivos subidos desde tu equipo (**PDF, Excel `.xlsx`, Word `.docx` y TXT**) reconociendo automáticamente ingredientes, cantidades, salarios, renta, luz y costo de aceite.
- **Prorrateo de Fritura y Aceite:** Método especializado para calcular el costo real del desgaste de aceite por unidad frita.
- **Mano de Obra Directa (MOD) y Costos Fijos (CIF):** Incorporación de sueldos, alquiler, electricidad y servicios prorrateados mensualmente.
- **Estrategias de Precios:** Elección entre *Margen sobre Ventas* o *Recargo sobre Costo* con porcentaje objetivo personalizable.
- **Análisis Gráfico:** Visualización dinámica en gráfico de torta (Doughnut Chart) de la distribución de costos unitarios.
- **Diseño Adaptativo (PWA Ready):** Optimizado para uso en computadoras de escritorio (Windows/Mac) y dispositivos móviles (Android/iOS).

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Estructura semántica del cliente.
- **CSS3 / Tailwind CSS (v3):** Estilizado responsivo, moderno y adaptable a pantallas táctiles.
- **JavaScript (ES6+):** Lógica financiera, procesamiento asíncrono y manipulación dinámica del DOM.
- **[Chart.js](https://www.chartjs.org/):** Renderizado de gráficos interactivos de distribución de costos.
- **[PDF.js](https://mozilla.github.io/pdf.js/):** Extracción e interpretación de texto plano desde documentos PDF en el navegador.
- **[SheetJS (XLSX)](https://sheetjs.com/):** Procesamiento y lectura de hojas de cálculo de Microsoft Excel.
- **[Mammoth.js](https://m242.github.io/mammoth.js/):** Convertidor y extractor de texto plano para documentos `.docx` de Microsoft Word.
- **FontAwesome 6:** Iconografía vectorial interactiva.

---

## 🚀 Instalación y Uso Local

1. Clona este repositorio en tu equipo:
   ```bash
   git clone git@github.com:jahirarboleda-create/costeo-pro.git
