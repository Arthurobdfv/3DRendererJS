const refreshTimer = document.getElementById('refresh-timer');

class Color {
    constructor(r, g, b){
        this.r = r;
        this.g = g;
        this.b = b;
    }

    withColor(string){
        return `<span style="color: rgb(${this.r},${this.g},${this.b})">${string}</span>`
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
        this.width = 1;
        this.height = 1;
    }
}

class Grid {
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.colors = [];
        for(let i = 0; i < this.height; i++){
            let line = [];
            for(let j = 0; j < this.width; j++){
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
                grid.setColor(i, j, new Color(i*(255/this.width), j*(255/this.height), 0));
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

class Vector3 {
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
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
}

let grid = new Grid(60, 60);
let camera = new Camera(new Vector3(0, 0, 0), new Vector3(0, 0, 1));
let timerInSeconds = 0;
let viewPort = new ViewPort(1,1);


setInterval(() => { 
    timerInSeconds ++;
    refreshTimer.innerHTML = `${grid.DrawGrid()}`;
  }, 1000/60);