// Obtener una referencia al elemento canvas del DOM
const $grafica = document.querySelector("#grafica");
// Las etiquetas son las que van en el eje X. 
const etiquetas = ["Enero", "Febrero", "Marzo", "Abril"]
// Podemos tener varios conjuntos de datos. Comencemos con uno


//const url = 'http://localhost:5000'
const url = 'https://api-rigel.herokuapp.com'

//CODIGO PARA PINTAR DATOS EN HTML
fetch(url)
  .then(response => response.json())
  .then(data => mostrarDataTotal(data))
  .catch(error => console.log(error))

const mostrarDataTotal = (data) => {
    const inoperativosPorArea = data.reporteRigel.inoperativosSuma
    //console.log(data)
    console.log(inoperativosPorArea)

    for (const iterator of inoperativosPorArea) {
      const newData = `${iterator[0]} 👉 ${iterator[1]}`
      console.log(newData)
      $grafica.appendChild(newData)
    }


    const datosVentas2020 = {

  
      label: "Ventas por mes",
      data: [5000, 1500, 8000, 5102], // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas
      backgroundColor: 'rgba(54, 162, 235, 0.2)', // Color de fondo
      borderColor: 'rgba(54, 162, 235, 1)', // Color del borde
      borderWidth: 1,// Ancho del borde
  };
  new Chart($grafica, {
      type: 'line',// Tipo de gráfica
      data: {
          labels: etiquetas,
          datasets: [
              datosVentas2020,
              // Aquí más datos...
          ]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }],
          },
      }
  });


    //contar cuantos elementos hay de cada area: "system_name"
    // const arr = datarigel
    // console.log(arr)
    // var resultado = arr.reduce( (acc, arr) => (acc[arr.system_name] = (acc[arr.system_name] || 0) + 1, acc), {} );
    // console.log(resultado)

    // //filtrar area its en general
    // const datarigelits = datarigel.filter(item => item.system_name === 'IT-ITS')
    // const datarigelsirci = datarigel.filter(item => item.system_name === 'IT-SIRCI')
    // const areaitbuses = [...datarigelits, ...datarigelsirci] //operador de propagación para fusionar objetos en JavaScript
}

const datosVentas2020 = {

  
    label: "Ventas por mes",
    data: [5000, 1500, 8000, 5102], // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas
    backgroundColor: 'rgba(54, 162, 235, 0.2)', // Color de fondo
    borderColor: 'rgba(54, 162, 235, 1)', // Color del borde
    borderWidth: 1,// Ancho del borde
};
new Chart($grafica, {
    type: 'line',// Tipo de gráfica
    data: {
        labels: etiquetas,
        datasets: [
            datosVentas2020,
            // Aquí más datos...
        ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }],
        },
    }
});