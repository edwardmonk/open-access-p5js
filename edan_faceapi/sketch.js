// Data.gov - SI Open Accessx
let dataGov_url = "https://api.si.edu/openaccess/api/v1.0/";
let dataGov_endpt_stats = "stats";
let dataGov_endpt_search = "search";
let dataGov_parm_search_word = "&q=";
let dataGov_parm_api_key = "?api_key=";
let dataGov_parmVal_api_key = "7fh8iWoIhb6KPvrv9jd4YhalrobJAn4amKswNHFQ";
let dataGov_parm_rows = "&rows=25";
let dataGov_parm_search_visMat = ' AND online_visual_material:true AND online_media_type:Images';
//let dataGov_parm_search_visMat = ' AND online_visual_material:true AND online_media_type:Images';


let objects;
let edanId;
let idsId;
let idsBaseUrl = 'https://ids.si.edu/ids/deliveryService';
let idsUrl;
let image_dataset = [];
let image_width_parm = "&max=";
let image_width = 200;
let search;
let find_label = 'person';

// Create a ObjectDetector method
let faceDetector;
let img;

//UI
let gridPosition_width;
let gridPosition_height;
let gridPosition_current_x = 0;
let gridPosition_current_y = 0;
let imageLabel;

function preload() {
  // Load ml5.js FaceAPI
  const detectorOptions = {
    withLandmarks: true,
    withDescriptors: false,
    minConfidence: 0.5
  };
  faceDetector = ml5.faceApi(detectorOptions, console.log('MODEL LOADED!'));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220);
  search = createInput('');
  search.position(20,50);
  button = createButton('search');
  button.position(search.x + search.width, 50);
  button.mousePressed(getData);

} // fn

function getData() {
  // console.clear();

  // Build loadJSON url
  let url = dataGov_url
  +dataGov_endpt_search
  +dataGov_parm_api_key
  +dataGov_parmVal_api_key
  +dataGov_parm_rows
  +dataGov_parm_search_word
  +search.value()
  +dataGov_parm_search_visMat;

  console.log(url);

  loadJSON(url,'json',function data(data){objects = data.response.rows;processData();},function error(err){console.log(err);});
  //console.log(objects);
}

function processData() {
  image_dataset = [];

  let gridPosition_current_x = 0;
  let gridPosition_current_y = 0;
  resizeCanvas(windowWidth, image_width * objects.length);

  for (let i=0; i < objects.length; i++) {

    // We are only interested in colelctions that have online material (e.g., images...for now)
    if (objects[i].content.descriptiveNonRepeating.online_media) {
      edanId = objects[i].content.descriptiveNonRepeating.record_ID;
      
      // Roll throught the collection object media array
      let media = objects[i].content.descriptiveNonRepeating.online_media.media;

      for (let om = 0; om < media.length; om++) {
        if (media[om].type == 'Images') {
          // console.log(media[om]);
          idsId = media[om].idsId;
          idsUrl = idsBaseUrl + "?id=" + idsId + image_width_parm + image_width;
          //idsUrl.replace(max_regex,idsUrl)+image_width_parm+image_width;
          findFaces(edanId,idsId,idsUrl);

        //  saveImages(edanId,idsId,idsUrl);
        } 
      }
    }
  } // end of objects...

  // ok, at this point I have extracted all of the Smithsonian collection object IDs, 
  // image IDs (some objects have multiple images), and the image URLs in the array: image_dataset

  clear();
}

function findFaces(edanId,idsId,idsUrl) {


      // for every image...
  // for (let od = 0; od < image_dataset.length; od++) {
    
    // Load the image and store in a variable
    img = loadImage(idsUrl, img => {              
              

      // On successful load, start the object detector.
      faceDetector.detect(img ,(err, result) => {
          if (err) {
              console.log('Error!');
            } else {
              if(result != "") {
              console.log('Result!');
              console.log(idsUrl + " | " + result);
              saveImages(edanId,idsId,idsUrl,result,img);
            }
        }
      });
    });
  }

function saveImages(edanId,idsId,idsUrl,result,img) {
 // Save images with target label
          image_dataset.push({'edanId':edanId,
            'idsId':idsId,
            'idsUrl':idsUrl,
            'gridPositionX':gridPosition_current_x,
            'gridPositionY':gridPosition_current_y
          }); //+image_width_parm+image_width

          console.log(idsId, idsUrl, gridPosition_current_x, gridPosition_current_y);

              image(
              img, 
              image_width * image_dataset[sf].gridPositionX,
              image_width * image_dataset[sf].gridPositionY, //image_width * gridPosition_current_y,
              image_width,
              image_width
              );


         // Control the grid position for each image.
              if (gridPosition_current_x < 7) {
                gridPosition_current_x++;
              } else {
                gridPosition_current_x = 0;
                gridPosition_current_y++;
              }
}



              //   noFill();
              //   strokeWeight(1);
              //   stroke(255, 0, 0);
              // // posiiton text
              // text(
              //     "("+image_dataset[od].gridPositionX+", "+image_dataset[od].gridPositionY+")",
              //     image_width * image_dataset[od].gridPositionX + 5,
              //     image_width * image_dataset[od].gridPositionY + 15,
              //   );


               //   for (var r = 0; r < res.length; r++) {

            //   console.log(image_dataset[od].idsUrl);
            //   console.log(res[r].label);

            //     noStroke();
            //     fill(220, 0, 0);

            //     text(
            //       `${res[r].label} ${nfc(res[r].confidence * 100.0, 2)}%`,
            //       image_dataset[od].gridPositionX * image_width + res[r].x + 5,
            //       image_dataset[od].gridPositionY * image_width + res[r].y + 15,
            //     );

            //     noFill();
            //     strokeWeight(4);
            //     stroke(220, 0, 0);

            //     rect(
            //       image_dataset[od].gridPositionX * image_width + res[r].x, 
            //       image_dataset[od].gridPositionY * image_width + res[r].y, 
            //       res[r].width, 
            //       res[r].height);
            // }
