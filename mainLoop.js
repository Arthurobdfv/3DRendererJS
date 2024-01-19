
class Grid {
    constructor(width, height){
        this.width = width;
        this.height = height;
    }

    DrawGrid(){
        let text = '';
        for(let i = 0; i < this.height; i++){
            for(let j = 0; j < this.width; j++){
                text += '@';
            }
            text += '\n';
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

function delayClear() {
    setTimeout(function() { clear(); }, 300000);
}

let count = 0;
var grid = new Grid(10, 10);
for(let i = 0; i < 1000; i){
    console.log(`</br> ${grid.DrawGrid()}`);
    setTimeout(() => console.clear(), 1000);
    count++;
}







