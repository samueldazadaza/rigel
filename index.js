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


    //datosItsZ63
    let bodyitsZ63 = ''
    for (let i = 0; i < datosItsZ63.length; i++)
      {
      bodyitsZ63 += `
        <tr>
          <td> ${i + 1} </td>
          <td> ${datosItsZ63[i].system_name} </td>
          <td> ${datosItsZ63[i].vehicle_code} </td>
          <td> ${datosItsZ63[i].issue_description} </td>
          <td> ${datosItsZ63[i].date_created} </td>
          <td> ${datosItsZ63[i].days_off} </td>
          <td> ${datosItsZ63[i].is_inmovilized_vehicle} </td>
          <td> ${datosItsZ63[i].current_status} </td>
        </tr>
      `
      }

    //datosItsZ67
    let bodyitsZ67 = ''
    for (let i = 0; i < datosItsZ67.length; i++)
      {
      bodyitsZ67 += `
        <tr>
          <td> ${i + 1} </td>
          <td> ${datosItsZ67[i].system_name} </td>
          <td> ${datosItsZ67[i].vehicle_code} </td>
          <td> ${datosItsZ67[i].issue_description} </td>
          <td> ${datosItsZ67[i].date_created} </td>
          <td> ${datosItsZ67[i].days_off} </td>
          <td> ${datosItsZ67[i].is_inmovilized_vehicle} </td>
          <td> ${datosItsZ67[i].current_status} </td>
        </tr>
      `
      }

    //datossirciZ63
    let bodysirciZ63 = ''
    for (let i = 0; i < datosSirciZ63.length; i++)
      {
      bodysirciZ63 += `
        <tr>
          <td> ${i + 1} </td>
          <td> ${datosSirciZ63[i].system_name} </td>
          <td> ${datosSirciZ63[i].vehicle_code} </td>
          <td> ${datosSirciZ63[i].issue_description} </td>
          <td> ${datosSirciZ63[i].date_created} </td>
          <td> ${datosSirciZ63[i].days_off} </td>
          <td> ${datosSirciZ63[i].is_inmovilized_vehicle} </td>
          <td> ${datosSirciZ63[i].current_status} </td>
        </tr>
      `
      }

    //datossirciZ67
    let bodysirciZ67 = ''
    for (let i = 0; i < datosSirciZ67.length; i++)
      {
      bodysirciZ67 += `
        <tr>
          <td> ${i + 1} </td>
          <td> ${datosSirciZ67[i].system_name} </td>
          <td> ${datosSirciZ67[i].vehicle_code} </td>
          <td> ${datosSirciZ67[i].issue_description} </td>
          <td> ${datosSirciZ67[i].date_created} </td>
          <td> ${datosSirciZ67[i].days_off} </td>
          <td> ${datosSirciZ67[i].is_inmovilized_vehicle} </td>
          <td> ${datosSirciZ67[i].current_status} </td>
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
