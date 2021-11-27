let game;
let canvas;

function setSize() {
    if (game) {
        game.width = window.innerWidth;
        game.height = window.innerHeight;
        game.updateViewport();
    }
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

async function init() {
    canvas = document.getElementById("gl-canvas");
    // const gl = WebGLUtils.setupWebGL(canvas);
    const gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"));
    if (!gl) {
        alert("WebGL isn't available");
    }

    const { width, height } = canvas;
    game = new Game(gl, { width, height });
    setSize();
    game.defineResources();
    await Resource.load();    
    game.init();
    game.initGL();

    canvas.addEventListener("mousedown", function (event) {
        game.setPickingToggle(1);
        game.update();
        game.render();

        var x = event.clientX;
        var y = canvas.height - event.clientY; // account for invereted coord system
    
        var data = new Uint8Array(4)
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);

        var r = Number((data[0]/255));
        var g = Number((data[1]/255));
        var b = Number((data[2]/255));
        var a = Number((data[3]/255));

        var color = vec4(r, g, b, a);
        console.log("picked", color);

        game.onObjectSelected(color);
        game.setPickingToggle(0);
    });

    document.getElementById("pickingToggle").onclick = function(){
        game.togglePicking();
    }

    render();
}

function render() {
    game.update();
    game.render();
    requestAnimFrame(render);
}

window.onload = init;
window.addEventListener("resize", setSize);
