let c = document.querySelector("canvas");
let r = c.getContext("2d");
c.width = window.innerWidth - 20;
c.height = window.innerHeight - 55;
const w = c.width;
const h = c.height;

let placingMode = false;
let mouse = {
    x: -1, 
    y: -1, 
};
let nodeCount = 0;
let nodes = [];
/**
 * 
 * @param x The x position on the canvas the node is at.
 * @param y The y position on the canvas the node is at.
 * 
 * ends = nodes this node connects to
 * edge = characters that make up the edges
 * number = number of the node
 * start = the starting "-" node of the graph
 * final = the final "+" node of the graph
 */
function Node(x, y) {
    this.x = x;
    this.y = y;
    this.ends = [];
    this.edges = [];
    this.number = nodeCount;
    this.start = false;
    this.final = false;
}
const nodeProps = {
    radius: 40
};

function touching(x1, y1, x2, y2, radius) {
    const distanceSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;

    return (distanceSquared <= ((radius * 2) ** 2));
}

c.addEventListener("mousemove", (event) => {
    const rect = c.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});
c.addEventListener("mousedown", click);

function enterPlacingMode() {
    placingMode = true;
    
    c.style.cursor = "pointer";
}

function click() {
    if (placingMode) {
        // Check if the mouse position is too close to any existing node
        let canPlace = true;
        
        for (let i = 0; i < nodes.length; i++) {
            let ref = nodes[i];
            if (touching(ref.x, ref.y, mouse.x, mouse.y, nodeProps.radius)) {
                canPlace = false;
                break;
            }
        }

        if (canPlace) {
            ++nodeCount;
            nodes.push(new Node(mouse.x, mouse.y));
            c.style.cursor = "default";
            
            placingMode = false;
        }
    }
}

function loop() {
    r.clearRect(0, 0, w, h);

    // draw placing mode indicator
    if(placingMode) {
        r.beginPath();

        r.arc(
            mouse.x, 
            mouse.y, 
            nodeProps.radius, 
            0, 
            2 * Math.PI
        );

        r.fillStyle = "#e8f8f5";
        r.fill();
    }
    
    // draw nodes
    for(let i = 0; i < nodes.length; i++) {
        let ref = nodes[i];

        r.beginPath();
        
        r.arc(
            ref.x, 
            ref.y, 
            nodeProps.radius, 
            0, 
            2 * Math.PI
        );

        r.fillStyle = "#76d7c4";
        r.fill();

        r.lineWidth = 4;
        r.strokeStyle = "black";
        r.stroke();

        r.fillStyle = "black";
        r.font = "30px Arial";
        // offset of 8 to be just about center 30px font
        r.fillText(ref.number, ref.x - 8, ref.y + 8);
    }
}
window.setInterval(loop, 1000 / 30);