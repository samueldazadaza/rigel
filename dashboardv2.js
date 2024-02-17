//const url = 'https://cute-gold-toad-vest.cyclic.app/'
//const url = 'https://api-rigel.herokuapp.com'

// video graficos chart https://www.youtube.com/watch?v=oFLnXT7D4gc
var xmlhttp = new XMLHttpRequest();
var url = 'https://cute-gold-toad-vest.cyclic.app/';
xmlhttp.open("GET", url, true);
xmlhttp.send();
xmlhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
        var data = JSON.parse(this.responseText);
        
              //agregar data suma de areas
              const arr = datosGenerales
              console.log()
              let inoperativosSuma = arr.reduce( (acc, arr) => (acc[arr.system_name] = (acc[arr.system_name] || 0) + 1, acc), {} );
              let inoperativosSuma2 = Object.entries(inoperativosSuma)
              console.log(inoperativosSuma2)    
              //reporteRigel.inoperativosSuma = inoperativosSuma2

        // //data buses
        // inoperativosSuma = data.reporteRigel.inoperativosSuma

        // let datoArea = inoperativosSuma.map((dato) => {
        //     return dato[0]
        // });

        // let datoCantidadArea = inoperativosSuma.map((dato) => {
        //     return dato[1]
        // });

        // console.log(datoArea)
        // console.log(datoCantidadArea)

    //                 //🎃🎃CODIGO PARA PINTAR DATOS EN HTML
    //         const ctx = document.getElementById('myChart');

    //         new Chart(ctx, {
    //           type: 'bar',
    //           data: {
    //             labels: datoArea,
    //             datasets: [{
    //               label: 'cant. buses',
    //               data: datoCantidadArea,
    //               borderWidth: 1,
    //               backgroundColor: "#ff335e"
    //             }]
    //           },
    //           options: {
    //             scales: {
    //               y: {
    //                 beginAtZero: true
    //               }
    //             }
    //           }
    //         });

         }
  }


    //soto pru

//     const datosGenerales = dt.data;

// let areas = [];
// let counts = {};
// let i = 0;

// for (const area of datosGenerales){
//     areas = areas.concat(datosGenerales[i].system_name)
//     i++
// }

// for (const name of areas){
//     if (counts[name]){
//         counts[name]++
//     } else{
//         counts[name] = 1;
//     }
// }

// console.log(counts)

