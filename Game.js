function ellipse() {
    const a = 60.0;
    const b = 50.0;
    const U = [0.0, 2.0, 1.0];
    const V = [1.0, 0.0, 0.0];
    const circlePoints = [];
    for (let i = 0; i <= 360; i += 0.01) {
        const point = [];

        point.push((a * Math.cos(i) * U[0]) + (b * Math.sin(i) * V[0]));
        point.push(80);
        point.push((a * Math.cos(i) * U[2]) + (b * Math.sin(i) * V[2]));

        circlePoints.push(vec3(point));
    }
    return circlePoints;
}

function configureTexture( gl, image ) {
    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	return texture;
}

class Game {
    /**
     * 
     * @param {*} gl WebGLContext
     * @param {*} opts 
     *  - width: number
     *  - height: number
     */
    constructor(gl, opts) {
        this.gl = gl;

        this.opts = opts;
        this.width = opts.width;
        this.height = opts.height;

        this.shaderProgram = initShaders(this.gl, "vertex-shader", "fragment-shader");
        this.modelViewMatrixLoc = this.gl.getUniformLocation(this.shaderProgram, "modelViewMatrix");
        this.projectionMatrixLoc = this.gl.getUniformLocation(this.shaderProgram, "projectionMatrix");

        this.pickingToggle = 0; // used to render picking color for one frame on mouse click
        this.pickingMode = 0; // controled by button
        
        // debug only
        this.camIndex = 0;
        this.camPoints = ellipse();

        // empty grid and board
        this.grid = Array(8);
        this.board = Array(8);
        for (let i = 0; i < 8; ++i) {
            this.grid[i] = Array(8).fill(undefined);
            this.board[i] = Array(8).fill(undefined);
        }
        
        // picking
        this.pickingColors = this.colorSet();
        this.pickingColorIndex = 0;
    }

    setPickingToggle(newToggle){
        this.pickingToggle = newToggle;
    }

    togglePicking(){
        if(this.pickingMode == 0){
            this.pickingMode = 1;
        } else {
            this.pickingMode = 0;
        }
    }

    getPickingMode() {
        return this.pickingToggle === 1 || this.pickingMode === 1 ? 1 : 0;
    }

    initGL() {
        this.gl.useProgram(this.shaderProgram);

        // clear stuff
        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);

        this.gl.enable(this.gl.DEPTH_TEST);
        //this.gl.enable(this.gl.CULL_FACE);

        // init inividual objects
        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 8; ++j) {
                const piece = this.grid[i][j];
                const tile = this.board[i][j];
                if (piece) piece.initGL();
                if (tile) tile.initGL();
            }
        }
    }

    updateViewport() {
        this.gl.viewport(0, 0, this.width, this.height);
    }

    init() {
        var image1 = document.getElementById("whiteTex");
        var image2 = document.getElementById("blackTex");

        this.whiteTexture = configureTexture(this.gl, image1);
        this.blackTexture = configureTexture(this.gl, image2);

        // create board
        for(let i = 0; i < 8; ++i) {
            for(let j = 0; j < 8; ++j) {
                const color = i % 2 === j % 2 ? "white" : "black";
                this.board[i][j] = new Object3D(this.gl, {
                    name: `board:${color}:${i}:${j}`,
                    shaderProgram: this.shaderProgram,
                    obj: Resource.get("board.obj"),
                    textureImage: color === "white" ? this.blackTexture : this.whiteTexture,
                    initPosition: vec3(0.0, 0.0, 0.0),
                    selectionColor: this.getPickingColor(),
                    pickingToggle: this.getPickingMode()
                });
            }
        }

        // util function to create piece by name
        const piece = (color, name) => {
            return new Object3D(this.gl, {
                name: `piece:${color}:${name}`,
                shaderProgram: this.shaderProgram,
                obj: Resource.get(name + ".obj"),
                textureImage: color === "black" ? this.blackTexture : this.whiteTexture,
                initPosition: vec3(0.0, 0.0, 0.0),
                selectionColor: vec4(0.0, 0.0, 0.0, 1.0), // will be updated later based on positon on board
                pickingToggle: this.getPickingMode()
            });
        };

        const black = (name) => piece("black", name);
        const white = (name) => piece("white", name);

        // opening position
        this.grid[0] = [black("rook"), black("knight"), black("bishop"), black("queen"), black("king"), black("bishop"), black("knight"), black("rook")];
        this.grid[1] = Array(8).fill(undefined).map(_ => black("pawn"));
        this.grid[6] = Array(8).fill(undefined).map(_ => white("pawn"));
        this.grid[7] = [white("rook"), white("knight"), white("bishop"), white("king"), white("queen"), white("bishop"), white("knight"), white("rook")];

        // update picking color for pieces
        for(let i = 0; i < 8; ++i) {
            for(let j = 0; j < 8; ++j) {
                if (this.grid[i][j]) {
                    this.grid[i][j].selectionColor = this.board[i][j].selectionColor;
                }
            }
        }  
    }

    update() {
        // camera
        const eye = this.camPoints[this.camIndex++];
        const at = vec3(0.0, 0.0, 0.0);
        const up = vec3(0.0, 1.0, 0.0);
        this.modelViewMat = lookAt(eye, at, up);
        this.projectionMat = perspective(90, this.width / this.height, 0.1, 1000.0);

        // update all pieces
        const spacing = 15;
        const offset = (8 * spacing) / 2;
        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 8; ++j) {
                const piece = this.grid[i][j];
                const tile = this.board[i][j];
                const x = (j * spacing) - offset;
                const z = (i * spacing) - offset;
                if (piece) {
                    piece.setPosition(vec3(x, 0.0, z));
                    piece.update();
                    piece.updatePickingToggle(this.getPickingMode());
                }
                if (tile) {
                    tile.setPosition(vec3(x, 0.0, z));
                    tile.update();
                    tile.updatePickingToggle(this.getPickingMode());
                }
            }
        }
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.uniformMatrix4fv(this.modelViewMatrixLoc, false, flatten(this.modelViewMat));
        this.gl.uniformMatrix4fv(this.projectionMatrixLoc, false, flatten(this.projectionMat));

        // render all pieces
        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 8; ++j) {
                const piece = this.grid[i][j];
                const tile = this.board[i][j];
                if (piece) piece.render();
                if (tile) tile.render();
            }
        }
    }

    defineResources() {
        Resource.define("rook.obj", "/assets/Rook.obj", loadObj);
        Resource.define("bishop.obj", "/assets/Bishop.obj", loadObj);
        Resource.define("knight.obj", "/assets/Knight.obj", loadObj);
        Resource.define("queen.obj", "/assets/Queen.obj", loadObj);
        Resource.define("king.obj", "/assets/King.obj", loadObj);
        Resource.define("pawn.obj", "/assets/Pawn.obj", loadObj);
        Resource.define("board.obj", "/assets/Board.obj", loadObj);
    }

    // prev selection will always be a piece
    // current selection may not always be a piece it can an empty tile
    onObjectSelected(color) {
        const selection = this.getTileByColor(color);
        if (!selection?.tile) {
            return;
        }

        console.log(this.grid[selection.i][selection.j]?.name);
        console.log(selection?.tile?.name);

        // select a piece
        if (!this.previousSelection) {
            if (this.grid[selection.i][selection.j]) {
                this.previousSelection = selection;
            }
            return;
        }

        const currentPiece = this.grid[selection.i][selection.j];
        if (currentPiece) {
            const previousPiece = this.grid[this.previousSelection.i][this.previousSelection.j];
            if (previousPiece.name.split(":")[1] === currentPiece.name.split(":")[1]) {
                console.log("illegal move");
                return;
            }
        }

        // target tile was selected
        this.grid[selection.i][selection.j] = this.grid[this.previousSelection.i][this.previousSelection.j];
        this.grid[selection.i][selection.j].selectionColor = this.board[selection.i][selection.j].selectionColor;
        this.grid[this.previousSelection.i][this.previousSelection.j] = undefined;
        this.previousSelection = undefined;
    }

    getTileByColor(color) {
        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 8; ++j) {
                const tile = this.board[i][j];
                if (tile) {
                    if (color.every((c, i) => c === tile.selectionColor[i])) {
                        return { tile, i, j };
                    }
                }
            }
        }
    }

    getPickingColor() {
        if (this.pickingColorIndex >= this.pickingColors.length) {
            this.pickingColorIndex = 0;
        }
        return this.pickingColors[this.pickingColorIndex++];
    }

    colorSet() {
        const colors = [];
        for (let i = 0; i < 255; i += 4) {
            const c = i / 255;
            colors.push(vec4(c, c, c, 1.0));
        }
        return colors;
    }
}