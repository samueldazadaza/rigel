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

let datosp60global = [];

// --- FUNCIONES GEOGRÁFICAS ---

function obtenerNomenclaturaCanopi(latV, lonV) {
    if (!latV || !lonV) return "SIN GPS";
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
    } catch (e) { return "ERROR"; }
}

// --- LOGICA DE RECONOCIMIENTO DINÁMICO ---

function procesarTextoPegado() {
    const textarea = document.getElementById("campo-texto");
    const resultadoDiv = document.getElementById("resultado-busqueda");
    if (!textarea || !resultadoDiv) return;

    const lineas = textarea.value.split(/\n/); // Separar por saltos de línea
    let htmlResultados = "<strong>Resultados detectados:</strong><br><ul>";

    lineas.forEach(linea => {
        const codigoLimpio = linea.trim();
        if (codigoLimpio === "") return;

        // Buscamos el vehículo en los datos de P60
        // Convertimos Z67-4034 a Z674034 para comparar con el API
        const idSinGuion = codigoLimpio.replace("-", "");
        const vehiculo = datosp60global.find(v => v.idVehiculo === idSinGuion);

        if (vehiculo && vehiculo.localizacionVehiculo[0]) {
            const lat = parseFloat(vehiculo.localizacionVehiculo[0].latitud);
            const lon = parseFloat(vehiculo.localizacionVehiculo[0].longitud);
            const ubicacion = obtenerNomenclaturaCanopi(lat, lon);
            
            const color = ubicacion === "EN RUTA" ? "green" : "orange";
            htmlResultados += `<li>${codigoLimpio}: <b style="color:${color}">${ubicacion}</b></li>`;
        } else {
            htmlResultados += `<li>${codigoLimpio}: <i style="color:gray">No encontrado</i></li>`;
        }
    });

    htmlResultados += "</ul>";
    resultadoDiv.innerHTML = htmlResultados;
}

// --- PETICIONES API ---

async function cargarDatosP60() {
    try {
        const response = await fetch(urlp60);
        const data = await response.json();
        datosp60global = data.periodic_20 || [];
        console.log("✅ Datos P60 cargados para búsqueda dinámica");
    } catch (error) {
        console.error("Error al cargar P60:", error);
    }
}

// --- INICIALIZACIÓN ---

async function iniciar() {
    await cargarDatosP60();
    
    const textarea = document.getElementById("campo-texto");
    if (textarea) {
        // Detecta cuando el usuario pega texto o escribe
        textarea.addEventListener("input", procesarTextoPegado);
    }
}

iniciar();
