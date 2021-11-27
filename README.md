# Interactive 3D Chess for CS537

## Instructions
Run `python3 -m http.server` in project dir
open `localhost:8000` in browser

## TODO
- [x] create 64x64 array in Game
- [x] push objs to that array
- [x] move camera/rotation
- [x] define board (square)
- [x] texture
- [x] lighting
- [x] picking
- [x] resizable screen

## Rough Design
```
// js
Object.create
(gl, name, obj, image, initPos)
    loading the objs with correct order
    loading the image
    create gl texture
    
    createbuffers
    bind bufferse
    
Object.render
    bunch of things from assignment


// shader
light calculations

Object
{
    nmae:
    position:
    vertices
    normals:
    textCoords:
    textImage:

    // gl 
    4 buffers for above arrays
}


Game
{
    object[]

    8x8

    constructor() {
        initGL()
        objects.push(new Object("pawn", pawn.obj, pawn.png));
        objects.push(new Object("pawn", pawn.obj, pawn.png));
    }

    initGL() {
        MVMatrxi
        Projection
        setup shaders
        use program
    }

    render() {
        for all objects:
            render
    }
    
    add()
    remove()
    move()
}
```

