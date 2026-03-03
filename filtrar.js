// --- CONFIGURACIÓN Y CONSTANTES (Se mantienen iguales) ---
const urlrigel = 'https://api-rigel2.vercel.app/';
const urlp60 = 'http://10.0.22.50:8003/api-vehiculos-mapa';
const puntoReferencia = { lat: 4.700801, lng: -74.162544 };

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
let jsonEnriquecidoGlobal = [];

// --- FUNCIONES GEOGRÁFICAS (Se mantienen iguales) ---
function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function obtenerNomenclaturaCanopi(latV, lonV) {
    if (!latV || !lonV) return "-";
    try {
        let mejorClave = "A_Ori";
        let minDistanceDegrees = Infinity;
        for (const [id, data] of Object.entries(configCanopis)) {
            const dist = Math.abs((data.pn.lon - data.p1.lon) * (data.p1.lat - latV) - (data.p1.lon - lonV) * (data.pn.lat - data.p1.lat)) / Math.sqrt(Math.pow(data.pn.lon - data.p1.lon, 2) + Math.pow(data.pn.lat - data.p1.lat, 2));
            if (dist < minDistanceDegrees) { minDistanceDegrees = dist; mejorClave = id; }
        }
        if (minDistanceDegrees > 0.00045) return "EN RUTA";
        const c = configCanopis[mejorClave];
        const vX = lonV - c.p1.lon; const vY = latV - c.p1.lat;
        const lineX = c.pn.lon - c.p1.lon; const lineY = c.pn.lat - c.p1.lat;
        let progreso = (vX * lineX + vY * lineY) / (lineX * lineX + lineY * lineY);
        if (progreso < -0.15 || progreso > 1.15) return "EN RUTA";
        progreso = Math.max(0, Math.min(1, progreso));
        return `${c.label}${Math.round(c.min + (progreso * (c.max - c.min)))}`;
    } catch (e) { return "Err"; }
}

// --- LOGICA DEL TEXTAREA ---
function procesarTextoPegado() {
    const textarea = document.getElementById("campo-texto");
    const resultadoDiv = document.getElementById("resultado-busqueda");
    if (!textarea || !resultadoDiv) return;

    const lineas = textarea.value.split(/\n/);
    let htmlResultados = "<strong>Resultados:</strong><ul style='list-style:none; padding:0; margin-top:10px;'>";

    lineas.forEach(linea => {
        const cod = linea.trim();
        if (!cod) return;
        const idBusqueda = cod.replace(/-/g, "");
        const v = datosp60global.find(item => item.idVehiculo === idBusqueda);

        if (v && v.localizacionVehiculo[0]) {
            const ubic = obtenerNomenclaturaCanopi(parseFloat(v.localizacionVehiculo[0].latitud), parseFloat(v.localizacionVehiculo[0].longitud));
            const col = ubic === "EN RUTA" ? "#27ae60" : "#d35400";
            htmlResultados += `<li>📍 ${cod}: <b style="color:${col}">${ubic}</b></li>`;
        } else {
            htmlResultados += `<li>❌ ${cod}: <span style="color:gray">No hallado</span></li>`;
        }
    });
    resultadoDiv.innerHTML = htmlResultados + "</ul>";
}

// --- CARGA DE DATOS ---
async function ejecutarProcesoCompleto() {
    try {
        const [resRigel, resP60] = await Promise.all([ fetch(urlrigel), fetch(urlp60) ]);
        const [dataRigel, dataP60] = await Promise.all([ resRigel.json(), resP60.json() ]);
        
        datosrigelglobal = dataRigel.data || [];
        datosp60global = dataP60.periodic_20 || [];

        jsonEnriquecidoGlobal = datosrigelglobal.map(inc => {
            const p60 = datosp60global.find(v => v.idVehiculo.replace(/^(.{3})(\d{4})$/, '$1-$2') === inc.vehicle_code);
            return { ...inc, ...(p60 && { idRuta: p60.idRuta, localizacionVehiculo: p60.localizacionVehiculo[0] }) };
        });

        mostrarDatosEnriquecidos(jsonEnriquecidoGlobal);
    } catch (err) { console.error("Error:", err); }
}

function mostrarDatosEnriquecidos(datos) {
    const tabla = document.getElementById("tablaEnriquecida");
    if (!tabla) return;

    tabla.innerHTML = datos.map((item, index) => {
        const lat = parseFloat(item.localizacionVehiculo?.latitud);
        const lon = parseFloat(item.localizacionVehiculo?.longitud);
        const ubic = (lat && lon) ? obtenerNomenclaturaCanopi(lat, lon) : '-';
        const dist = (lat && lon) ? calcularDistanciaKm(puntoReferencia.lat, puntoReferencia.lng, lat, lon).toFixed(2) : '-';
        
        return `<tr>
            <td>${index + 1}</td>
            <td>${item.system_name || '-'}</td>
            <td>${item.vehicle_code || '-'}</td>
            <td>${item.issue_description || '-'}</td>
            <td>${item.date_created || '-'}</td>
            <td>${item.days_off ?? '-'}</td>
            <td>${item.current_status || '-'}</td>
            <td>${item.idRuta || '-'}</td>
            <td style="font-size: 13px;">
                <b style="color:${ubic === "EN RUTA" ? "#27ae60" : "#d35400"}">${ubic}</b> 
                | ${dist}km <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">📍</a>
            </td>
        </tr>`;
    }).join('');

    // 1. Quitar loader
    document.getElementById("loader").style.display = "none";

    // 2. Habilitar el Check de activación
    const checkActivar = document.getElementById("checkActivarBuscador");
    const contenedorBuscador = document.getElementById("contenedor-entrada");
    
    if (checkActivar) {
        checkActivar.disabled = false; // Ya no está gris
        checkActivar.addEventListener("change", function() {
            // Mostrar u ocultar según el check
            contenedorBuscador.style.display = this.checked ? "block" : "none";
        });
    }

    // 3. Activar escucha del textarea
    const txt = document.getElementById("campo-texto");
    if (txt) txt.addEventListener("input", procesarTextoPegado);
}

ejecutarProcesoCompleto();
