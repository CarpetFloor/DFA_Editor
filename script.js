let c = document.querySelector("canvas");
let r = c.getContext("2d");
c.width = window.innerWidth - 20;
c.height = window.innerHeight - 55;
const w = c.width;
const h = c.height;

let placingMode = false;
let connectingMode = false;
// index of node at start of connection
let connectionStart = -1;
// index of node mouse is touching
let nodeTouching = -1;
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
const nodeDisplayProps = {
    radius: 40, 
    connectionThick: 5, 
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
            if (touching(ref.x, ref.y, mouse.x, mouse.y, nodeDisplayProps.radius)) {
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
    // start of connect mode
    else if(!(connectingMode) && (nodeTouching != -1)) {
        connectionStart = nodeTouching;
        connectingMode = true;
        nodeTouching = -1;
    }
    // finish connect mode
    else if(connectingMode && (nodeTouching != -1)) {
        // don't allow creating a connection that already exists
        let canConnect = true;
        for(let i = 0; i < nodes[connectionStart].ends.length; i++) {
            if(nodes[connectionStart].ends[i] == nodeTouching) {
                canConnect = false;
                break;
            }
        }

        if(canConnect) {
            nodes[connectionStart].ends.push(nodeTouching);
            connectingMode = false;
            nodeTouching = -1;
            connectionStart = -1;
        }
    }
    // cancel connecting mode if trying to connnect to not a node
    else if(connectingMode) {
        connectingMode = false;
        connectionStart = -1;
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
            nodeDisplayProps.radius, 
            0, 
            2 * Math.PI
        );

        r.fillStyle = "#e8f8f5";
        r.fill();
    }
    // check for if hover over placed node so that when clicked enters connecting mode
    else {
        let touchingNode = false;

        for(let i = 0; i < nodes.length; i++) {
            let ref = nodes[i];

            if(touching(ref.x, ref.y, mouse.x, mouse.y, nodeDisplayProps.radius / 2)) {
                nodeTouching = i;
                c.style.cursor = "pointer";
                touchingNode = true;
                break;
            }
        }

        // just set default cursor here to avoid rapid flickering of setting cursor
        if(!(touchingNode)) {
            nodeTouching = -1;
            c.style.cursor = "default";
        }
    }

    // draw connection line preview
    if(connectingMode) {
        r.moveTo(
            nodes[connectionStart].x, 
            nodes[connectionStart].y
        )
        r.lineTo(
            mouse.x, 
            mouse.y
        );

        r.strokeStyle = "black";
        r.lineWidth = nodeDisplayProps.connectionThick;
        r.stroke();
    }
    
    // draw nodes
    for(let i = 0; i < nodes.length; i++) {
        let ref = nodes[i];

        // draw connections for node
        if(ref.ends.length > 0) {
            for(let j = 0; j < ref.ends.length; j++) {
                r.beginPath();
                
                // draw special connection line for going into itself
                if(ref.ends[j] == i) {
        
                    r.arc(
                        ref.x, 
                        ref.y - nodeDisplayProps.radius, 
                        nodeDisplayProps.radius, 
                        0, 
                        2 * Math.PI
                    );

                    r.strokeStyle = "black";
                    r.lineWidth = nodeDisplayProps.connectionThick;
                    r.stroke();
                }
                // regular line straight to other node
                else {
                    r.moveTo(ref.x, ref.y);
                    
                    r.lineTo(
                        nodes[ref.ends[j]].x, 
                        nodes[ref.ends[j]].y
                    );

                    r.strokeStyle = "black";
                    r.lineWidth = nodeDisplayProps.connectionThick;
                    r.stroke();
                }
            }
        }
        

        r.beginPath();
        
        r.arc(
            ref.x, 
            ref.y, 
            nodeDisplayProps.radius, 
            0, 
            2 * Math.PI
        );

        // highlight node if mouse is touching
        if(i == nodeTouching) {
            r.fillStyle = "#a3e4d7";
        }
        else {
            r.fillStyle = "#76d7c4";
        }

        // indicate if node is the start of a path being connected
        if(i == connectionStart) {
            r.fillStyle = "#85c1e9";
        }
        
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