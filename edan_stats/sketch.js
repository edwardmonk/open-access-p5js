//var url_stack = "https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=perl&site=stackoverflow";
//var local_stack = "stack.json"
//var local_open_access = "00.json"

// Data.gov - SI Open Accessx
var dataGov_url = "https://api.si.edu/openaccess/api/v1.0/";
var dataGov_endpt_stats = "stats"
var dataGov_endpt_search = "search"
var dataGov_parm_search_word = "&q="
var dataGov_parm_api_key = "?api_key="
var dataGov_parmVal_api_key = "7fh8iWoIhb6KPvrv9jd4YhalrobJAn4amKswNHFQ";

var objects;
var unit_labels = [[,]];
var unit_vals =[];

var chartColors = [
  'rgba(255, 99, 132, 0.5)',
  'rgba(54, 162, 235, 0.5)',
  'rgba(255, 206, 86, 0.5)',
  'rgba(75, 192, 192, 0.5)',
  'rgba(153, 102, 255, 0.5)',
  'rgba(255, 159, 64, 0.5)'
  ];

function preload() {
var path = dataGov_url+dataGov_endpt_stats+dataGov_parm_api_key+dataGov_parmVal_api_key;
  loadJSON(path,'json',function data(data){objects = data.response.units;},function error(err){console.log(err);});
}

function setup() {
    var ctx = createCanvas(100,100);
  background(220);
    for (var i=0; i < objects.length; i++) {
    //normalize the data with the map function.
    //fitValToScreen = map(objects[i].metrics.CC0_records,0,1000000,0,width);
    //unit_labels.push([objects[i].unit,objects[i].metrics.CC0_records,objects[i].metrics.CC0_records_with_CC0_media]);
    //unit_vals.push(objects[i].metrics.CC0_records);
    //var colorCrazy = "rgba("+ random(50,200) + "," + random(50,200) + ","+ random(50,200) + ", 0.5)";

    unit_vals.push([objects[i].unit,
      objects[i].metrics.CC0_records,
      objects[i].metrics.CC0_records_with_CC0_media,
      "#000"]);
    // var x = random(0,width);
    // var y = random(0,height);
    // circle(x,y,fitValToScreen)
    // text(objects[i].unit,x,y)
   }
   // The map method can extract a specific column from an array.
   // var col1 = unit_vals.map(function(value,index) { return value[0]; });
   //console.log(unit_vals);
   //console.log(objects);

   // Sort those CC0 counts
   unit_vals.sort((a,b) =>  b[1] - a[1]);
   console.log(chartColors.length);

   // Sets the bar colors for the newly sorted array
   var colorRotator = 0;
   for (var c=0; c < unit_vals.length; c++) {

      barColor = chartColors[colorRotator];
      unit_vals[c][3]=barColor;

      if (colorRotator < chartColors.length-1) {
        colorRotator++
      } else {
        colorRotator = 0;
      }
   }  

  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: unit_vals.map(function(value,index) { return value[0]; }),
        datasets: [{
            label: 'Number of CC0 Objects',
            data: unit_vals.map(function(value,index) { return value[1]; }),
            backgroundColor: unit_vals.map(function(value,index) { return value[3]; }),
            borderColor: unit_vals.map(function(value,index) { return value[3]; }),
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

function compareNumbers(a, b) {
  return a - b;
}

}