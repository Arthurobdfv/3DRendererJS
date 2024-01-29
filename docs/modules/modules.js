export class Color {
    constructor(r, g, b){
        this.r = r;
        this.g = g;
        this.b = b;
        this.hexCode = `0xFF${this.b.toString(16).toUpperCase().padStart(2, '0')}${this.g.toString(16).toUpperCase().padStart(2, '0')}${this.r.toString(16).toUpperCase().padStart(2, '0')}`;
    }

    withColor(string){
        return `<span style="color: rgb(${this.r},${this.g},${this.b})">${string}</span>`
    }

    toRGB(){
        return `rgb(${this.r},${this.g}, ${this.b})`;
    }
}

export class HtmlPixel {
    setColor(color){
        this.color = color;
    }
}

export class ViewPort{
    constructor(width, height){
        this.distance = 1;
        this.width = width;
        this.height = height;
    }
}

export class Grid {
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
        this.colors[y][x] = color;
    }

    getColor(x,y){
        try{
            
            let colorLine = this.colors[y];
            let colorFound = colorLine[x];
            return colorFound;
        }
        catch(error){
            console.log(error);
        }
        
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

export class Scene {
    constructor(gameObjects){
        this.gameObjects = gameObjects;
    }

    AddGameObject(gameObject){
        this.gameObjects.Add(gameObject);
    }
}

export class Sphere {
    constructor(center, radius, color){
        this.center = center;
        this.radius = radius;
        this.color = color;
    }
}

export class Vector3 {
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

export class Camera {
    constructor(position, direction){
        this.position = position;
        this.direction = direction;
    }
}

export class Canvas {
    constructor(grid){
        this.grid = grid;
    }

    drawPixel(x, y, color){
        let gridY = (this.grid.height/2) - y;
        let gridX = (this.grid.width/2) + x;
        grid.setColor(gridX, gridY, color);
    }

    drawPixelOnCanvas(x, y, color, canvasContext){
        let gridY = (this.grid.height/2) - y;
        let gridX = (this.grid.width/2) + x;
        canvasContext.fillStyle = toRGB(color);
        canvasContext.fillRect(gridX, gridY, 1, 1);
    }

    drawPixelOnCanvasHex(x, y, colorHex, bufferData){
        let gridY = (this.grid.height) - y;
        let gridX = x;
        var index = gridY*this.grid.height + gridX;
        bufferData[index] = colorHex;
    }

    Draw(){
        return grid.DrawGrid();
    }

    getColor(x , y) {
        let gridY = (this.grid.height/2) - y;
        let gridX = (this.grid.width/2) + x;
        if(gridX >= this.grid.colors[0].length){
            console.log('X is overflowing');
        }
        if(gridX < 0){
            console.log('X is underflowing');
        }        
        if(gridY >= this.grid.colors.length){
            console.log('Y is overflowing');
        }
        if(gridY < 0){
            console.log('Y is underflowing');
        }
        let colorFound = this.grid.getColor(gridX, gridY);
        return colorFound;
    }

    getColorHex(x, y){
        let gridY = (this.grid.height/2) - y;
        let gridX = (this.grid.width/2) + x;        
        let colorFound = this.grid.getColor(gridX, gridY);
        try {
            return `0xFF${colorFound.b.toString(16).toUpperCase().padStart(2, '0')}${colorFound.g.toString(16).toUpperCase().padStart(2, '0')}${colorFound.r.toString(16).toUpperCase().padStart(2, '0')}`

        }
        catch(e){
            console.log(`Error happenned on x${x},y${y} - gridY:${gridY}, gridX:${gridX}`);
        }
    }

    ToViewPort(x,y,viewport){
        let Vx = x * (viewport.width/this.grid.width);
        let Vy = y * (viewport.height/this.grid.height);
        return new Vector3(Vx,Vy,viewport.distance)
    }

    gridToCanvas(canvasContext) {
        for(let x = -this.grid.width/2; x < this.grid.width/2; x++){
            for(let y = -this.grid.height/2; y < this.grid.height/2; y++){
                let colorFound = this.getColor(x, y);
                this.drawPixelOnCanvas(x, y, colorFound, canvasContext);
            }
        }
    }

    gridToCanvasHex(context, imageData) {
        var bufferData = new Uint32Array(imageData.data.buffer);
        let idx = 0;
        for(let y = -this.grid.height/2; y < this.grid.height/2; y++){                
            for(let x = -this.grid.width/2; x < this.grid.width/2; x++){
                let colorFound = this.getColor(x, y);
                bufferData[idx++] = colorFound.hexCode;
                // this.drawPixelOnCanvasHex(x, y, colorFound, bufferData);
            }
        }
        context.putImageData(imageData, 0, 0);
    }
}


export class Ray {
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
        let c0 = new Vector3(this.startPos.x - sphere.center.x, this.startPos.y - sphere.center.y, this.startPos.z - sphere.center.z);
        let a = this.dot(this.direction, this.direction);
        let b = 2* (this.dot(c0, this.direction));
        let c = (this.dot(c0,c0)) - r*r;

        let discriminant = b*b - 4*a*c;
        if(discriminant < 0) {
            return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
        }

        let t1 = (-b + Math.sqrt(discriminant*discriminant) / (2*a));
        let t2 = (-b - Math.sqrt(discriminant*discriminant) / (2*a));
        return [t1,t2];
    }


    dot(vector1, vector2){
        return (vector1.x * vector2.x) + (vector1.y * vector2.y) + (vector1.z * vector2.z)
    }
}


export function toRGB(color){
    return `rgb(${color.r},${color.g}, ${color.b})`;
}