
class Object3D {
    /**
     * opts:
     *  - name: string
     *  - obj: arraybuffer data
     *  - textureImage: Image
     *  - initPosition: Vec3
     */
    constructor (gl, opts) {
        this.gl = gl;
        this.shaderProgram = opts.shaderProgram;

        this.name = opts.name;
        this.textureImage = opts.textureImage;
        this.initPosition = opts.initPosition;
        this.position = opts.initPosition;

        this.selectionColor = opts.selectionColor ?? vec4(0.0, 0.0, 0.0, 1.0);
        this.pickingToggle = opts.pickingToggle;

        const obj = opts.obj; // this.loadObj(opts.obj);
        this.indices = obj.indices;
        this.vertices = obj.vertices;
        this.normals = obj.normals;
        this.textureCoords = obj.textureCoords;

        this._updateTranslationMatrix();
    }

    updatePickingToggle(newToggle){
        this.pickingToggle = newToggle;
    }
    
    initGL() {
        // array element buffer
        this.iBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);
        
        // vertex array attribute buffer
        this.vBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
        
        //normals buffer
        this.vNormalsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vNormalsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);

        //texture coordinates buffer
        this.vTexCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vTexCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), this.gl.STATIC_DRAW);

        this.vPositionLoc = this.gl.getAttribLocation(this.shaderProgram, "vPosition");
        this.vNormalsLoc = this.gl.getAttribLocation(this.shaderProgram, "vNormals");
        this.vTexCoordLoc = this.gl.getAttribLocation(this.shaderProgram, "vTexCoord");

        this.selectionColorUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "sColor");
        this.textureUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "Tex0");
        this.pickingUniformLoc = this.gl.getUniformLocation(this.shaderProgram, "picking");

        // controls position of object
        this.translationMatrixLoc = this.gl.getUniformLocation(this.shaderProgram, "translationMatrix");
    }

    update() {
        // TODO: update various internal elements
        this._updateTranslationMatrix();
    }

    // TODO: render call
    render() {
        this.gl.uniformMatrix4fv(this.translationMatrixLoc, false, flatten(this.translationMatrix));

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.vBuffer );
        this.gl.vertexAttribPointer(this.vPositionLoc, 3, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray(this.vPositionLoc);
    
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vNormalsBuffer);
        this.gl.vertexAttribPointer(this.vNormalsLoc, 3, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray(this.vNormalsLoc);
    
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vTexCoordBuffer);
        this.gl.vertexAttribPointer(this.vTexCoordLoc, 2, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray(this.vTexCoordLoc);

        
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureImage);
        this.gl.uniform1i(this.textureUniformLoc, 0);
        
        this.gl.uniform4f(this.selectionColorUniformLoc, this.selectionColor[0], 
            this.selectionColor[1], this.selectionColor[2], this.selectionColor[3]);

        this.gl.uniform1i(this.pickingUniformLoc, this.pickingToggle);
    
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }

    setPosition(newPosition) {
        this.position = newPosition;
    }

    resetPosition() {
        this.position = this.initPosition;
    }

    _updateTranslationMatrix() {
        const [x, y, z] = this.position;
        this.translationMatrix = [
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, 1.0, 0.0],
            [x, y, z, 1.0],
        ];
    }
}
