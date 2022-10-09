const url = 'https://api-rigel.herokuapp.com'

//CODIGO PARA PINTAR DATOS EN HTML
fetch(url)
  .then(response => response.json())
  .then(data => mostrarData(data))
  .catch(error => console.log(error))

const mostrarData = (data) => {
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
  document.getElementById("data").innerHTML = body //para pintar datos en html
}
