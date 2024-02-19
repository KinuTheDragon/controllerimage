const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let controllerScale = 0.4;

const INPUT_ORDER =
    ("a b x y dpad_up dpad_down dpad_left dpad_right lb rb lt rt " + 
     "left_stick_vertical left_stick_horizontal right_stick_vertical right_stick_horizontal view menu share").split(" ");

const imageNames = [
    "A",
    "arrows_horizontal",
    "arrows_vertical",
    "B",
    "base",
    "Dpad",
    "LB",
    "Left_Stick",
    "LT",
    "Menu",
    "RB",
    "Right_Stick",
    "RT",
    "Share",
    "View",
    "X",
    "Y"
];

const images = {};
let allLoaded = false;
for (let imageName of imageNames) {
    let img = new Image();
    img.src = `images/${imageName}.png`;
    images[imageName] = img;
}

Object.values(images).forEach(img => img.addEventListener("load", () => {
    allLoaded = Object.values(images).every(x => x.complete);
}));

function drawImageCentered(image, x, y, scale) {
    let width = image.width * scale;
    let height = image.height * scale;
    ctx.drawImage(
        image,
        x - width / 2,
        y - height / 2,
        width,
        height
    );
}

function drawImageRelativeToController(image, xp, yp, scale) {
    drawImageCentered(
        image,
        canvas.width / 2 + xp * controllerScale * images.base.width / 2,
        canvas.height / 2 + yp * controllerScale * images.base.height / 2,
        scale * controllerScale / 0.4
    );
}

function drawDpadGradient(xp, yp, xoff, yoff) {
    let size = images.base.width * 0.015 * controllerScale / 0.4;
    let radius = size / 4;
    let cx = canvas.width / 2 + controllerScale * xp * images.base.width / 2;
    let cy = canvas.height / 2 + controllerScale * yp * images.base.height / 2;
    ctx.beginPath();
    const gradient = ctx.createLinearGradient(cx + xoff * size / 2, cy + yoff * size / 2, cx - xoff * size / 2, cy - yoff * size / 2);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.roundRect(cx - size / 2, cy - size / 2, size, size, radius);
    ctx.fill();
}

function drawArrow(points) {
    let headLength = 10;
    ctx.strokeStyle = document.getElementById("color").value;
    ctx.lineJoin = "bevel";
    ctx.lineWidth = 2;
    ctx.beginPath();
    points = points.map(({x, y}) => ({x: canvas.width / 2 + controllerScale * x * images.base.width / 2, y: canvas.height / 2 + controllerScale * y * images.base.height / 2}));
    ctx.moveTo(points[0].x, points[0].y);
    for (let p of points.slice(1)) {
        ctx.lineTo(p.x, p.y);
    }
    let fromX = points.at(-2).x;
    let fromY = points.at(-2).y;
    let toX = points.at(-1).x;
    let toY = points.at(-1).y;
    let dx = toX - fromX;
    let dy = toY - fromY;
    let angle = Math.atan2(dy, dx);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function getLines(ctx, text, maxWidth) {
    let words = text.split(" ");
    let lines = [];
    let currentLine = words[0];
    for (let word of words.slice(1)) {
        let width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function drawText(text, xp, yp, anchor, maxWidthFunc) {
    let x = canvas.width / 2 + controllerScale * xp * images.base.width / 2;
    let y = canvas.height / 2 + controllerScale * yp * images.base.height / 2;
    ctx.fillStyle = document.getElementById("color").value;
    ctx.font = "12px Inter";
    ctx.textAlign = anchor;
    ctx.textBaseline = "middle";
    let maxWidth = (maxWidthFunc ?? (() => undefined))(x, y);
    let lines = getLines(ctx, text, maxWidth);
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + 12 * i);
    }
}

function main() {
    if (!allLoaded) return;
    controllerScale = document.getElementById("scale").value / 100;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImageCentered(images.base, canvas.width / 2, canvas.height / 2, controllerScale);
    let inputs = {};
    for (let input of document.querySelectorAll("input")) {
        inputs[input.id] = input.value;
    }
    if (inputs.a) {
        drawImageRelativeToController(images.A, 0.5, 0.05, 0.5);
        drawArrow([
            {x: 1, y: 0.05},
            {x: 0.6, y: 0.05}
        ]);
        drawText(inputs.a, 1.01, 0.05, "left", (x, y) => canvas.width - x);
    }
    if (inputs.b) {
        drawImageRelativeToController(images.B, 0.635, -0.14, 0.5);
        drawArrow([
            {x: 1, y: -0.14},
            {x: 0.75, y: -0.14}
        ]);
        drawText(inputs.b, 1.01, -0.14, "left", (x, y) => canvas.width - x);
    }
    if (inputs.x) {
        drawImageRelativeToController(images.X, 0.37, -0.13, 0.5);
        drawArrow([
            {x: 1, y: -0.5},
            {x: 0.37, y: -0.5},
            {x: 0.37, y: -0.25}
        ]);
        drawText(inputs.x, 1.01, -0.5, "left", (x, y) => canvas.width - x);
    }
    if (inputs.y) {
        drawImageRelativeToController(images.Y, 0.505, -0.32, 0.5);
        drawArrow([
            {x: 1, y: -0.32},
            {x: 0.6, y: -0.32}
        ]);
        drawText(inputs.y, 1.01, -0.32, "left", (x, y) => canvas.width - x);
    }
    if (inputs.dpad_up || inputs.dpad_down || inputs.dpad_left || inputs.dpad_right) {
        drawImageRelativeToController(images.Dpad, -0.24, 0.31, 1.05);
    }
    if (inputs.dpad_up) {
        drawDpadGradient(-0.24, 0.15, 0, -1);
        drawArrow([
            {x: -1, y: 0.5},
            {x: -0.4, y: 0.5},
            {x: -0.4, y: 0.15},
            {x: -0.3, y: 0.15}
        ]);
        drawText(inputs.dpad_up, -1.01, 0.5, "right", (x, y) => x);
    }
    if (inputs.dpad_down) {
        drawDpadGradient(-0.24, 0.47, 0, 1);
        drawArrow([
            {x: -1, y: 0.65},
            {x: -0.24, y: 0.65},
            {x: -0.24, y: 0.55}
        ]);
        drawText(inputs.dpad_down, -1.01, 0.65, "right", (x, y) => x);
    }
    if (inputs.dpad_left) {
        drawDpadGradient(-0.33, 0.31, -1, 0);
        drawArrow([
            {x: -1, y: 0.8},
            {x: -0.33, y: 0.8},
            {x: -0.33, y: 0.4}
        ]);
        drawText(inputs.dpad_left, -1.01, 0.8, "right", (x, y) => x);
    }
    if (inputs.dpad_right) {
        drawDpadGradient(-0.15, 0.31, 1, 0);
        drawArrow([
            {x: -1, y: 0.95},
            {x: -0.15, y: 0.95},
            {x: -0.15, y: 0.4}
        ]);
        drawText(inputs.dpad_right, -1.01, 0.95, "right", (x, y) => x);
    }
    if (inputs.lt) {
        drawImageRelativeToController(images.LT, -0.52, -0.88, 0.75);
        drawArrow([
            {x: -1, y: -0.88},
            {x: -0.65, y: -0.88}
        ]);
        drawText(inputs.lt, -1.01, -0.88, "right", (x, y) => x);
    }
    if (inputs.rt) {
        drawImageRelativeToController(images.RT, 0.52, -0.88, 0.75);
        drawArrow([
            {x: 1, y: -0.88},
            {x: 0.65, y: -0.88}
        ]);
        drawText(inputs.rt, 1.01, -0.88, "left", (x, y) => canvas.width - x);
    }
    if (inputs.lb) {
        drawImageRelativeToController(images.LB, -0.8, -0.7, 0.75);
        drawArrow([
            {x: -1, y: -0.7},
            {x: -0.95, y: -0.7}
        ]);
        drawText(inputs.lb, -1.01, -0.7, "right", (x, y) => x);
    }
    if (inputs.rb) {
        drawImageRelativeToController(images.RB, 0.8, -0.7, 0.75);
        drawArrow([
            {x: 1, y: -0.7},
            {x: 0.95, y: -0.7}
        ]);
        drawText(inputs.rb, 1.01, -0.7, "left", (x, y) => canvas.width - x);
    }
    if (inputs.left_stick_vertical || inputs.left_stick_horizontal) {
        drawImageRelativeToController(images.Left_Stick, -0.482, -0.11, 0.75);
    }
    if (inputs.left_stick_vertical) {
        drawImageRelativeToController(images.arrows_vertical, -0.482, -0.11, 0.75);
        drawArrow([
            {x: -1, y: -0.4},
            {x: -0.55, y: -0.4}
        ]);
        drawText(inputs.left_stick_vertical, -1.01, -0.4, "right", (x, y) => x);
    }
    if (inputs.left_stick_horizontal) {
        drawImageRelativeToController(images.arrows_horizontal, -0.482, -0.11, 0.75);
        drawArrow([
            {x: -1, y: -0.11},
            {x: -0.8, y: -0.11}
        ]);
        drawText(inputs.left_stick_horizontal, -1.01, -0.11, "right", (x, y) => x);
    }
    if (inputs.right_stick_vertical || inputs.right_stick_horizontal) {
        drawImageRelativeToController(images.Right_Stick, 0.2595, 0.31, 0.75);
    }
    if (inputs.right_stick_vertical) {
        drawImageRelativeToController(images.arrows_vertical, 0.2595, 0.31, 0.75);
        drawArrow([
            {x: 1, y: 0.6},
            {x: 0.35, y: 0.6}
        ]);
        drawText(inputs.right_stick_vertical, 1.01, 0.6, "left", (x, y) => canvas.width - x);
    }
    if (inputs.right_stick_horizontal) {
        drawImageRelativeToController(images.arrows_horizontal, 0.2595, 0.31, 0.75);
        drawArrow([
            {x: 1, y: 0.31},
            {x: 0.55, y: 0.31}
        ]);
        drawText(inputs.right_stick_horizontal, 1.01, 0.31, "left", (x, y) => canvas.width - x);
    }
    if (inputs.view) {
        drawImageRelativeToController(images.View, -0.125, -0.125, 0.4);
        drawArrow([
            {x: -1, y: -1},
            {x: -0.125, y: -1},
            {x: -0.125, y: -0.25}
        ]);
        drawText(inputs.view, -1.01, -1, "right", (x, y) => x);
    }
    if (inputs.menu) {
        drawImageRelativeToController(images.Menu, 0.15, -0.125, 0.4);
        drawArrow([
            {x: 1, y: -1},
            {x: 0.15, y: -1},
            {x: 0.15, y: -0.25}
        ]);
        drawText(inputs.menu, 1.01, -1, "left", (x, y) => canvas.width - x);
    }
    if (inputs.share) {
        drawImageRelativeToController(images.Share, 0.01, 0, 0.4);
        drawArrow([
            {x: 1, y: -1.3},
            {x: 0.01, y: -1.3},
            {x: 0.01, y: -0.1}
        ]);
        drawText(inputs.share, 1.01, -1.3, "share", (x, y) => canvas.width - x);
    }
}

setInterval(main, 1);

function updateCode() {
    let code = `${document.getElementById("color").value},${document.getElementById("scale").value},` +
        INPUT_ORDER.map(x => document.getElementById(x).value.replaceAll(",", "\1")).join(",").replaceAll(/,*$/g, "");
    code = [...pako.deflate(code)].map(x => String.fromCodePoint(x)).join("");
    document.getElementById("loadcode").innerText = btoa(code);
}
updateCode();

document.querySelectorAll("input").forEach(x => x.addEventListener("input", updateCode));

function loadFromCode(code) {
    if (!code) return;
    let decoded;
    try {
        decoded = pako.inflate([...atob(code)].map(x => x.codePointAt(0)), {to: "string"});
    } catch {
        return;
    }
    let numCommas = [...decoded.matchAll(",")].length;
    decoded += ",".repeat(INPUT_ORDER.length + 1 - numCommas);
    let parts = decoded.split(",");
    document.getElementById("color").value = parts[0];
    document.getElementById("scale").value = +parts[1];
    for (let i = 0; i < INPUT_ORDER.length; i++) {
        document.getElementById(INPUT_ORDER[i]).value = parts[i + 2];
    }
    updateCode();
}

function copy(text) {
    navigator.clipboard.writeText(text);
}