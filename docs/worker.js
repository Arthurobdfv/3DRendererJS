class Canvas {
    constructor(width, height){
        this.width = width;
        this.height = height;
    }

    ToViewPort(x,y,viewport){
        let Vx = x * (viewport.width/this.width);
        let Vy = y * (viewport.height/this.height);
        return new Vector3(Vx,Vy,viewport.distance)
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
    let canvas = new Canvas(e.data.canvas.width, e.data.canvas.height)
    let processedData = [];
    for(let line = 0; (line+e.data.lineData.startLine) < e.data.lineData.endLine; line++){
        //var lineData = e.data.workerDataArray[line].lineData;
        let processedLineData = [];
        for(let colorIndex = 0; e.data.xData.xStart+colorIndex < e.data.xData.xEnd; colorIndex++){
            let x = e.data.xData.xStart+colorIndex;
            let y = e.data.yData.yStart+line;
            let vP = canvas.ToViewPort(x, y, e.data.viewport);
            let camVpDirection = new Vector3(vP.x- cameraPosition.x,vP.y- cameraPosition.y,vP.z- cameraPosition.z);
            //let camVpDirection = lineData[colorIndex].camVpDirection;
            let ray = new Ray(cameraPosition, camVpDirection);
            let color = ray.TraceRay(1, Number.MAX_SAFE_INTEGER, spheres);
            processedLineData.push(color);
            processedPixels++;
        }
        processedData.push({lineIndex: (line+e.data.lineData.startLine), processedColors: processedLineData});
    }
    let endTime = new Date().getTime();
    console.log(`Worker index ${e.data.workerIndex} took ${endTime-startTime}ms to process ${processedPixels}`);
    postMessage(processedData);
}