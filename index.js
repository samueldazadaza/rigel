const url = 'https://apir2.onrender.com/'; //server lento

// Fetch data and display in HTML
async function fetchDataAndDisplay() {
  try {
    const response = await fetch(url);
    const datos = await response.json();
    mostrarDataTotal(datos);
  } catch (error) {
    console.log(error);
  }
}

const mostrarDataTotal = (datos) => {
  const datosGenerales = datos.data;
  console.log(datosGenerales);

  // Filter data
  const filterData = (data, systemName, ufCode) => data.filter(item => item.system_name === systemName && item.uf_code === ufCode);
  const datosItsZ63 = filterData(datosGenerales, 'IT-ITS', 'ZMO III');
  const datosItsZ67 = filterData(datosGenerales, 'IT-ITS', 'ZMO V');
  const datosSirciZ63 = filterData(datosGenerales, 'IT-SIRCI', 'ZMO III');
  const datosSirciZ67 = filterData(datosGenerales, 'IT-SIRCI', 'ZMO V');

  // Generate table rows
  const generateTableRows = (data) => data.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.system_name}</td>
      <td>${item.vehicle_code}</td>
      <td>${item.issue_description}</td>
      <td>${item.date_created}</td>
      <td>${item.days_off}</td>
      <td>${item.is_inmovilized_vehicle}</td>
      <td>${item.current_status}</td>
    </tr>
  `).join('');

  const bodyitsZ63 = generateTableRows(datosItsZ63);
  const bodyitsZ67 = generateTableRows(datosItsZ67);
  const bodysirciZ63 = generateTableRows(datosSirciZ63);
  const bodysirciZ67 = generateTableRows(datosSirciZ67);
  const bodytotal = generateTableRows(datosGenerales);

  // Generate summary data
  const inoperativosSuma = datosGenerales.reduce((acc, item) => {
    acc[item.system_name] = (acc[item.system_name] || 0) + 1;
    return acc;
  }, {});

  const bodysuma = Object.entries(inoperativosSuma).map(([key, value], index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${key}</td>
      <td>${value}</td>
    </tr>
  `).join('');

  // Update HTML
  const elements = [
    { id: "dataitsZ63", body: bodyitsZ63 },
    { id: "dataitsZ67", body: bodyitsZ67 },
    { id: "datasirciZ63", body: bodysirciZ63 },
    { id: "datasirciZ67", body: bodysirciZ67 },
    { id: "datatotal", body: bodytotal },
    { id: "datasuma", body: bodysuma }
  ];

  elements.forEach(el => {
    document.getElementById(el.id).innerHTML = el.body;
  });

  document.getElementById("loader").style.display = "none";
};

// Call the function to fetch data and display
fetchDataAndDisplay();
                                                 
