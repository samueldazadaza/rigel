// --- CONFIGURACIÓN Y CONSTANTES ---
const urlrigel = 'https://api-rigel2.vercel.app/';
const urlp60 = 'http://10.0.22.50:8003/api-vehiculos-mapa';
const puntoReferencia = { lat: 4.700801, lng: -74.162544 };

const configCanopis = {
    "A_Ori": { p1: { lat: 4.700375, lon: -74.162764 }, pn: { lat: 4.700792, lon: -74.162336 }, min: 1, max: 24, label: "A" },
    "A_Occ": { p1: { lat: 4.700336, lon: -74.163010 }, pn: { lat: 4.700871, lon: -74.162448 }, min: 48, max: 25, label: "A" },
    "B_Ori": { p1: { lat: 4.700329, lon: -74.163228 }, pn: { lat: 4.700889, lon: -74.162664 }, min: 1, max: 31, label: "B" },
    "B_Occ": { p1: { lat: 4.700375, lon: -74.163375 }, pn: { lat: 4.701038, lon: -74.162702 }, min: 62, max: 32, label: "B" },
    "C_Ori": { p1: { lat: 4.700384, lon: -74.163653 }, pn: { lat: 4.701113, lon: -74.162872 }, min: 1, max: 36, label: "C" },
    "C_Occ": { p1: { lat: 4.700426, lon: -74.163848 }, pn: { lat: 4.701217, lon: -74.163023 }, min: 72, max: 37, label: "C" },
    "D": { p1: { lat: 4.700431, lon: -74.164127 }, pn: { lat: 4.701359, lon: -74.163202 }, min: 1, max: 45, label: "D" },
    "E": { p1: { lat: 4.700549, lon: -74.164279 }, pn: { lat: 4.701457, lon: -74.163335 }, min: 1, max: 45, label: "E" },
    "F_Ori": { p1: { lat: 4.700426, lon: -74.164711 }, pn: { lat: 4.701502, lon: -74.163587 }, min: 1, max: 51, label: "F" },
    "F_Occ": { p1: { lat: 4.700467, lon: -74.164874 }, pn: { lat: 4.701630, lon: -74.163667 }, min: 106, max: 52, label: "F" },
    "G": { p1: { lat: 4.700429, lon: -74.165231 }, pn: { lat: 4.701859, lon: -74.163711 }, min: 1, max: 63, label: "G" }
};

let datosp60global = [];

// --- FUNCIONES GEOGRÁFICAS ---
function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function obtenerNomenclaturaCanopi(latV, lonV) {
    if (!latV || !lonV) return "-";
    let mejorClave = "A_Ori", minDistanceDegrees = Infinity;
    for (const [id, data] of Object.entries(configCanopis)) {
        const dist = Math.abs((data.pn.lon - data.p1.lon) * (data.p1.lat - latV) - (data.p1.lon - lonV) * (data.pn.lat - data.p1.lat)) / 
                     Math.sqrt(Math.pow(data.pn.lon - data.p1.lon, 2) + Math.pow(data.pn.lat - data.p1.lat, 2));
        if (dist < minDistanceDegrees) { minDistanceDegrees = dist; mejorClave = id; }
    }
    if (minDistanceDegrees > 0.00045) return "EN RUTA";
    const c = configCanopis[mejorClave];
    let progreso = ((lonV - c.p1.lon) * (c.pn.lon - c.p1.lon) + (latV - c.p1.lat) * (c.pn.lat - c.p1.lat)) / 
                   (Math.pow(c.pn.lon - c.p1.lon, 2) + Math.pow(c.pn.lat - c.p1.lat, 2));
    if (progreso < -0.25 || progreso > 1.25) return "EN RUTA";
    return `${c.label}${Math.round(c.min + (Math.max(0, Math.min(1, progreso)) * (c.max - c.min)))}`;
}

// --- LÓGICA DE BÚSQUEDA EN TEXTAREA ---
function procesarTextoPegado() {
    const textarea = document.getElementById("campo-texto");
    const resultadoDiv = document.getElementById("resultado-busqueda");
    if (!textarea.value.trim()) { resultadoDiv.innerHTML = "Esperando datos..."; return; }

    let tabla = `<table class="table table-sm table-bordered bg-white" style="font-size:11px">
        <thead class="table-secondary">
            <tr><th>ID Bus</th><th>Ubicación</th><th>Ruta</th><th>Km</th><th>Min</th><th>Mapa</th></tr>
        </thead><tbody>`;

    textarea.value.split(/\n/).forEach(linea => {
        const cod = linea.trim();
        if (!cod) return;
        const v = datosp60global.find(item => item.idVehiculo === cod.replace(/-/g, ""));
        if (v && v.localizacionVehiculo[0]) {
            const lat = parseFloat(v.localizacionVehiculo[0].latitud);
            const lon = parseFloat(v.localizacionVehiculo[0].longitud);
            const ubic = obtenerNomenclaturaCanopi(lat, lon);
            const dist = calcularDistanciaKm(puntoReferencia.lat, puntoReferencia.lng, lat, lon).toFixed(2);
            const tiempo = (dist * 4).toFixed(0);
            const colorUbic = (ubic === "EN RUTA") ? "#27ae60" : "#d35400";
            
            tabla += `<tr>
                <td><b>${cod}</b></td>
                <td style="color:${colorUbic}"><b>${ubic}</b></td>
                <td>${v.idRuta || '-'}</td>
                <td>${dist} km</td>
                <td>${tiempo} min</td>
                <td><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">📍</a></td>
            </tr>`;
        } else {
            tabla += `<tr><td>${cod}</td><td colspan="5" class="text-muted text-center">Sin reporte GPS</td></tr>`;
        }
    });
    resultadoDiv.innerHTML = tabla + "</tbody></table>";
}

// --- PROCESO PRINCIPAL ---
async function ejecutar() {
    try {
        const [resR, resP] = await Promise.all([fetch(urlrigel), fetch(urlp60)]);
        const dataR = await resR.json();
        const jsonP = await resP.json();
        datosp60global = jsonP.periodic_20 || [];

        // Renderizar tabla principal
        document.getElementById("tablaEnriquecida").innerHTML = (dataR.data || []).map((item, i) => {
            const v = datosp60global.find(bus => bus.idVehiculo.replace(/^(.{3})(\d{4})$/, '$1-$2') === item.vehicle_code);
            
            let lat = null, lon = null, ubic = '-', dist = '-', tiempo = '-', colorUbic = '#000';

            if (v && v.localizacionVehiculo && v.localizacionVehiculo[0]) {
                lat = parseFloat(v.localizacionVehiculo[0].latitud);
                lon = parseFloat(v.localizacionVehiculo[0].longitud);
                ubic = obtenerNomenclaturaCanopi(lat, lon);
                dist = calcularDistanciaKm(puntoReferencia.lat, puntoReferencia.lng, lat, lon).toFixed(2);
                tiempo = (dist * 4).toFixed(0);
                colorUbic = (ubic === "EN RUTA") ? "#27ae60" : "#d35400";
            }

            return `<tr>
                <td>${i+1}</td>
                <td>${item.system_name || '-'}</td>
                <td>${item.vehicle_code || '-'}</td>
                <td>${item.issue_description || '-'}</td>
                <td>${item.date_created || '-'}</td>
                <td>${item.days_off ?? '-'}</td>
                <td>${item.current_status || '-'}</td>
                <td>${v?.idRuta || '-'}</td>
                <td style="font-size: 11px;">
                    <b style="color:${colorUbic}">${ubic}</b> | 
                    <span style="color:#7f8c8d">${dist}km (${tiempo}min)</span> 
                    ${(lat) ? `<a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">📍</a>` : ''}
                </td>
            </tr>`;
        }).join('');

        // Ocultar loader y activar botón "checkActivar"
        document.getElementById("loader").style.display = "none";
        const btnB = document.getElementById("checkActivar");
        const contenedor = document.getElementById("contenedor-entrada");
        
        if (btnB) {
            btnB.disabled = false;
            btnB.addEventListener("change", () => {
                contenedor.style.display = btnB.checked ? "block" : "none";
            });
        }

        document.getElementById("campo-texto").addEventListener("input", procesarTextoPegado);

    } catch (e) { 
        console.error("Error cargando datos:", e); 
        document.getElementById("loader").innerHTML = "Error al cargar las APIs.";
    }
}

ejecutar();
                
