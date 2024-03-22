// Smithsonian Institution
// Washington, D.C.
// Office of the Chief Information Officer

// Requirements: Data.gov API Key - On-screen input field for API Key

// What does it do? 
// 1. Submits a user entered search string to Smithsonian's Open Access API. 
//    * The API responds with a JSON list of collection objects that are marked as CC0.
//    * Displays the image results in a grid.
// 2. Attempts to use ml5js.org image recognition library.
//    * Identifies objects within the images returned from the API.
//    * If a known object is found, a red bounding box and category is displayed.

// Overview:
// 1. preload() - Load ml5js objectDetector
// 2. setup() - setup canvas and input fields, wait for input.
// 3. getData() - Query the Smithsonian OA API at Data.gov.
// 4. processData() - Reads the JSON Response and saveImages() for each.
// 5. saveImages() - Builds an image array and sets position of images in grid.
// 6. displayObjects() - Tiggered at end of processData() and displays grid 
//    and detects objects in image.

// Data.gov - SI Open Access
let dataGov_url = "https://api.si.edu/openaccess/api/v1.0/";
let dataGov_endpt_stats = "stats";
let dataGov_endpt_search = "search";
let dataGov_param_search_word = "&q=";
let dataGov_param_search_visMat = ' AND online_visual_material:true';
let dataGov_param_rows = "&rows=50";
let dataGov_param_api_key = "?api_key=";
let dataGov_param_api_key_value = "Fbsy1tBcQaeYUuU58kXcyEmcHlMmrrB6iaaw1eLN";

let objects; // collection objects 
let edanId;  // EDAN is the name of the Smithsonian's Central collection object index.
let idsId;
let idsBaseUrl = 'https://ids.si.edu/ids/deliveryService'; // IDS = Image Delivery System.
let idsUrl;
let image_dataset = [];
let image_width_param = "&max=";
let image_width = 256;
let search;
let find_label = 'person';

// Create a ObjectDetector method
let objectDetector;
let img;
let logo;
let detectObjects;

//UI
let canvas;
let gridPosition_width;
let gridPosition_height;
let gridPosition_current_x = 0;
let gridPosition_current_y = 0;
let imageLabel;
let headerHeight = 110;
let margin_right = 5;


function preload() {
  // Load ml5.js Object Detection
  objectDetector = ml5.objectDetector('cocossd'); // cocossd or yolo
  console.log('Preload Object detection complete.');
} // preload

function setup() {

  //SI Logo header and footer in HTML, content generated from the following...
 // createCanvas(windowWidth, windowHeight);
 /* 
  let c = color(65, 80, 92);

  fill(0);
  textSize(15);
  textFont('Helvetica');

  //dataGov_param_api_key_value = createInput('1. Paste Data.gov Key');
  search = createInput('');
  search.position(20,50);
  describeElement('search', 'Enter a word or Phrase to search the Smithsonian Open Acess API at Data.gov.', LABEL);

  searchButton = createButton('Start Search');
  searchButton.position(search.x + search.width + margin_right,search.y); 
  searchButton.mousePressed(getData);

  resetButton = createButton('Reset Page');
  resetButton.position(searchButton.x + searchButton.width + margin_right,search.y); 
  resetButton.mousePressed(resetPage);

  detectObjects = createCheckbox('Use ml5 object detection', false);
  detectObjects.position(resetButton.x + resetButton.width + margin_right,search.y)
  */

 
  searchButton = select("#searchRequestButton");
  searchButton.mousePressed(getData);

} // setup

function resetPage() {
  objects = [];
  image_dataset = [];
  removeElements();
}

function getData() {
  resetPage();
  
  search = document.getElementById("searchRequest").value;
  console.log("Searched: " + search);
  
  // Build loadJSON url
  let url = dataGov_url
  +dataGov_endpt_search
  +dataGov_param_api_key
  +dataGov_param_api_key_value
  +dataGov_param_rows
  +dataGov_param_search_word
  +search
  +dataGov_param_search_visMat;

  loadJSON(url,'json',function data(data){objects = data.response.rows;processData();},function error(err){console.log(err);});
} // end getData

function processData() {

  // let gridPosition_current_x = 0;
  // let gridPosition_current_y = 0;

  console.log("WindowWidth: " + windowWidth + " image_width: " + image_width + " obj len: " + objects.length);

  //canvas = createCanvas(windowWidth, image_width * objects.length);
  //resizeCanvas(1433, 2000);
  //canvas.parent('#collections');
  //console.log(objects);
  
  for (let i=0; i < objects.length; i++) {

    // We are only interested in collections that have online material (e.g., images...for now)
    if (objects[i].content.descriptiveNonRepeating.online_media) {

      // Unique Smithsonian ID for collection object 
      edanId = objects[i].content.descriptiveNonRepeating.record_ID;

      // Which museum, research facility, or other data source the information comes from.
      data_source = objects[i].content.descriptiveNonRepeating.data_source;

      // The title of the collection object.
      title = objects[i].content.descriptiveNonRepeating.title.content;

      // Roll through the collection object media array and save off just the image media.
      let media = objects[i].content.descriptiveNonRepeating.online_media.media;

      for (let om = 0; om < media.length; om++) {
        if (media[om].type == 'Images') {
          // console.log(media[om]);
          idsId = media[om].idsId;
          idsUrl = idsBaseUrl + "?id=" + idsId + image_width_param + image_width;
          //idsUrl.replace(max_regex,idsUrl)+image_width_param+image_width;
          

          saveImages(edanId,idsId,idsUrl,data_source,title);
        } 
      }
    }
  } // end of objects...

  // ok, at this point I have extracted all of the Smithsonian collection object IDs, 
  // image IDs (some objects have multiple images), and the image URLs in the array: image_dataset

  //clear();
  //text("Your Search Request: " + search,searchButton.x + searchButton.width + 5, 77);
  //console.log(image_dataset);
  console.log('Image Count:' + image_dataset.length);
  displayObjects();
} // end processData()

// Save the collections objects into array
function saveImages(edanId,idsId,idsUrl,data_source,title) {

// Save images with target label
image_dataset.push({'edanId':edanId,
  'idsId':idsId,
  'idsUrl':idsUrl,
  'data_source':data_source,
  'title':title
  // ,
  // 'gridPositionX':gridPosition_current_x,
  // 'gridPositionY':gridPosition_current_y
  }); //+image_width_param+image_width

// Control the grid position for each image.
// if (gridPosition_current_x < 6) {
//   gridPosition_current_x++;
// } else {
//   gridPosition_current_x = 0;
//   gridPosition_current_y++;
// }

// console.log(idsId, idsUrl, gridPosition_current_x, gridPosition_current_y);
//console.log(idsId, idsUrl);
}

function displayObjects() {

  // let gridPosition_width = round(windowWidth / 10);
  // let gridPosition_height = round(windowHeight / (image_dataset.length / 10));

  // console.log("Size:" + gridPosition_width + "," + gridPosition_height);

  // for every image...
  for (let od = 0; od < image_dataset.length; od++) {
              
    // Create a link to SI.edu to display the deatils about the collection object
    object_link = createA("https://www.si.edu/object/" + image_dataset[od].edanId, 
      "", "_blank");
    object_link.attribute("id", image_dataset[od].edanId);
    object_link.parent("collections_images");

    // Display the title of the object and what part of the Smithsonian the Object came from.
    object_title = createSpan(image_dataset[od].title);
    object_title.parent(image_dataset[od].edanId);
    
    // Display the title of the object and what part of the Smithsonian the Object came from.
    object_source = createSpan(image_dataset[od].data_source);
    object_source.parent(image_dataset[od].edanId);

    // Image is within the Link created above, the reference is the SI collection ID
    object_image = createElement("img");
    object_image.attribute("src",image_dataset[od].idsUrl);
    object_image.parent(image_dataset[od].edanId);

    // Load the image and store in a variable.
   /* img = loadImage(image_dataset[od].idsUrl, img => {    
              
              // Create a list to SI.edu to siplay the deatils about the collection object
              collections_link = createA("https://www.si.edu/object/" + image_dataset[od].edanId, 
                "", "_blank");
              collections_link.attribute("id", image_dataset[od].edanId);
              collections_link.parent("collections_images");

              // Image is within the Link created above, the reference is the SI collection ID
              collections_image = createElement("img");
              collections_image.attribute("src", );
              collections_image.parent(image_dataset[od].edanId);



                /*image(img, 
                image_width * image_dataset[od].gridPositionX,
                image_width * image_dataset[od].gridPositionY + headerHeight, //image_width * gridPosition_current_y,
                image_width,
                image_width
              );

                noFill();
                strokeWeight(1);
                stroke(100, 0, 0);
              // posiiton text
              text(
                  "("+image_dataset[od].gridPositionX+", "+image_dataset[od].gridPositionY+")",
                  image_width * image_dataset[od].gridPositionX + 5,
                  headerHeight + image_width * image_dataset[od].gridPositionY + 15,
                );*/

      // On successful load, start the object detector.
      /*if (detectObjects.checked()) {
      objectDetector.detect(img ,(err, res) => {
          if (err) {
              console.log(err);
            } else {


              imageLabel = "";

              for (var r = 0; r < res.length; r++) {

              console.log(image_dataset[od].idsUrl);
              console.log(res[r].label);

                noStroke();
                fill(220, 0, 0);

                text(
                  `${res[r].label} ${nfc(res[r].confidence * 100.0, 2)}%`,
                  image_dataset[od].gridPositionX * image_width + res[r].x + 5,
                  image_dataset[od].gridPositionY * image_width + res[r].y + 15 + headerHeight,
                );

                noFill();
                strokeWeight(4);
                stroke(220, 0, 0);

                rect(
                  image_dataset[od].gridPositionX * image_width + res[r].x, 
                  image_dataset[od].gridPositionY * image_width + res[r].y + headerHeight, 
                  res[r].width, 
                  res[r].height);
            }
          }
      });
    } // end detectObjects check

  }, err => {console.log(err);}); */
  } 


}
