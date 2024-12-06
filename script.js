let c = document.querySelector("canvas");
let r = c.getContext("2d");
c.width = window.innerWidth - 20;
c.height = window.innerHeight - 40;
const w = c.width;
const h = c.height;



function loop() {
    r.clearRect(0, 0, w, h)
    r.fillRect(0, 0, w, h);
}
window.setTimeout(loop, 1000 / 60);