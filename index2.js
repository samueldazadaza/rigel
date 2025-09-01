// URLs de las fuentes de datos
const urlrigel = 'https://api-rigel2.vercel.app/';
//const urlp60 = 'https://raw.githubusercontent.com/samueldazadaza/api-rigel/main/P60todos.txt';
const urlp60 = 'http://192.168.23.160:7000/api_P60';


// Objetos globales
const datosrigelglobal = [];     // Incidentes desde Rigel
const datosp60global = [];       // Vehículos desde P60
const jsonEnriquecidoGlobal = []; // Array enriquecido externo


// Función para obtener datos desde Rigel
async function funcionObtenerDatosRigel() {
  try {
    const response = await fetch(urlrigel);
    const datos = await response.json();
    datosrigelglobal.push(...datos.data);
    console.log("✅ Datos de Rigel guardados en datosrigelglobal");
  } catch (error) {
    console.error("❌ Error al obtener datos de Rigel:", error);
  }
}


// Función para obtener datos desde P60 (GitHub)
async function funcionObtenerDatosP60() {
  try {
    const response = await fetch(urlp60);
    const datosp60 = await response.json();
    datosp60global.push(...datosp60);
    console.log("✅ Datos de P60 guardados en datosp60global");
  } catch (error) {
    console.error("❌ Error al obtener datos de P60:", error);
  }
}


// Función para enriquecer los datos de Rigel con los de P60
function enriquecerDatos() {
  const enriquecido = datosrigelglobal.map((incidente) => {
    const datoP60 = datosp60global.find((vehiculo) => {
      const idVehiculoFormateado = vehiculo.idVehiculo.replace(/^(.{3})(\d{4})$/, '$1-$2');
      return idVehiculoFormateado === incidente.vehicle_code;
    });


    return {
      ...incidente,
      ...(datoP60 && {
        idRuta: datoP60.idRuta,
        idVehiculo: datoP60.idVehiculo,
        kilometrosOdometro: datoP60.kilometrosOdometro,
        localizacionVehiculo: datoP60.localizacionVehiculo
      })
    };
  });


  jsonEnriquecidoGlobal.push(...enriquecido);
  console.log("✅ JSON enriquecido generado");
}


// Función para mostrar los datos enriquecidos en HTML
const mostrarDatosEnriquecidos = (datos) => {
  const datosFiltrados = datos. //.filter(item => item.vehicle_status === "INOPERATIVO"); //lo quite para evitar error de 2 filas faltantes en el html


// Punto fijo de referencia
const puntoReferencia = {
  lat: 4.700801,
  lng: -74.162544
};


// Función Haversine para calcular distancia en kilómetros
function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


function generarFilasTabla(data) {
  return data.map((item, index) => {
    const lat = item.localizacionVehiculo?.latitud;
    const lng = item.localizacionVehiculo?.longitud;


    const gps = (lat && lng)
      ? `${lat}, ${lng} <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank">(ver mapa)</a>`
      : '-';


    const distancia = (lat && lng)
      ? calcularDistanciaKm(puntoReferencia.lat, puntoReferencia.lng, parseFloat(lat), parseFloat(lng)).toFixed(2)
      : '-';


    return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.system_name || '-'}</td>
        <td>${item.vehicle_code || '-'}</td>
        <td>${item.issue_description || '-'}</td>
        <td>${item.date_created || '-'}</td>
        <td>${item.days_off ?? '-'}</td>
        <td>${item.current_status || '-'}</td>
        <td>${item.idRuta || '-'}</td>
        <td>${item.kilometrosOdometro?.toFixed(2) || '-'}</td>
        <td>${gps}</td>
        <td>${distancia}</td>
      </tr>
    `;
  }).join('');
}


  const cuerpoTabla = generarFilasTabla(datosFiltrados);
  document.getElementById("tablaEnriquecida").innerHTML = cuerpoTabla;
  document.getElementById("loader").style.display = "none";
}


// Función principal para ejecutar todo
async function ejecutarProcesoCompleto() {
  await funcionObtenerDatosRigel();
  await funcionObtenerDatosP60();
  enriquecerDatos();
  console.log("📦 Resultado final:", jsonEnriquecidoGlobal);
  mostrarDatosEnriquecidos(jsonEnriquecidoGlobal);
}




function filtrarPorSistema() {
  const input = document.getElementById('filtroSistema');
  const filtro = input.value.toLowerCase();
  const filas = document.querySelectorAll('table tbody tr');


  filas.forEach(fila => {
    const sistema = fila.cells[1]?.textContent.toLowerCase(); // columna 1 es 'Sistema'
    fila.style.display = sistema.includes(filtro) ? '' : 'none';
  });
}




// Ejecutar el proceso
ejecutarProcesoCompleto();


    
