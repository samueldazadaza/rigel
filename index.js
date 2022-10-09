const url = 'https://api-rigel.herokuapp.com'

//CODIGO PARA PINTAR DATOS EN HTML
fetch(url)
  .then(response => response.json())
  .then(data => mostrarDataIts(data))
  .then(data => mostrarDataSirci(data))
  .then(data => mostrarDataTotal(data))
  .catch(error => console.log(error))

const mostrarDataIts = (data) => {
    const datarigel = data.data.data
    const datarigelits = datarigel.filter(item => item.system_name === 'IT-ITS')
    const datarigelsirci = datarigel.filter(item => item.system_name === 'IT-SIRCI')
    const areaitbuses = [...datarigelits, ...datarigelsirci] //operador de propagación para fusionar objetos en JavaScript
  let body = ''
  for (let i = 0; i < datarigelits.length; i++){
    body += `
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
  document.getElementById("dataits").innerHTML = body //para pintar datos en html
}

const mostrarDataSirci = (data) => {
    const datarigel = data.data.data
    const datarigelits = datarigel.filter(item => item.system_name === 'IT-ITS')
    const datarigelsirci = datarigel.filter(item => item.system_name === 'IT-SIRCI')
    const areaitbuses = [...datarigelits, ...datarigelsirci] //operador de propagación para fusionar objetos en JavaScript
  let body = ''
  for (let i = 0; i < datarigelsirci.length; i++){
    body += `
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
  document.getElementById("datasirci").innerHTML = body //para pintar datos en html
}

const mostrarDataTotal = (data) => {
    const datarigel = data.data.data
    const datarigelits = datarigel.filter(item => item.system_name === 'IT-ITS')
    const datarigelsirci = datarigel.filter(item => item.system_name === 'IT-SIRCI')
    const areaitbuses = [...datarigelits, ...datarigelsirci] //operador de propagación para fusionar objetos en JavaScript
  let body = ''
  for (let i = 0; i < areaitbuses.length; i++){
    body += `
      <tr>
        <td> ${i + 1} </td>
        <td> ${areaitbuses[i].vehicle_code} </td>
        <td> ${areaitbuses[i].system_name} </td>
        <td> ${areaitbuses[i].issue_description} </td>
        <td> ${areaitbuses[i].date_created} </td>
        <td> ${areaitbuses[i].days_off} </td>
        <td> ${areaitbuses[i].is_inmovilized_vehicle} </td>
      </tr>
    `
  }
  document.getElementById("datatotal").innerHTML = body //para pintar datos en html
}

