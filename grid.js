module.exports = Grid;

export class Grid {
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

export class Scene {
    constructor(gameObjects){
        this.gameObjects = gameObjects;
    }

    AddGameObject(gameObject){
        this.gameObjects.Add(gameObject);
    }
}

export class Vector3 {
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export class Camera {
    constructor(position, direction){
        this.position = position;
        this.direction = direction;
    }
}