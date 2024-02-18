//const url3 = 'https://cute-gold-toad-vest.cyclic.app/'
//const url4 = 'https://api-rigel.herokuapp.com'

// video graficos chart https://www.youtube.com/watch?v=oFLnXT7D4gc
var xmlhttp = new XMLHttpRequest();
var url = 'https://cute-gold-toad-vest.cyclic.app/';
xmlhttp.open("GET", url, true);
xmlhttp.send();
xmlhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
        var data = JSON.parse(this.responseText);

        //data buses
        const arr = data.data
        inoperativosSuma = arr.reduce( (acc, arr) => (acc[arr.system_name] = (acc[arr.system_name] || 0) + 1, acc), {} ); //genera objeto contador de areas y cantidades
        //let inoperativosSuma2 = Object.entries(inoperativosSuma) //para convertir de objeto a array
        console.log(inoperativosSuma)

        let datoArea = Object.keys(inoperativosSuma); //generar array de solo cantidad de buses por area
        let datoCantidadArea = Object.values(inoperativosSuma); //generar array de solo nombre de area

        //anterior forma de mapear array de arrays
        // let datoArea = inoperativosSuma.map((dato) => {
        //     return dato[0]
        // });

        // let datoCantidadArea = inoperativosSuma.map((dato) => {
        //     return dato[1]
        // });

        // console.log(datoArea)
        // console.log(datoCantidadArea)

                    //🎃🎃CODIGO PARA PINTAR DATOS EN HTML
            const ctx = document.getElementById('myChart');

            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: datoArea,
                datasets: [{
                  label: 'Cantidad buses',
                  data: datoCantidadArea,
                  borderWidth: 1,
                  backgroundColor: "#ff335e"
                }]
              },
              options: {
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }
            });

        }
    }
