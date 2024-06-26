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
const datosIts = datosGenerales.filter(item => item.system_name === 'IT-ITS') //filtrar buses its
const datosSirci = datosGenerales.filter(item => item.system_name === 'IT-SIRCI') //filtrar buses sirci
//const areaitbuses = [...datarigelits, ...datarigelsirci] //operador de propagación para fusionar objetos en JavaScript


    //datosIts
    let bodyits = ''
  for (let i = 0; i < datosIts.length; i++){
    bodyits += `
      <tr>
        <td> ${i + 1} </td>
        <td> ${datosIts[i].system_name} </td>
        <td> ${datosIts[i].vehicle_code} </td>
        <td> ${datosIts[i].issue_description} </td>
        <td> ${datosIts[i].date_created} </td>
        <td> ${datosIts[i].days_off} </td>
        <td> ${datosIts[i].is_inmovilized_vehicle} </td>
        <td> ${datosIts[i].current_status} </td>
      </tr>
    `
  }

      //datosSirci
      let bodysirci = ''
      for (let i = 0; i < datosSirci.length; i++){
        bodysirci += `
          <tr>
            <td> ${i + 1} </td>
            <td> ${datosSirci[i].system_name} </td>
            <td> ${datosSirci[i].vehicle_code} </td>
            <td> ${datosSirci[i].issue_description} </td>
            <td> ${datosSirci[i].date_created} </td>
            <td> ${datosSirci[i].days_off} </td>
            <td> ${datosSirci[i].is_inmovilized_vehicle} </td>
            <td> ${datosSirci[i].current_status} </td>
          </tr>
        `
      }

      //datosTotal
      let bodytotal = ''
      for (let i = 0; i < datosGenerales.length; i++){
        bodytotal += `
          <tr>
            <td> ${i + 1} </td>
            <td> ${datosGenerales[i].system_name} </td>
            <td> ${datosGenerales[i].vehicle_code} </td>
            <td> ${datosGenerales[i].issue_description} </td>
            <td> ${datosGenerales[i].date_created} </td>
            <td> ${datosGenerales[i].days_off} </td>
            <td> ${datosGenerales[i].is_inmovilized_vehicle} </td>
            <td> ${datosGenerales[i].current_status} </td>
          </tr>
        `
      }

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
        }
      

//pintar datos en el html
  document.getElementById("dataits").innerHTML = bodyits //para pintar datos en html
  document.getElementById("datasirci").innerHTML = bodysirci //para pintar datos en html
  document.getElementById("datatotal").innerHTML = bodytotal //para pintar datos en html
  document.getElementById("datasuma").innerHTML = bodysuma //para pintar datos en html
  document.getElementById("loader").style.display = "none"; //para ocultar loader al cargar pagina web
}
