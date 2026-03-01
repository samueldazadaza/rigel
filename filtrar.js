// --- CONFIGURACIÓN Y CONSTANTES ---
const urlrigel = 'https://api-rigel2.vercel.app/';
const urlp60 = 'http://10.0.22.50:8003/api-vehiculos-mapa';

// Punto central de Green Móvil para cálculos de distancia general
const puntoReferencia = { lat: 4.700801, lng: -74.162544 };

// Coordenadas exactas de los extremos de cada Canopi (Sur -> Norte)
const configCanopis = {
    "A": { p1: { lat: 4.700215, lon: -74.163020 }, pn: { lat: 4.700889, lon: -74.162352 }, max: 24 },
    "B": { p1: { lat: 4.700210, lon: -74.163463 }, pn: { lat: 4.701050, lon: -74.162586 }, max: 30 },
    "C": { p1: { lat: 4.700270, lon: -74.163876 }, pn: { lat: 4.701267, lon: -74.162879 }, max: 35 },
    "D": { p1: { lat: 4.700257, lon: -74.164429 }, pn: { lat: 4.701492, lon: -74.163203 }, max: 40 },
    "E": { p1: { lat: 4.700297, lon: -74.164665 }, pn: { lat: 4.701587, lon: -74.163360 }, max: 45 },
    "F": { p1: { lat: 4.700338, lon: -74.164902 }, pn: { lat: 4.701683, lon: -74.163518 }, max: 50 },
    "G": { p1: { lat: 4.700384, lon: -74.165323 }, pn: { lat: 4.701882, lon: -74.163706 }, max: 63 }
};

let datosrigelglobal = [];
let datosp60global = [];
let jsonEnriquecidoGlobal = [];

// --- FUNCIONES GEOGRÁFICAS ---

// Calcula distancia física en Km
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

// Lógica de detección de Patio vs Ruta
function obtenerNomenclaturaCanopi(latV, lonV) {
    if (!latV || !lonV) return "-";
    try {
        let mejorCanopi = "A";
        let minDistanceDegrees = Infinity;

        // 1. Buscamos el canopi más cercano lateralmente
        for (const [id, data] of Object.entries(configCanopis)) {
            const dist = Math.abs((data.pn.lon - data.p1.lon) * (data.p1.lat - latV) - (data.p1.lon - lonV) * (data.pn.lat - data.p1.lat)) / 
                         Math.sqrt(Math.pow(data.pn.lon - data.p1.lon, 2) + Math.pow(data.pn.lat - data.p1.lat, 2));
            
            if (dist < minDistanceDegrees) {
                minDistanceDegrees = dist;
                mejorCanopi = id;
            }
        }

        // --- VALIDACIÓN DE UMBRAL (GEOFENCE) ---
        // Si el vehículo está a más de ~80 metros del canopi más cercano, está "EN RUTA"
        if (minDistanceDegrees > 0.0008) {
            return "EN RUTA";
        }

        const c = configCanopis[mejorCanopi];
        const vX = lonV - c.p1.lon;
        const vY = latV - c.p1.lat;
        const lineX = c.pn.lon - c.p1.lon;
        const lineY = c.pn.lat - c.p1.lat;
        const magCuadrada = lineX * lineX + lineY * lineY;
        
        // Proyección escalar para saber qué tan "adelante" en el canopi está
        let progreso = (vX * lineX + vY * lineY) / magCuadrada;

        // Si el progreso se sale mucho de los límites (Sur/Norte), está en ruta
        if (progreso < -0.15 || progreso > 1.15) {
            return "EN RUTA";
        }

        // Ajustamos progreso al rango 0-1 y calculamos el número de posición
        progreso = Math.max(0, Math.min(1, progreso));
        const numero = Math.round(progreso * (c.max - 1)) + 1;
        
        return `${mejorCanopi}${numero}`;
    } catch (e) {
        return "Error GPS";
    }
}

// --- CAPTURA DE DATOS API ---

async function funcionObtenerDatosRigel() {
    try {
        const response = await fetch(urlrigel);
        const datos = await response.json();
        datosrigelglobal = datos.data || [];
        console.log("Rigel OK");
    } catch (error) {
        console.error("Error Rigel:", error);
    }
}

async function funcionObtenerDatosP60() {
    try {
        const response = await fetch(urlp60);
        const datosp60 = await response.json();
        datosp60global = datosp60.periodic_20 || [];
        console.log("P60 OK");
    } catch (error) {
        console.error("Error P60:", error);
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
                localizacionVehiculo: datoP60.localizacionVehiculo[0]
            })
        };
    });
}

// --- RENDERIZADO EN PANTALLA ---

function mostrarDatosEnriquecidos(datos) {
    const contenedor = document.getElementById("tablaEnriquecida");
    if (!contenedor) return;

    const filasHtml = datos.map((item, index) => {
        const lat = parseFloat(item.localizacionVehiculo?.latitud);
        const lng = parseFloat(item.localizacionVehiculo?.longitud);

        // Determinamos posición o estado "En Ruta"
        const posicionPatio = (lat && lng) ? obtenerNomenclaturaCanopi(lat, lng) : '-';
        
        // Color dinámico: Naranja para patio, Verde para ruta
        const colorEstado = posicionPatio === "EN RUTA" ? "#27ae60" : "#d35400";
        const pesoFuente = posicionPatio === "EN RUTA" ? "normal" : "bold";

        const distVal = (lat && lng) ? calcularDistanciaKm(puntoReferencia.lat, puntoReferencia.lng, lat, lng).toFixed(2) : '-';
        const tiempo = distVal !== '-' ? (distVal * 4).toFixed(0) : '-';
        const mapsUrl = (lat && lng) ? `https://www.google.com/maps?q=${lat},${lng}` : '#';

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
                <td style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px;">
                    <b style="color: ${colorEstado}; font-weight: ${pesoFuente};">${posicionPatio}</b> 
                    <span style="color: #7f8c8d; margin-left: 5px;">| ${distVal}km (${tiempo}min)</span>
                    <a href="${mapsUrl}" target="_blank" style="text-decoration:none; margin-left: 5px;">📍</a>
                </td>
            </tr>
        `;
    }).join('');

    contenedor.innerHTML = filasHtml;
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
}

// --- CONTROLADORES Y FILTROS ---

function filtrarPorSistema() {
    const input = document.getElementById('filtroSistema');
    if (!input) return;
    const filtro = input.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaEnriquecida tr');

    filas.forEach(fila => {
        const sistema = fila.cells[1]?.textContent.toLowerCase();
        fila.style.display = sistema.includes(filtro) ? '' : 'none';
    });
}

async function ejecutarProcesoCompleto() {
    try {
        await funcionObtenerDatosRigel();
        await funcionObtenerDatosP60();
        enriquecerDatos();
        mostrarDatosEnriquecidos(jsonEnriquecidoGlobal);
    } catch (err) {
        console.error("Fallo crítico en el proceso:", err);
    }
}

// Iniciar proceso
ejecutarProcesoCompleto();
                                                 
