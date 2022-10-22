//const url = 'http://localhost:5000'
const url = 'https://api-rigel.herokuapp.com'

//CODIGO PARA PINTAR DATOS EN HTML
fetch(url)
  .then(response => response.json())
  .then(data => mostrarDataTotal(data))
  .catch(error => console.log(error))

const mostrarDataTotal = (data) => {
    const datarigel = data.reporteRigel.inoperativos.data
    console.log(data)
    console.log(datarigel)
    //contar cuantos elementos hay de cada area: "system_name"
    const arr = datarigel
    console.log(arr)
    var resultado = arr.reduce( (acc, arr) => (acc[arr.system_name] = (acc[arr.system_name] || 0) + 1, acc), {} );
    console.log(resultado)

    //filtrar area its en general
    const datarigelits = datarigel.filter(item => item.system_name === 'IT-ITS')
    const datarigelsirci = datarigel.filter(item => item.system_name === 'IT-SIRCI')
    const areaitbuses = [...datarigelits, ...datarigelsirci] //operador de propagación para fusionar objetos en JavaScript

    //pintar data its
    let bodyits = ''
  for (let i = 0; i < datarigelits.length; i++){
    bodyits += `
      <tr>
        <td> ${i + 1} </td>
        <td> ${datarigelits[i].vehicle_code} </td>
        <td> ${datarigelits[i].system_name} </td>
        <td> ${datarigelits[i].issue_description} </td>
        <td> ${datarigelits[i].date_created} </td>
        <td> ${datarigelits[i].days_off} </td>
        <td> ${datarigelits[i].is_inmovilized_vehicle} </td>
      </tr>
    `
  }

      //pintar data sirci
      let bodysirci = ''
      for (let i = 0; i < datarigelsirci.length; i++){
        bodysirci += `
          <tr>
            <td> ${i + 1} </td>
            <td> ${datarigelsirci[i].vehicle_code} </td>
            <td> ${datarigelsirci[i].system_name} </td>
            <td> ${datarigelsirci[i].issue_description} </td>
            <td> ${datarigelsirci[i].date_created} </td>
            <td> ${datarigelsirci[i].days_off} </td>
            <td> ${datarigelsirci[i].is_inmovilized_vehicle} </td>
          </tr>
        `
      }

          //pintar data total
    let bodytotal = ''
    for (let i = 0; i < datarigel.length; i++){
      bodytotal += `
        <tr>
          <td> ${i + 1} </td>
          <td> ${datarigel[i].vehicle_code} </td>
          <td> ${datarigel[i].system_name} </td>
          <td> ${datarigel[i].issue_description} </td>
          <td> ${datarigel[i].date_created} </td>
          <td> ${datarigel[i].days_off} </td>
          <td> ${datarigel[i].is_inmovilized_vehicle} </td>
        </tr>
      `
    }

 //pintar data suma
/*
    let bodysuma = ''

    for (let i = 0; i < inoperativosSuma[0].length; i++){

      bodysuma += `

        <tr>

          <td> ${i + 1} </td>

          //<td> ${inoperativosSuma[0][i]} </td>

     



 

         



        </tr>

      `

    }



*/

          
  
  document.getElementById("dataits").innerHTML = bodyits //para pintar datos en html
  document.getElementById("datasirci").innerHTML = bodysirci //para pintar datos en html
  document.getElementById("datatotal").innerHTML = bodytotal //para pintar datos en html
  //document.getElementById("dataprueba").innerHTML = bodysuma //para pintar datos en html
}
