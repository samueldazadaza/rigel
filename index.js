//const url = 'http://localhost:5000'
const url = 'https://apir2.onrender.com/' //server lento
// const url = 'https://cute-gold-toad-vest.cyclic.app/' //server rapido

//CODIGO PARA PINTAR DATOS EN HTML
fetch(url)
.then(response => response.json())
.then(datos => mostrarDataTotal(datos))
.catch(error => console.log(error))

const mostrarDataTotal = (datos) => {

  //variables
const datosGenerales = datos.data;
console.log(datosGenerales)

//filtrar area its en general
// FILTRO DATOS ITS GENERAL, Z63 Y Z67
const datosIts = datosGenerales.filter(item => item.system_name === 'IT-ITS') //filtrar buses its
console.log(datosIts);
const datosItsZ63 = datosIts.filter(item => item.uf_code === 'ZMO III') //filtrar buses its Z63
const datosItsZ67 = datosIts.filter(item => item.uf_code === 'ZMO V') //filtrar buses its Z67

// FILTRO DATOS SIRCI GENERAL, Z63 Y Z67
const datosSirci = datosGenerales.filter(item => item.system_name === 'IT-SIRCI') //filtrar buses sirci
console.log(datosSirci);
const datosSirciZ63 = datosSirci.filter(item => item.uf_code === 'ZMO III') //filtrar buses its Z63
const datosSirciZ67 = datosSirci.filter(item => item.uf_code === 'ZMO V') //filtrar buses its Z67

//const areaitbuses = [...datarigelits, ...datarigelsirci] //operador de propagación para fusionar objetos en JavaScript


    //funcion pintar tabla
  function generateTableRows(data) {
  return data.map((item, index) => `
    <tr>
      <td> ${index + 1} </td>
      <td> ${item.system_name} </td>
      <td> ${item.vehicle_code} </td>
      <td> ${item.issue_description} </td>
      <td> ${item.date_created} </td>
      <td> ${item.days_off} </td>
      <td> ${item.is_inmovilized_vehicle} </td>
      <td> ${item.current_status} </td>
    </tr>
  `).join('');
}

let bodyitsZ63 = generateTableRows(datosItsZ63);
let bodyitsZ67 = generateTableRows(datosItsZ67);
let bodysirciZ63 = generateTableRows(datosSirciZ63);
let bodysirciZ67 = generateTableRows(datosSirciZ67);
let bodytotal = generateTableRows(datosGenerales);
  
    
        //pintar data suma
        //crear array suma areas
            const arr = datosGenerales
            inoperativosSuma = arr.reduce( (acc, arr) => (acc[arr.system_name] = (acc[arr.system_name] || 0) + 1, acc), {} ); //genera objeto contador de areas y cantidades 
            clavecontadorareas = Object.keys(inoperativosSuma) // extraer solo nombre de area
            valorcontadorareas = Object.values(inoperativosSuma) // extraer solo valor de area

        let bodysuma = ''
        
        for (let i = 0; i < clavecontadorareas.length; i++){
          console.log(clavecontadorareas[i])
              bodysuma += `
                <tr>
                  <td> ${i + 1} </td>
                  <td> ${ clavecontadorareas[i] } </td>
                  <td> ${ valorcontadorareas[i] } </td>
                </tr>
              `
        };
      

//pintar datos en el html
  //datos ITS
  document.getElementById("dataitsZ63").innerHTML = bodyitsZ63; //para pintar datos en html
  document.getElementById("dataitsZ67").innerHTML = bodyitsZ67 //para pintar datos en html
  //datos SIRCI
  document.getElementById("datasirciZ63").innerHTML = bodysirciZ63 //para pintar datos en html
  document.getElementById("datasirciZ67").innerHTML = bodysirciZ67 //para pintar datos en html
  
  //pintar otro datos
   //document.getElementById("datasirci").innerHTML = bodysirci //para pintar datos en html
   document.getElementById("datatotal").innerHTML = bodytotal //para pintar datos en html
   document.getElementById("datasuma").innerHTML = bodysuma //para pintar datos en html
 document.getElementById("loader").style.display = "none"; //para ocultar loader al cargar pagina web
}
