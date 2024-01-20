const refreshTimer = document.getElementById('refresh-timer');
const createSphereButton = document.getElementById('sphere-create-btn');
const performaceMeasurementText = document.getElementById(`performance-measurement`);
const canvas = document.getElementById(`myCanvas`);
class Color {
    constructor(r, g, b){
        this.r = r;
        this.g = g;
        this.b = b;
    }

    withColor(string){
        return `<span style="color: rgb(${this.r},${this.g},${this.b})">${string}</span>`
    }

    toRGB(){
        return `rgb(${this.r},${this.g}, ${this.b})`;
    }
}

class HtmlPixel {
    setColor(color){
        this.color = color;
    }
}

class ViewPort{
    constructor(width, height){
        this.distance = 1;
        this.width = width;
        this.height = height;
    }
}

class Grid {
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.colors = [];
        for(let i = 0; i <= this.height; i++){
            let line = [];
            for(let j = 0; j <= this.width; j++){
                line.push(new Color(0,0,0));
            }
            this.colors.push(line);
        }
    }

    setColor(x, y, color){
        this.colors[x][y] = color;
    }

    getColor(x,y){
        return this.colors[x][y];
    }

    DrawGrid(){
        let text = '';
        for(let i = 0; i < this.height; i++){
            for(let j = 0; j < this.width; j++){
                text += grid.getColor(i,j).withColor('@');
            }
            text += '</br>';
        }
        return text;
    }
}

class Scene {
    constructor(gameObjects){
        this.gameObjects = gameObjects;
    }

    AddGameObject(gameObject){
        this.gameObjects.Add(gameObject);
    }
}

class Sphere {
    constructor(center, radius, color){
        this.center = center;
        this.radius = radius;
        this.color = color;
    }
}

class Vector3 {
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    directionTowards(to){
        let deltaX = to.x - this.x;
        let deltaY = to.y - this.y;
        let deltaZ = to.z - this.z;
        return new Vector3(deltaX, deltaY, deltaZ);
    }

    dot(vector){
        return (this.x * vector.x) + (this.y * vector.y) + (this.z * vector.z);
    }
}

 class Camera {
    constructor(position, direction){
        this.position = position;
        this.direction = direction;
    }
}

class Canvas {
    constructor(grid){
        this.grid = grid;
    }

    drawPixel(x, y, color){
        let gridY = (this.grid.width/2) + x;
        let gridX = (this.grid.height/2) - y;
        grid.setColor(gridX, gridY, color);
    }

    drawPixelOnCanvas(x, y, color, canvasContext){
        let gridY = (this.grid.width/2) + x;
        let gridX = (this.grid.height/2) - y;
        canvasContext.fillStyle = color.toRGB();
        canvasContext.fillRect(gridY, gridX, 1, 1);
    }

    Draw(){
        return grid.DrawGrid();
    }

    ToViewPort(x,y,viewport){
        let Vx = x * (viewport.width/grid.width);
        let Vy = y * (viewport.height/grid.height);
        return new Vector3(Vx,Vy,viewport.distance)
    }
}

class Ray {
    constructor(startPos, direction){
        this.startPos = startPos;
        this.direction = direction;
    }

    TraceRay(tInitial, tFinal, spheres){
        let closest_t = Number.MAX_SAFE_INTEGER;
        let closest_sphere = null;
        spheres.forEach(sphere => {
            let results = this.IntersectRaySphere(sphere);
            let t1 = results[0];
            let t2 = results[1];
            if(t2 > tInitial && t2 < tFinal && t2 < closest_t){
                closest_t = t2;
                closest_sphere = sphere;
            }
            if(t1 > tInitial && t1 < tFinal && t1 < closest_t){
                closest_t = t1;
                closest_sphere = sphere;
            }

        });
        if(closest_sphere === null){
            return new Color(0,0,0);
        }
        return closest_sphere.color;
    }

    IntersectRaySphere(sphere){
        let r = sphere.radius;
        let c0 = sphere.center.directionTowards(this.startPos);

        let a = this.direction.dot(this.direction);
        let b = 2*this.direction.dot(c0);
        let c = (c0.dot(c0)) - r*r;

        let discriminant = b*b - 4*a*c;
        if(discriminant < 0) {
            return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
        }

        let t1 = (-b + Math.sqrt(discriminant*discriminant) / (2*a));
        let t2 = (-b - Math.sqrt(discriminant*discriminant) / (2*a));
        return [t1,t2];
    }
}


var width = 600;
var height = 300;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext("2d");
let grid = new Grid(width, height);
let canva = new Canvas(grid);
let camera = new Camera(new Vector3(0, 0, 0), new Vector3(0, 0, 1));
let timerInSeconds = 0;
let viewPort = new ViewPort(2,1);
let sphereRed = new Sphere(new Vector3(0,-1,3), 1, new Color(255,0,0));
let sphereBlue = new Sphere(new Vector3(2,0,4), 1, new Color(0,0,255));
let sphereGreen = new Sphere(new Vector3(0,0,4), 1, new Color(0,255,135));

let spheres = [sphereRed, sphereBlue, sphereGreen];
let fps = 30;
setInterval(() => { 
    let startTime = new Date().getTime();
    timerInSeconds ++;
    for(let x = -width/2; x < width/2; x++){
        for(let y = -height/2; y < height/2; y++){
            let vP = canva.ToViewPort(x, y, viewPort);
            let ray = new Ray(camera.position, camera.position.directionTowards(vP));
            color = ray.TraceRay(1, Number.MAX_SAFE_INTEGER, spheres);
            //canva.drawPixel(x, y, color);
            canva.drawPixelOnCanvas(x, y, color, context);
        }
    }

    //refreshTimer.innerHTML = `${canva.Draw()}`;
    let endTime = new Date().getTime();
    fps = 1000/(endTime-startTime);
    performaceMeasurementText.innerHTML = `Render Latency: ${endTime - startTime}ms - FPS: ${fps}`
  }, 1000/fps);
displaySphereList();


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
      let text = document.createTextNode(`Sphere radius ${spheres[i].radius}, center: (${spheres[i].center.x},${spheres[i].center.y}, ${spheres[i].center.z})`);
      div.appendChild(text);
      setButtonForX(i, div);
      setButtonForY(i, div);
      setButtonForZ(i, div);
      sphereUL.appendChild(node);
  }
}

function setButtonForX(index, div){
    let minusButton = document.createElement('button');
    let plusButton = document.createElement('button');
    let textNode = document.createElement('p');
    textNode.id = `sphere-${index}-x`;
    textNode.innerHTML = `${spheres[index].center.x}`;
    minusButton.innerHTML = `-`;
    plusButton.innerHTML = `+`;
    minusButton.onclick = function() {
      changeX(spheres[index], -1);
      }
    plusButton.onclick = function() {
      changeX(spheres[index], 1);
      }
      div.appendChild(minusButton);
      div.appendChild(textNode);
      div.appendChild(plusButton);
}

function setButtonForY(index, div){
    let minusButton = document.createElement('button');
    let plusButton = document.createElement('button');
    let textNode = document.createElement('p');
    textNode.classList.add(`sphere-${index}-y`);
    textNode.innerHTML = spheres[index].center.y;
    minusButton.innerHTML = `-`;
    plusButton.innerHTML = `+`;
    minusButton.onclick = function() {
      changeY(spheres[index], -1);
      }
    plusButton.onclick = function() {
      changeY(spheres[index], 1);
      }
      div.appendChild(minusButton);
      div.appendChild(textNode);
      div.appendChild(plusButton);
}

function setButtonForZ(index, div){
    let minusButton = document.createElement('button');
    let plusButton = document.createElement('button');
    let textNode = document.createElement('p');
    textNode.classList.add(`sphere-${index}-z`);
    textNode.innerHTML = spheres[index].center.z;
    minusButton.innerHTML = `-`;
    plusButton.innerHTML = `+`;
    minusButton.onclick = function() {
      changeZ(spheres[index], -1);
      }
    plusButton.onclick = function() {
      changeZ(spheres[index], 1);
      }
      div.appendChild(minusButton);
      div.appendChild(textNode);
      div.appendChild(plusButton);
}

function changeX(sphere, value){
    sphere.center.x += value;
}

function changeY(sphere, value){
    sphere.center.y += value;
}

function changeZ(sphere, value){
    sphere.center.z += value;
}

function createSliderFor(min, max, value, valueChangeFunc){
    var sliderDiv = document.createElement(`div`);
    sliderDiv.classList.add(`slider-container`);
    var slider = document.createElement(`input`);
    slider.classList.add(`slider-input`);
    sliderDiv.appendChild(slider);
    slider.type = `range`;
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.oninput = function() {
        valueChangeFunc();
    }
}
