function loadObj(obj) {
    const pieceObject = loadOBJFromBuffer(obj);

    const indices = pieceObject.i_verts;
    const vertices = pieceObject.c_verts;
    const textureCoords = pieceObject.c_uvt;
    const normals = pieceObject.c_norms;

    for(var i = 0; i < indices.length; i++){
        let v_index = 2 * indices[i];
        const uvt_index = 2 * pieceObject.i_uvt[i];
        
        textureCoords[v_index] = pieceObject.c_uvt[uvt_index];
        textureCoords[v_index + 1] = pieceObject.c_uvt[uvt_index + 1];

        v_index = 3 * indices[i];
        const norm_index = 3 * pieceObject.i_norms[i];

        normals[v_index] = pieceObject.c_norms[norm_index];
        normals[v_index + 1] = pieceObject.c_norms[norm_index + 1];
        normals[v_index + 2] = pieceObject.c_norms[norm_index + 2];
    }

    return {
        indices,
        vertices,
        normals,
        textureCoords
    }
}
