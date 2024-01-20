# 3DRendererJS
An study-project about 3D rendering using JS.
You can see the project running [**live here**](https://arthurobdfv.github.io/3DRendererJS/)

## :eyeglasses: Context
As I continue my journey throughout the game development area, one topic that is mandatory for learning is 3D Rendering. Studying this topic not only will enlight me on how things are rendered behind the scenes but will also allow me to use that knowledge to achieve better / stylized graphics and also improve performance on high-fidelity graphics.<br>
This repository contains my attempts to reproduce the topics I have learned while reading the book "Computer Graphics from scratch", by [Gabriel Gambetta](https://gabrielgambetta.com/)

## :rocket: The project  
The project is basically an implementation of a 3D renderer, we provide the application with a set of 3D objects that it should render and the software will build up the 3D scene and camera view so that those models can be seen in a 3D space. <br>
As mentioned on the Context section, I am following along a book, and each chapters of the book teaches a new "step" of the basic rendering pipeline, this project should implement all the chapters from the book, but I will be separating the implementation by chapters, so you can have a glimpse on how the renderer looked like at the end of each step. <br>
The book goes through 2 different rendering techniques, Raytracing and Rasterizing, each of those rendering techniques have multiple steps to achieve the end results. I will be separating the project in a way so you can see the two different implementations and each step of those as those are in the book.
### :space_invader: Implementation 
#### :gun: Raytracer
1. :heavy_check_mark: [Basic Raytracing Rendering](./README.md)
2. :construction: Adding Lights
3. :x: Shadows and Reflections
4. :x: Extending the Raytracer

#### :construction: Rasterizer
1. Lines
2. Filled Triangles
3. Shaded Triangles
4. Perspective Projection
5. Describing and Rendering a Scene
6. Clipping
7. Hidden Surface Removal
8. Shading
9. Textures
10. Extending the Rasterizer

:heavy_check_mark: - Implementation done <br>
:construction: - In development. <br>
:x: - Not yet implemented. <br>
