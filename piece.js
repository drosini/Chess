//Object File for New Pieces

class chessPiece {

    name;
    position;
    vertices;
    normals;
    texCoords;
    texture;

    //Constructor for new Chess Piece
    constructor(name, pos, ver, norm, texC, tex){
        this.name = name;
        this.position = pos;
        this.vertices = ver;
        this.normals = norm;
        this.texCoords = texC;
        this.texture = tex;
    }

    //Function to Move a Piece
    move(newPosition){
        this.position = newPosition;
    }

    
}