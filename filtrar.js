// --- CONFIGURACIÓN Y CONSTANTES ---
const urlrigel = 'https://api-rigel2.vercel.app/';
const urlp60 = 'http://10.0.22.50:8003/api-vehiculos-mapa';

const puntoReferencia = { lat: 4.700801, lng: -74.162544 };

// COORDENADAS ACTUALIZADAS (Oriente / Occidente)
const configCanopis = {
    "A_Ori": { p1: { lat: 4.700375, lon: -74.162764 }, pn: { lat: 4.700792, lon: -74.162336 }, min: 1, max: 24, label: "A" },
    "A_Occ": { p1: { lat: 4.700336, lon: -74.163010 }, pn: { lat: 4.700871, lon: -74.162448 }, min: 48, max: 25, label: "A" },
    "B_Ori": { p1: { lat: 4.700329, lon: -74.163228 }, pn: { lat: 4.700889, lon: -74.162664 }, min: 1, max: 30, label: "B" },
    "B_Occ": { p1: { lat: 4.700375, lon: -74.163375 }, pn: { lat: 4.701038, lon: -74.162702 }, min: 62, max: 31, label: "B" },
    "C_Ori": { p1: { lat: 4.700384, lon: -74.163653 }, pn: { lat: 4.701113, lon: -74.162872 }, min: 1, max: 35, label: "C" },
    "C_Occ": { p1: { lat: 4.700426, lon: -74.163848 }, pn: { lat: 4.701217, lon: -74.163023 }, min: 72, max: 36, label: "C" },
    "D": { p1: { lat: 4.700431, lon: -74.164127 }, pn: { lat: 4.701359, lon: -74.163202 }, min: 1, max: 40, label: "D" },
    "E": { p1: { lat: 4.700549, lon: -74.164279 }, pn: { lat: 4.701457, lon: -74.163335 }, min: 1, max: 40, label: "E" },
    "F_Ori": { p1: { lat: 4.700426, lon: -74.164711 }, pn: { lat: 4.701502, lon: -74.163587 }, min: 1, max: 50, label: "F" },
    "F_Occ": { p1: { lat: 4.700467, lon: -74.164874 }, pn: { lat: 4.701630, lon: -74.163667 }, min: 106, max: 51, label: "F" },
    "G": { p1: { lat: 4.700429, lon: -74.165231 }, pn: { lat: 4.701859, lon: -74.163711 }, min: 1, max: 63, label: "G" }
};

let datosrigelglobal = [];
let datosp60global = [];
let jsonEnriquecidoGlobal = [];

// --- FUNCIONES GEOGRÁFICAS ---

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

function obtenerNomenclaturaCanopi(latV, lonV) {
    if (!latV || !lonV) return "-";
    try {
        let mejorClave = "A_Ori";
        let minDistanceDegrees = Infinity;

        for (const [id, data] of Object.entries(configCanopis)) {
            const dist = Math.abs((data.pn.lon - data.p1.lon) * (data.p1.lat - latV) - (data.p1.lon - lonV) * (data.pn.lat - data.p1.lat)) / 
                         Math.sqrt(Math.pow(data.pn.lon - data.p1.lon, 2) + Math.pow(data.pn.lat - data.p1.lat, 2));
            if (dist < minDistanceDegrees) {
                minDistanceDegrees = dist;
                mejorClave = id;
            }
        }

        if (minDistanceDegrees > 0.00045) return "EN RUTA";

        const c = configCanopis[mejorClave];
        const vX = lonV - c.p1.lon;
        const vY = latV - c.p1.lat;
        const lineX = c.pn.lon - c.p1.lon;
        const lineY = c.pn.lat - c.p1.lat;
        const magCuadrada = lineX * lineX + lineY * lineY;
        let progreso = (vX * lineX + vY * lineY) / magCuadrada;

        if (progreso < -0.15 || progreso > 1.15) return "EN RUTA";
        progreso = Math.max(0, Math.min(1, progreso));
        const numero = Math.round(c.min + (progreso * (c.max - c.min)));
        
        return `${c.label}${numero}`;
    } catch (e) { return "Err GPS"; }
}

// --- LOGICA DE RECONOCIMIENTO DINÁMICO (TEXTAREA) ---

function procesarTextoPegado() {
    const textarea = document.getElementById("campo-texto");
    const resultadoDiv = document.getElementById("resultado-busqueda");
    if (!textarea || !resultadoDiv) return;

    const lineas = textarea.value.split(/\n/);
    let htmlResultados = "<strong>Resultados detectados:</strong><br><ul style='list-style:none; padding:0;'>";

    lineas.forEach(linea => {
        const codigoOriginal = linea.trim();
        if (codigoOriginal === "") return;

        // Limpiar para buscar: Z67-4034 -> Z674034
        const idBusqueda = codigoOriginal.replace(/-/g, "");
        const vehiculo = datosp60global.find(v => v.idVehiculo === idBusqueda);

        if (vehiculo && vehiculo.localizacionVehiculo[0]) {
            const lat = parseFloat(vehiculo.localizacionVehiculo[0].latitud);
            const lon = parseFloat(vehiculo.localizacionVehiculo[0].longitud);
            const ubicacion = obtenerNomenclaturaCanopi(lat, lon);
            const color = (ubicacion === "EN RUTA") ? "#27ae60" : "#d35400";
            
            htmlResultados += `<li>📍 ${codigoOriginal}: <b style="color:${color}">${ubicacion}</b></li>`;
        } else {
            htmlResultados += `<li>❌ ${codigoOriginal}: <span style="color:gray">No hallado</span></li>`;
        }
    });

    htmlResultados += "</ul>";
    resultadoDiv.innerHTML = htmlResultados;
}

// --- CAPTURA Y ENRIQUECIMIENTO ---

async function funcionObtenerDatosRigel() {
    try {
        const response = await fetch(urlrigel);
        const datos = await response.json();
        datosrigelglobal = datos.data || [];
    } catch (error) { console.error("Error Rigel:", error); }
}

async function funcionObtenerDatosP60() {
    try {
        const response = await fetch(urlp60);
        const datosp60 = await response.json();
        datosp60global = datosp60.periodic_20 || [];
    } catch (error) { console.error("Error P60:", error); }
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

// --- RENDERIZADO DE TABLA ---

function mostrarDatosEnriquecidos(datos) {
    const contenedor = document.getElementById("tablaEnriquecida");
    if (!contenedor) return;

    const filasHtml = datos.map((item, index) => {
        const lat = parseFloat(item.localizacionVehiculo?.latitud);
        const lng = parseFloat(item.localizacionVehiculo?.longitud);

        const posicionPatio = (lat && lng) ? obtenerNomenclaturaCanopi(lat, lng) : '-';
        const colorEstado = posicionPatio === "EN RUTA" ? "#27ae60" : "#d35400";
        
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
                <td style="font-family: sans-serif; font-size: 13px;">
                    <b style="color: ${colorEstado};">${posicionPatio}</b> 
                    <span style="color: #7f8c8d; margin-left: 5px;">| ${distVal}km (${tiempo}min)</span>
                    <a href="${mapsUrl}" target="_blank" style="text-decoration:none; margin-left: 5px;">📍</a>
                </td>
            </tr>
        `;
    }).join('');

    contenedor.innerHTML = filasHtml;
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
    
    // --- ACTIVAR TEXTAREA DESPUÉS DE CARGAR TABLA ---
    const textarea = document.getElementById("campo-texto");
    if (textarea) {
        textarea.addEventListener("input", procesarTextoPegado);
        console.log("⌨️ Buscador textarea activado.");
    }
}

// --- INICIO ---

async function ejecutarProcesoCompleto() {
    console.log("🚀 Iniciando carga...");
    await funcionObtenerDatosRigel();
    await funcionObtenerDatosP60();
    enriquecerDatos();
    mostrarDatosEnriquecidos(jsonEnriquecidoGlobal);
}

ejecutarProcesoCompleto();
