class Canvas {
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
}

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
onmessage = (e) => {
    let startTime = new Date().getTime();
    let processedPixels = 0;
    let spheres = e.data.spheres;
    let cameraPosition = e.data.cameraPosition;
    let processedData = [];
    for(let line = 0; line < e.data.workerDataArray.length; line++){
        var lineData = e.data.workerDataArray[line].lineData;
        let processedLineData = [];
        for(let colorIndex = 0; colorIndex < lineData.length; colorIndex++){
            let camVpDirection = lineData[colorIndex].camVpDirection;
            let ray = new Ray(cameraPosition, camVpDirection);
            let color = ray.TraceRay(1, Number.MAX_SAFE_INTEGER, spheres);
            processedLineData.push(color);
            processedPixels++;
        }
        processedData.push({lineIndex: e.data.workerDataArray[line].lineNumber, processedColors: processedLineData});
    }
    let endTime = new Date().getTime();
    console.log(`Worker index ${e.data.workerIndex} took ${endTime-startTime}ms to process ${processedPixels}`);
    postMessage(processedData);
}