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
    "D": { p1: { lat: 4.700425, lon: -74.164127 }, pn: { lat: 4.701169, lon: -74.163394 }, min: 1, max: 37, label: "D" }, // D1 hasta uf17-1 (aprox d37)
    "E": { p1: { lat: 4.700527, lon: -74.164276 }, pn: { lat: 4.701267, lon: -74.163486 }, min: 1, max: 37, label: "E" }, // E1 hasta uf6-1
    "F_Ori": { p1: { lat: 4.700426, lon: -74.164711 }, pn: { lat: 4.701502, lon: -74.163587 }, min: 1, max: 51, label: "F" },
    "F_Occ": { p1: { lat: 4.700467, lon: -74.164874 }, pn: { lat: 4.701630, lon: -74.163667 }, min: 106, max: 52, label: "F" },
    "G": { p1: { lat: 4.700429, lon: -74.165231 }, pn: { lat: 4.701859, lon: -74.163711 }, min: 1, max: 63, label: "G" }
};

const aliasPosiciones = {
    // --- AREA UF17 (CARRIL D) ---
    "D21": "PINT-UF17", "D22": "PINT-UF17",
    "D23": "CARC-UF17-2", "D24": "CARC-UF17-2",
    "D25": "CARC-UF17-1", "D26": "CARC-UF17-1",
    "D27": "UF17-6", "D28": "UF17-6",
    "D29": "UF17-5", "D30": "UF17-5",
    "D31": "UF17-4", "D32": "UF17-4",
    "D33": "UF17-3", "D34": "UF17-3",
    "D35": "UF17-2", "D36": "UF17-2",
    "D37": "UF17-1", "D38": "UF17-1",

    // --- AREA UF6 (CARRIL E) ---
    "E21": "PINT-UF6", "E22": "PINT-UF6",
    "E23": "CARC-UF6-2", "E24": "CARC-UF6-2",
    "E25": "CARC-UF6-1", "E26": "CARC-UF6-1",
    "E27": "UF6-6", "E28": "UF6-6",
    "E29": "UF6-5", "E30": "UF6-5",
    "E31": "UF6-4", "E32": "UF6-4",
    "E33": "UF6-3", "E34": "UF6-3",
    "E35": "UF6-2", "E36": "UF6-2",
    "E37": "UF6-1", "E38": "UF6-1"
};

const estructuraMapa = [
    { label: "G", id: "G", gap: true },
    { label: "F-OCC", id: "F_Occ", gap: false },
    { label: "F-ORI", id: "F_Ori", gap: true },
    { label: "E", id: "E", gap: true },
    { label: "D", id: "D", gap: true },
    { label: "C-OCC", id: "C_Occ", gap: false },
    { label: "C-ORI", id: "C_Ori", gap: true },
    { label: "B-OCC", id: "B_Occ", gap: false },
    { label: "B-ORI", id: "B_Ori", gap: true },
    { label: "A-OCC", id: "A_Occ", gap: false },
    { label: "A-ORI", id: "A_Ori", gap: false }
];




let datosp60global = [];

// --- UTILIDADES GEOGRÁFICAS Y TIEMPO ---
function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function calcularHaceCuanto(fechaStr) {
    if (!fechaStr) return { texto: "-", alerta: false };
    try {
        const partes = fechaStr.split(' ');
        const fechaPartes = partes[0].split('/');
        const horaPartes = partes[1].split('.')[0]; 
        const fechaISO = `${fechaPartes[2]}-${fechaPartes[1]}-${fechaPartes[0]}T${horaPartes}`;
        const ahora = new Date();
        const conexion = new Date(fechaISO);
        const difSeg = Math.floor((ahora - conexion) / 1000);

        if (difSeg < 60) return { texto: `${difSeg} seg`, alerta: false };
        const difMin = Math.floor(difSeg / 60);
        const alerta = difMin >= 5;

        if (difMin < 60) return { texto: `${difMin} min`, alerta: alerta };
        const difHoras = Math.floor(difMin / 60);
        return { texto: `${difHoras} h`, alerta: true };
    } catch (e) { return { texto: "Error", alerta: true }; }
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

    // --- Lógica de Alias ---
    const nroPosicion = Math.round(c.min + (Math.max(0, Math.min(1, progreso)) * (c.max - c.min)));
    const nomenclaturaBase = `${c.label}${nroPosicion}`;

    // Si la nomenclatura existe en el diccionario, devuelve el alias; si no, la base.
    return aliasPosiciones[nomenclaturaBase] || nomenclaturaBase;
}


                                 



// --- LÓGICA DE ORDENAMIENTO Y FILTRADO ---

function ordenarTabla(n, idTabla) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(idTabla);
    switching = true;
    dir = "asc"; 
    while (switching) {
        switching = false;
        rows = table.rows;
        // i=2 para saltar encabezado y fila de filtros
        for (i = 2; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            
            // Lógica para ordenar números (Km) o texto
            let valX = x.innerText.toLowerCase();
            let valY = y.innerText.toLowerCase();
            
            if (!isNaN(parseFloat(valX)) && isFinite(valX)) {
                valX = parseFloat(valX);
                valY = parseFloat(valY);
            }

            if (dir == "asc") {
                if (valX > valY) { shouldSwitch = true; break; }
            } else if (dir == "desc") {
                if (valX < valY) { shouldSwitch = true; break; }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;      
        } else {
            if (switchcount == 0 && dir == "asc") { dir = "desc"; switching = true; }
        }
    }
}

function filtrarTablaInterna() {
    var table = document.getElementById("tablaResultadosBusqueda");
    var tr = table.getElementsByTagName("tr");
    var inputs = document.querySelectorAll('.filter-input');

    for (let i = 2; i < tr.length; i++) { // Empezar en 2 para saltar header y filtros
        let visible = true;
        inputs.forEach((input, index) => {
            let filter = input.value.toUpperCase();
            let td = tr[i].getElementsByTagName("td")[index];
            if (td && td.innerText.toUpperCase().indexOf(filter) === -1) {
                visible = false;
            }
        });
        tr[i].style.display = visible ? "" : "none";
    }
}

function procesarTextoPegado() {
    const textarea = document.getElementById("campo-texto");
    const resultadoDiv = document.getElementById("resultado-busqueda");
    if (!textarea.value.trim()) { resultadoDiv.innerHTML = "Esperando datos..."; return; }

    let tabla = `
    <table class="table table-sm table-bordered bg-white" id="tablaResultadosBusqueda" style="font-size:11px">
        <thead class="table-secondary">
            <tr style="cursor:pointer">
                <th onclick="ordenarTabla(0, 'tablaResultadosBusqueda')">ID Bus ↕</th>
                <th onclick="ordenarTabla(1, 'tablaResultadosBusqueda')">Ubicación ↕</th>
                <th onclick="ordenarTabla(2, 'tablaResultadosBusqueda')">Ruta ↕</th>
                <th onclick="ordenarTabla(3, 'tablaResultadosBusqueda')">Envío ↕</th>
                <th onclick="ordenarTabla(4, 'tablaResultadosBusqueda')">Hace ↕</th>
                <th onclick="ordenarTabla(5, 'tablaResultadosBusqueda')">Km ↕</th>
                <th onclick="ordenarTabla(6, 'tablaResultadosBusqueda')">Mapa ↕</th>
            </tr>
            <tr class="filter-row">
                <td><input type="text" class="form-control form-control-sm filter-input" onkeyup="filtrarTablaInterna()" placeholder="..."></td>
                <td><input type="text" class="form-control form-control-sm filter-input" onkeyup="filtrarTablaInterna()" placeholder="..."></td>
                <td><input type="text" class="form-control form-control-sm filter-input" onkeyup="filtrarTablaInterna()" placeholder="..."></td>
                <td><input type="text" class="form-control form-control-sm filter-input" onkeyup="filtrarTablaInterna()" placeholder="..."></td>
                <td><input type="text" class="form-control form-control-sm filter-input" onkeyup="filtrarTablaInterna()" placeholder="..."></td>
                <td><input type="text" class="form-control form-control-sm filter-input" onkeyup="filtrarTablaInterna()" placeholder="..."></td>
                <td><input type="text" class="form-control form-control-sm filter-input" onkeyup="filtrarTablaInterna()" placeholder="..."></td>
            </tr>
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
            const envio = v.fechaHoraEnvioDato || '-';
            const tiempoObj = calcularHaceCuanto(v.fechaHoraLecturaDato);

            const colorUbic = (ubic === "EN RUTA") ? "#27ae60" : "#d35400";
            const colorHace = tiempoObj.alerta ? "#e74c3c" : "#2c3e50";
            
            tabla += `<tr>
                <td><b>${cod}</b></td>
                <td style="color:${colorUbic}"><b>${ubic}</b></td>
                <td>${v.idRuta || '-'}</td>
                <td style="font-size: 10px;">${envio}</td>
                <td style="color:${colorHace}; font-weight: bold;">${tiempoObj.texto}</td>
                <td>${dist}</td>
                <td class="text-center"><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">📍</a></td>
            </tr>`;
        } else {
            tabla += `<tr><td>${cod}</td><td colspan="6" class="text-muted text-center">Sin reporte GPS</td></tr>`;
        }
    });
    resultadoDiv.innerHTML = tabla + "</tbody></table>";
}

//funcion map
function generarMapaVisual() {
    const contenedor = document.getElementById("mapa-patio");
    if (!contenedor) return;

    const maxFilas = Math.max(...Object.values(configCanopis).map(c => Math.abs(c.max - c.min) + 1));

    // Estilos para celdas: sin padding, altura mínima, texto en una línea
    const estiloCelda = `padding: 0px !important; margin: 0; white-space: nowrap; height: 18px; vertical-align: middle; line-height: 18px; overflow: hidden;`;

    let html = `<table class="table table-bordered text-center" style="font-size:8px; table-layout: fixed; width: auto; border-spacing: 1px; border-collapse: separate;">
                <thead class="table-dark"><tr>`;
    
    estructuraMapa.forEach(col => {
        html += `<th style="width:110px; padding: 2px 0;">${col.label}</th>`;
        if (col.gap) html += `<th style="width:25px; background:transparent; border:none;"></th>`; 
    });
    html += `</tr></thead><tbody>`;

    for (let f = 0; f < maxFilas; f++) {
        html += `<tr>`;
        
        estructuraMapa.forEach(col => {
            const conf = configCanopis[col.id];
            const totalEnCarril = Math.abs(conf.max - conf.min) + 1;
            
            if (f < totalEnCarril) {
                const paso = conf.max > conf.min ? -1 : 1;
                const nroActual = conf.max + (f * paso);
                const idCelda = `${conf.label}${nroActual}`;
                const alias = aliasPosiciones[idCelda];

                const bus = datosp60global.find(b => {
                    if (!b.localizacionVehiculo[0]) return false;
                    const u = obtenerNomenclaturaCanopi(parseFloat(b.localizacionVehiculo[0].latitud), parseFloat(b.localizacionVehiculo[0].longitud));
                    return u === idCelda || u === alias;
                });

                if (bus) {
                    const cod = bus.idVehiculo.replace(/^(.{3})(\d{4})$/, '$1-$2');
                    const tiempo = calcularHaceCuanto(bus.fechaHoraLecturaDato);
                    const colorTiempo = tiempo.alerta ? "#ff0000" : "#008000";

                    html += `<td style="${estiloCelda} background: #d4edda; border: 1px solid #c3e6cb;">
                                <div style="display: flex; justify-content: space-around; align-items: center; width: 100%;">
                                    <span style="color: #666; width: 25px;">${idCelda}</span>
                                    <span style="font-weight: bold; color: #000; flex-grow: 1;">${cod}</span>
                                    <span style="color: ${colorTiempo}; font-weight: bold; width: 35px;">${tiempo.texto}</span>
                                </div>
                             </td>`;
                } else {
                    html += `<td style="${estiloCelda} background: #fdfdfd; color: #bbb;">
                                <div style="display: flex; justify-content: flex-start; padding-left: 2px;">
                                    <span>${idCelda}</span>
                                    <span style="margin-left: 5px; font-size: 7px; opacity: 0.6;">${alias ? alias : ''}</span>
                                </div>
                             </td>`;
                }
            } else {
                html += `<td style="background: transparent; border: none;"></td>`;
            }

            if (col.gap) html += `<td style="background: transparent; border: none;"></td>`;
        });
        html += `</tr>`;
    }

    html += `</tbody></table>`;
    contenedor.innerHTML = html;
}




// --- EJECUCIÓN ---
async function ejecutar() {
    try {
        const [resR, resP] = await Promise.all([fetch(urlrigel), fetch(urlp60)]);
        const dataR = await resR.json();
        const jsonP = await resP.json();
        datosp60global = jsonP.periodic_20 || [];

        document.getElementById("tablaEnriquecida").innerHTML = (dataR.data || []).map((item, i) => {
            const v = datosp60global.find(bus => bus.idVehiculo.replace(/^(.{3})(\d{4})$/, '$1-$2') === item.vehicle_code);
            let lat = null, lon = null, ubic = '-', dist = '-', colorUbic = '#000';
            if (v && v.localizacionVehiculo[0]) {
                lat = parseFloat(v.localizacionVehiculo[0].latitud);
                lon = parseFloat(v.localizacionVehiculo[0].longitud);
                ubic = obtenerNomenclaturaCanopi(lat, lon);
                dist = calcularDistanciaKm(puntoReferencia.lat, puntoReferencia.lng, lat, lon).toFixed(2);
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
                <td style="font-size: 11px;"><b style="color:${colorUbic}">${ubic}</b> | ${dist}km |<a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">📍</a></td>
            </tr>`;
        }).join('');

        document.getElementById("loader").style.display = "none";
        const btnB = document.getElementById("checkActivar");
        if (btnB) {
            btnB.disabled = false;
            btnB.addEventListener("change", () => {
                document.getElementById("contenedor-entrada").style.display = btnB.checked ? "block" : "none";
            });
        }
        document.getElementById("campo-texto").addEventListener("input", procesarTextoPegado);

        //pintar map
        generarMapaVisual(); 
    } catch (e) { console.error(e); }
}

ejecutar();
                       
