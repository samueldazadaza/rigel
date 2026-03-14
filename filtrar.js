// --- CONFIGURACIÓN ---
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

// --- UTILIDADES ---

function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function calcularHaceCuanto(fechaStr) {
    if (!fechaStr) return "Sin datos";
    try {
        const partes = fechaStr.split(' ');
        const fechaPartes = partes[0].split('/');
        const horaPartes = partes[1].split('.')[0]; 
        const fechaISO = `${fechaPartes[2]}-${fechaPartes[1]}-${fechaPartes[0]}T${horaPartes}`;
        const ahora = new Date();
        const conexion = new Date(fechaISO);
        const difSegundos = Math.floor((ahora - conexion) / 1000);

        if (difSegundos < 60) return `${difSegundos} seg`;
        const difMinutos = Math.floor(difSegundos / 60);
        if (difMinutos < 60) return `${difMinutos} min`;
        return `${Math.floor(difMinutos / 60)} h`;
    } catch (e) { return "Error"; }
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

// --- BUSCADOR FLOTANTE CON DATA EXTRA ---

function procesarTextoPegado() {
    const textarea = document.getElementById("campo-texto");
    const resultadoDiv = document.getElementById("resultado-busqueda");
    if (!textarea.value.trim()) { resultadoDiv.innerHTML = ""; return; }

    let tabla = `<table class="table table-sm table-bordered" style="font-size:10px; margin-bottom:0;">
        <thead class="table-dark">
            <tr><th>Bus</th><th>Ubic</th><th>Envío (Dato)</th><th>Lectura</th><th>Hace</th></tr>
        </thead><tbody>`;

    textarea.value.split(/\n/).forEach(linea => {
        const cod = linea.trim();
        if (!cod) return;
        const v = datosp60global.find(item => item.idVehiculo === cod.replace(/-/g, ""));
        
        if (v && v.localizacionVehiculo[0]) {
            const lat = parseFloat(v.localizacionVehiculo[0].latitud);
            const lon = parseFloat(v.localizacionVehiculo[0].longitud);
            const ubic = obtenerNomenclaturaCanopi(lat, lon);
            const haceCuanto = calcularHaceCuanto(v.fechaHoraLecturaDato);
            
            // Extraemos solo la hora de envío y lectura para que la tabla sea compacta
            const hEnvio = v.fechaHoraEnvioDato ? v.fechaHoraEnvioDato.split(' ')[1].split('.')[0] : '-';
            const hLectura = v.fechaHoraLecturaDato ? v.fechaHoraLecturaDato.split(' ')[1].split('.')[0] : '-';
            
            tabla += `<tr>
                <td><b>${cod}</b></td>
                <td>${ubic}</td>
                <td>${hEnvio}</td>
                <td>${hLectura}</td>
                <td><b>${hHace}</b></td>
            </tr>`;
        }
    });
    resultadoDiv.innerHTML = tabla + "</tbody></table>";
}

// --- EJECUCIÓN PRINCIPAL ---

async function ejecutar() {
    try {
        const [resR, resP] = await Promise.all([fetch(urlrigel), fetch(urlp60)]);
        const dataR = await resR.json();
        const jsonP = await resP.json();
        datosp60global = jsonP.periodic_20 || [];

        document.getElementById("tablaEnriquecida").innerHTML = (dataR.data || []).map((item, i) => {
            const v = datosp60global.find(bus => bus.idVehiculo.replace(/^(.{3})(\d{4})$/, '$1-$2') === item.vehicle_code);
            let lat = null, lon = null, ubic = '-', dist = '-', haceCuanto = '-', colorConexion = '#000';

            if (v && v.localizacionVehiculo && v.localizacionVehiculo[0]) {
                lat = parseFloat(v.localizacionVehiculo[0].latitud);
                lon = parseFloat(v.localizacionVehiculo[0].longitud);
                ubic = obtenerNomenclaturaCanopi(lat, lon);
                dist = calcularDistanciaKm(puntoReferencia.lat, puntoReferencia.lng, lat, lon).toFixed(2);
                haceCuanto = calcularHaceCuanto(v.fechaHoraLecturaDato);
                
                const minutosInt = haceCuanto.includes("min") ? parseInt(haceCuanto) : 0;
                colorConexion = (haceCuanto.includes("h") || minutosInt >= 5) ? "#e74c3c" : "#27ae60";
            }

            return `<tr>
                <td>${i+1}</td>
                <td>${item.vehicle_code}</td>
                <td>${item.issue_description}</td>
                <td style="color:${colorConexion}"><b>${haceCuanto}</b></td>
                <td>${v?.idRuta || '-'}</td>
                <td><b>${ubic}</b> | ${dist}km ${(lat) ? `<a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">📍</a>` : ''}</td>
            </tr>`;
        }).join('');

        document.getElementById("loader").style.display = "none";
        
        // Manejo del botón flotante "?"
        const btnF = document.getElementById("boton-flotante");
        const panel = document.getElementById("contenedor-entrada");
        btnF.addEventListener("click", () => {
            panel.style.display = (panel.style.display === "block") ? "none" : "block";
        });

        document.getElementById("campo-texto").addEventListener("input", procesarTextoPegado);

    } catch (e) { console.error(e); }
}

ejecutar();
    
