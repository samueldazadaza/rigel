// --- CONFIGURACIÓN Y CONSTANTES ---
const urlrigel = 'https://api-rigel2.vercel.app/';
const urlp60 = 'http://10.0.22.50:8003/api-vehiculos-mapa';

// Punto fijo de referencia (Centro de Green Móvil)
const puntoReferencia = { lat: 4.700801, lng: -74.162544 };

// Definición de los Canopis (Límites de tu polígono)
const configCanopis = {
    "A": { p1: { lat: 4.700215, lon: -74.163020 }, pn: { lat: 4.700889, lon: -74.162352 }, max: 24 },
    "B": { p1: { lat: 4.700210, lon: -74.163463 }, pn: { lat: 4.701050, lon: -74.162586 }, max: 30 },
    "C": { p1: { lat: 4.700270, lon: -74.163876 }, pn: { lat: 4.701267, lon: -74.162879 }, max: 35 },
    "D": { p1: { lat: 4.700257, lon: -74.164429 }, pn: { lat: 4.701492, lon: -74.163203 }, max: 40 },
    "E": { p1: { lat: 4.700297, lon: -74.164665 }, pn: { lat: 4.701587, lon: -74.163360 }, max: 45 }, // Estimado
    "F": { p1: { lat: 4.700338, lon: -74.164902 }, pn: { lat: 4.701683, lon: -74.163518 }, max: 50 },
    "G": { p1: { lat: 4.700384, lon: -74.165323 }, pn: { lat: 4.701882, lon: -74.163706 }, max: 63 }
};

// Objetos globales
let datosrigelglobal = [];
let datosp60global = [];
let jsonEnriquecidoGlobal = [];

// --- FUNCIONES DE CÁLCULO GEOGRÁFICO ---

// Calcula la distancia lineal entre dos puntos (Haversine)
function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Determina la posición específica en el patio (ej: G30)
function obtenerNomenclaturaCanopi(latV, lonV) {
    if (!latV || !lonV) return "-";
    
    let mejorCanopi = "A";
    let minDistance = Infinity;

    // 1. Encontrar a qué línea de Canopi pertenece el vehículo
    for (const [id, data] of Object.entries(configCanopis)) {
        const dist = Math.abs((data.pn.lon - data.p1.lon) * (data.p1.lat - latV) - (data.p1.lon - lonV) * (data.pn.lat - data.p1.lat)) / 
                     Math.sqrt(Math.pow(data.pn.lon - data.p1.lon, 2) + Math.pow(data.pn.lat - data.p1.lat, 2));
        if (dist < minDistance) {
            minDistance = dist;
            mejorCanopi = id;
        }
    }

    const c = configCanopis[mejorCanopi];
    
    // 2. Proyectar el progreso (0.0 a 1.0) sobre la línea del canopi
    const vX = lonV - c.p1.lon;
    const vY = latV - c.p1.lat;
    const lineX = c.pn.lon - c.p1.lon;
    const lineY = c.pn.lat - c.p1.lat;
    const magCuadrada = lineX * lineX + lineY * lineY;
    
    let progreso = (vX * lineX + vY * lineY) / magCuadrada;
    progreso = Math.max(0, Math.min(1, progreso)); // Mantener dentro de los límites del cable/canopi

    // 3. Convertir el progreso al número de posición (ej: 1 al 63)
    const numero = Math.round(progreso * (c.max - 1)) + 1;
    return `${mejorCanopi}${numero}`;
}

// --- FUNCIONES DE DATOS ---

async function funcionObtenerDatosRigel() {
    try {
        const response = await fetch(urlrigel);
        const datos = await response.json();
        datosrigelglobal = datos.data || [];
        console.log("✅ Datos de Rigel cargados");
    } catch (error) {
        console.error("❌ Error Rigel:", error);
    }
}

async function funcionObtenerDatosP60() {
    try {
        const response = await fetch(urlp60);
        const datosp60 = await response.json();
        datosp60global = datosp60.periodic_20 || [];
        console.log("✅ Datos de P60 cargados");
    } catch (error) {
        console.error("❌ Error P60:", error);
    }
}

function enriquecerDatos() {
    jsonEnriquecidoGlobal = datosrigelglobal.map((incidente) => {
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
                localizacionVehiculo: datoP60.localizacionVehiculo[0]
            })
        };
    });
    console.log("✅ JSON enriquecido generado");
}

// --- RENDERIZADO DE TABLA ---

const mostrarDatosEnriquecidos = (datos) => {
    const cuerpoTabla = datos.map((item, index) => {
        const lat = parseFloat(item.localizacionVehiculo?.latitud);
        const lng = parseFloat(item.localizacionVehiculo?.longitud);

        // Lógica de posición en patio
        const posicionPatio = (lat && lng) ? obtenerNomenclaturaCanopi(lat, lng) : '-';
        
        // Link a Google Maps
        const gpsLink = (lat && lng) 
            ? `<a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" style="color: #3498db; text-decoration: none;">(ver)</a>` 
            : '-';

        const distVal = (lat && lng) 
            ? calcularDistanciaKm(puntoReferencia.lat, puntoReferencia.lng, lat, lng).toFixed(2) 
            : '-';

        const tiempo = distVal !== '-' ? (distVal * 4).toFixed(0) : '-';

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
                <td style="font-family: monospace; font-size: 14px;">
                    <b style="color: #e67e22;">${posicionPatio}</b> | ${distVal}km (${tiempo}min) ${gpsLink}
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById("tablaEnriquecida").innerHTML = cuerpoTabla;
    const loader = document.getElementById("loader");
    if(loader) loader.style.display = "none";
};

// --- CONTROLADORES ---

function filtrarPorSistema() {
    const input = document.getElementById('filtroSistema');
    const filtro = input.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaEnriquecida tr');

    filas.forEach(fila => {
        const sistema = fila.cells[1]?.textContent.toLowerCase();
        fila.style.display = sistema.includes(filtro) ? '' : 'none';
    });
}

async function ejecutarProcesoCompleto() {
  
