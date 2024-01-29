const refreshTimer = document.getElementById('refresh-timer');
const createSphereButton = document.getElementById('sphere-create-btn');
const performaceMeasurementText = document.getElementById(`performance-measurement`);
const canvas = document.getElementById(`myCanvas`);
import * as modules from "./modules/modules.js";

class WorkerData {
    constructor(camVpDirection){
        this.camVpDirection = camVpDirection;
    }
}

var width = 600;
var height = 300;
let numberOfWorkers = 6;
var workers = [];
for(let i=0; i< numberOfWorkers; i++){
    workers[i] = new Worker("worker.js");
}


canvas.width = width;
canvas.height = height;
var context = canvas.getContext("2d");
var data = context.createImageData(width, height);
let grid = new modules.Grid(width, height);
let canva = new modules.Canvas(grid);
let camera = new modules.Camera(new modules.Vector3(0, 0, 0), new modules.Vector3(0, 0, 1));
let timerInSeconds = 0;
let viewPort = new modules.ViewPort(2,1);
let sphereRed = new modules.Sphere(new modules.Vector3(0,-1,3), 1, new modules.Color(255,0,0));
let sphereBlue = new modules.Sphere(new modules.Vector3(2,0,4), 1, new modules.Color(0,0,255));
let sphereGreen = new modules.Sphere(new modules.Vector3(-2,0,4), 1, new modules.Color(0,255,135));
let loadPerWorker = grid.height / numberOfWorkers;


console.log(`Load per worker: ${loadPerWorker}`);
let spheres = [sphereRed, sphereBlue, sphereGreen];
let fps = 30;
setInterval(() => { 
    let startTime = new Date().getTime();
    timerInSeconds ++;
    let assignedWorker = 0;
    let lineData = [];
    let lineNumber = 0;
    let workerAssignedData = [];
    let promisses = [];
    let startIndex = 0;
    let endIndex = loadPerWorker;

    for(let worker = 0; worker < numberOfWorkers; worker++){
        startIndex = worker*loadPerWorker;
        endIndex = (worker+1)*loadPerWorker;
        let workerDataArray = {lineData: {startLine: startIndex, endLine: endIndex},spheres: spheres, cameraPosition: camera.position, xData: {xStart: -width/2, xEnd: width/2}, yData: {yStart: (-height/2)+startIndex, yEnd: (-height/2)+endIndex}, viewport: viewPort, canvas: {height, width}, workerIndex: worker};
        let promiseWorker = createWorker(workerDataArray, workers[worker]);
        promiseWorker.promise.then((individualData) => {
            for(let line = 0; line < individualData.length; line ++){
                canva.grid.colors[individualData[line].lineIndex] = individualData[line].processedColors;
            }
        });
        promisses.push(promiseWorker.promise);
    }
    Promise.all(promisses)
    .then(function(workerDataArray) {
        console.log(`Finished all promises`);
        // for(let i = 0; i < workerDataArray.length; i++){
        //     let individualData = workerDataArray[i];
        //     for(let line = 0; line < individualData.length; line ++){
        //         canva.grid.colors[individualData[line].lineIndex] = individualData[line].processedColors;
        //     }
        // }
        let renderStart = new Date().getTime();
        canva.gridToCanvasHex(context, data);
        let endTime = new Date().getTime();
        fps = 1000/(endTime-startTime);
        performaceMeasurementText.innerHTML = `setInterval Latency: ${endTime - startTime}ms / Worker data Prep Latency: ${dataPrep-startTime}ms / Promise waiting Latency : ${renderStart-dataPrep}ms / Render time: ${endTime-renderStart}ms - FPS: ${fps}`
    }).catch(function(error) {
        console.log(`Erro!`);
        console.log(error);
    });
    console.log("Started Data prep loop");
    // for(let y = -height/2; y < height/2; y++){
    //     for(let x = -width/2; x < width/2; x++){
    //         let vP = canva.ToViewPort(x, y, viewPort);
    //         let camVpDirection = camera.position.directionTowards(vP)
    //         let workerData = new WorkerData(camVpDirection);
    //         workerDataArray.push(workerData);
    //     }
        
    //     lineData.push({lineNumber: lineNumber, lineData: workerDataArray});
    //     if(lineData.length === loadPerWorker){
    //         workerAssignedData.push({ workerDataArray: lineData, spheres: spheres, cameraPosition: camera.position, workerIndex: assignedWorker });
    //         lineData = [];
    //         let promiseWorker = createWorker(workerAssignedData[assignedWorker], workers[assignedWorker]);
    //         promiseWorker.promise.then((individualData) => {
    //             for(let line = 0; line < individualData.length; line ++){
    //                 canva.grid.colors[individualData[line].lineIndex] = individualData[line].processedColors;
    //             }
    //         })
    //         promisses.push(promiseWorker.promise);
    //         assignedWorker++;
    //     }
    //     lineNumber++;
    // }
    console.log("Finished Data prep loop");
    let dataPrep = new Date().getTime();
    console.log("Finished Interval");
    //canva.gridToCanvas(context);

  }, 100);
displaySphereList();


function createWorker(i, worker) {
    return {promise: new Promise(function(resolve, reject) {
        worker.postMessage(i);
        worker.onmessage = function(event){
            // If you report errors via messages, you'd have a branch here for checking
            // for an error and either calling `reject` or `resolve` as appropriate.
            resolve(event.data);
        };
        // EITHER:
        worker.onerror = reject; // Rejects the promise if an error is raised by the web worker, passing along the ErrorEvent
        // OR:
        worker.onerror = function(event) {
            // Rejects the promise using the error associated with the ErrorEvent
            reject(event.error);
        };
    }), worker: worker};
}




createSphereButton.onclick = function() {
    spheres.push(new Sphere(new Vector3(0,0,2), 0.3, new Color(150,150,150)));
    displaySphereList();
}


function displaySphereList(){
    let sphereUL = document.getElementById('sphere-list');
    sphereUL.innerHTML = '';
    let list = '';
    for(let i = 0; i < spheres.length; i++){
      let node = document.createElement(`li`);
      let div = document.createElement('div');
      div.classList.add('sphere-details'); 
      node.appendChild(div);
      let text = document.createElement(`p`);
      text.id = `sphere-${i}-name`;
      text.innerHTML = `Sphere ${spheres[i].color.withColor(`color`)}`;
      div.appendChild(text);
      let centerPropsDisplay = document.createElement(`div`);
      centerPropsDisplay.classList.add(`sphere-center-props-display`);
      centerPropsDisplay.id = `sphere-${i}-center-props-display`;
      let centerLabel = document.createElement(`p`);
      centerLabel.innerHTML = `Center props:`
      centerPropsDisplay.appendChild(centerLabel);
      setButtonForX(i, centerPropsDisplay);
      setButtonForY(i, centerPropsDisplay);
      setButtonForZ(i, centerPropsDisplay);
      var radiusSlider = createSliderFor(1,20, spheres[i].radius * 10, function(value){
        value = value / 10;
        spheres[i].radius = value;
      },
      `slider-sphere-${i}-radius`,
      `Radius`,
      function(value) {
        return value / 10;
      });
      div.appendChild(centerPropsDisplay);
      div.appendChild(radiusSlider);
      appendColorPicker(i, div);
      sphereUL.appendChild(node);
  }
}

function appendColorPicker(index, div){
    let colorPickingDiv = document.createElement(`div`);
    let colorPickingText = document.createElement(`p`);
    colorPickingText.innerHTML = `Color Picker:`
    colorPickingDiv.appendChild(colorPickingText);
    colorPickingDiv.id = `sphere-${index}-color-picker`;
    let sliderR = createSliderFor(0, 255, spheres[index].color.r, function(value){
        spheres[index].color.r = value;
        document.getElementById(`sphere-${index}-name`).innerHTML = `Sphere ${spheres[index].color.withColor(`color`)}`;
    }, 
    `slider-sphere-${index}-colorpicker-r`,
    `R`);
    colorPickingDiv.appendChild(sliderR);

    let sliderG = createSliderFor(0, 255, spheres[index].color.g, function(value){
        spheres[index].color.g = value;
        document.getElementById(`sphere-${index}-name`).innerHTML = `Sphere ${spheres[index].color.withColor(`color`)}`;
    }, 
    `slider-sphere-${index}-colorpicker-g`,
    `G`);
    colorPickingDiv.appendChild(sliderG);

    let sliderB = createSliderFor(0, 255, spheres[index].color.b, function(value){
        spheres[index].color.b = value;
        document.getElementById(`sphere-${index}-name`).innerHTML = `Sphere ${spheres[index].color.withColor(`color`)}`;
    }, 
    `slider-sphere-${index}-colorpicker-b`,
    `B`);
    colorPickingDiv.appendChild(sliderB);
    div.appendChild(colorPickingDiv);
}

function setButtonForX(index, div){
    var slider = createSliderFor(-5, 5, spheres[index].center.x, function(value) {
        spheres[index].center.x = value;
    }, `slider-sphere-${index}-x`,
    'X')
    div.appendChild(slider);
}

function setButtonForY(index, div){
    var slider = createSliderFor(-5, 5, spheres[index].center.y, function(value) {
        spheres[index].center.y = value;
    }, `slider-sphere-${index}-y`,
    'Y')
    div.appendChild(slider);
}

function setButtonForZ(index, div){
    var slider = createSliderFor(-5, 5, spheres[index].center.z, function(value) {
        spheres[index].center.z = value;
    }, `slider-sphere-${index}-z`,
    'Z')
    div.appendChild(slider);
}

function createSliderFor(min, max, value, valueChangeFunc, identifier, fieldIdentifier, overrideValue = null){
    var sliderDiv = document.createElement(`div`);
    var sliderValueDisplay = document.createElement(`p`);
    sliderValueDisplay.id = `${identifier}`;
    sliderValueDisplay.innerHTML = `${fieldIdentifier}: ${overrideValue !== null ? overrideValue(value) : value}`;
    sliderDiv.classList.add(`slider-container`);
    var slider = document.createElement(`input`);
    slider.classList.add(`slider-input`);
    sliderDiv.appendChild(sliderValueDisplay);
    sliderDiv.appendChild(slider);
    slider.type = `range`;
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.oninput = function() {
        sliderValueDisplay.innerHTML = `${fieldIdentifier}: ${overrideValue !== null ? overrideValue(this.value) : this.value}`;
        valueChangeFunc(this.value);
    }
    return sliderDiv;
}
