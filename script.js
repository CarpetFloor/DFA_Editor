let c = document.querySelector("canvas");
let r = c.getContext("2d");
c.width = window.innerWidth - 20;
c.height = window.innerHeight - 55;
const w = c.width;
const h = c.height;

let valueInputMode = false;
let placingMode = false;
let connectingMode = false;
// index of node at start of connection
let connectionStart = -1;
// index of node mouse is touching
let nodeTouching = -1;
let nodeLastTouched = -1;
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
    this.remainingValues = ["a", "b"];
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
document.getElementById("a").addEventListener("mousedown", function(){edgeValueClicked("a");});
document.getElementById("b").addEventListener("mousedown", function(){edgeValueClicked("b");});

function enterPlacingMode() {
    placingMode = true;
    
    c.style.cursor = "pointer";
}

function click() {
    if(!(valueInputMode)) {
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
            // make sure all of the edges haven't already been created
            if(nodes[nodeTouching].remainingValues.length > 0) {
                connectionStart = nodeTouching;
                connectingMode = true;
                nodeTouching = -1;
            }
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

            // finish connection
            if(canConnect) {
                nodeLastTouched = nodeTouching;

                let inputContainer = document.getElementById("edgeInputContainer");
                inputContainer.style.opacity = "0";
                inputContainer.style.display = "flex";

                if(nodes[connectionStart].remainingValues.includes("a")) {
                    document.getElementById("a").style.display = "block";
                }
                else {
                    document.getElementById("a").style.display = "none";
                }

                if(nodes[connectionStart].remainingValues.includes("b")) {
                    document.getElementById("b").style.display = "block";
                }
                else {
                    document.getElementById("b").style.display = "none";
                }
                
                // show value input
                const rect = c.getBoundingClientRect();
                inputContainer.style.left = `${
                    rect.left + mouse.x - (inputContainer.offsetWidth / 2)
                }px`;
                inputContainer.style.top = `${
                    rect.top + mouse.y + 40
                }px`;

                inputContainer.style.opacity = "1";

                valueInputMode = true;
            }
        }
        // cancel connecting mode if trying to connnect to not a node
        else if(connectingMode) {
            connectingMode = false;
            connectionStart = -1;
        }
    }
}

function edgeValueClicked(value) {
    if(valueInputMode) {
        nodes[connectionStart].remainingValues.splice(nodes[connectionStart].remainingValues.indexOf(value), 1);

        nodes[connectionStart].ends.push(nodeLastTouched);
        nodes[connectionStart].edges.push(value);

        connectingMode = false;
        nodeTouching = -1;
        connectionStart = -1;

        valueInputMode = false;

        document.getElementById("edgeInputContainer").style.display = "none";
    }
}


function loop() {
    r.clearRect(0, 0, w, h);

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

            // only detect touch if not all edges have been created yet
            if(touching(ref.x, ref.y, mouse.x, mouse.y, nodeDisplayProps.radius / 2)) {
                if(nodes[i].remainingValues.length > 0) {
                    nodeTouching = i;
                    c.style.cursor = "pointer";
                    touchingNode = true;
                    
                    break;
                }
            }
        }

        // just set default cursor here to avoid rapid flickering of setting cursor
        if(!(touchingNode)) {
            nodeTouching = -1;
            c.style.cursor = "default";
        }
    }

    // draw connection line preview, but only if not choosing edge value
    if(connectingMode && !(valueInputMode)) {
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
                const edgeValue = ref.edges[j];
                
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

                    // draw edge value

                    r.fillStyle = "black";
                    r.font = "20px Arial";
                    r.fillText(edgeValue, ref.x - 5, ref.y - (nodeDisplayProps.radius * 2) - 15);
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

                    // draw edge value

                    const target = nodes[ref.ends[j]];

                    // Coordinates of the edge endpoints
                    const x1 = ref.x;
                    const y1 = ref.y;
                    const x2 = target.x;
                    const y2 = target.y;

                    // Calculate midpoint
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;

                    // Calculate angle
                    const angle = Math.atan2(y2 - y1, x2 - x1);

                    r.save();
                    r.translate(midX, midY); // Move to midpoint
                    r.rotate(angle); // Rotate to align with the edge

                    // Offset slightly for better visibility
                    r.fillStyle = "black";
                    r.font = "20px Arial";
                    r.fillText(edgeValue, 0, -10); // Draw text slightly above the line

                    r.restore(); // Restore original state
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

        // highlight node if mouse is touching, but only if node doesn't already have all edges created
        if((i == nodeTouching) && (nodes[i].remainingValues.length > 0)) {
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