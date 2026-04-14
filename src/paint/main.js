// setup canvas
const canvas = $('#canvas');
const ctx = canvas.getContext('2d');

canvas.width = Math.min(window.innerWidth - 40, 960);
canvas.height = Math.round(window.innerHeight - 200);

window.addEventListener('resize', () => {
    canvas.width = Math.min(window.innerWidth - 40, 960);
    canvas.height = Math.round(window.innerHeight - 200);

    render();
});

// constants
const debug = $('#debug');
const scrollSensitivity = 0.001; // 0.001 normal
const pointMergeDistance = 5; // in mm 

// define sheet object
const sheet = {
    width: 210,
    height: 297,
    x: 0,
    y: 0,
    internalScale: 1,
    color: 'white',

    set scale(newScale) {
        this.internalScale = Math.max(0.1, Math.min(newScale, 10));
    },
    get scale() {
        return this.internalScale;
    },

    render() {
        ctx.fillStyle = this.color;

        ctx.fillRect(this.x, this.y, this.width * this.scale, this.height * this.scale);

        debug.innerText = `Zoom: ${this.internalScale.toFixed(2)}x | X: ${this.x.toFixed(2)} | Y: ${this.y.toFixed(2)} | Sheet: ${sheet.width}mm x ${sheet.height}mm`;
    },

    getPointerPosition(canvasX, canvasY) {
        const sheetX = (canvasX - this.x) / this.scale;
        const sheetY = (canvasY - this.y) / this.scale;

        return { sheetX, sheetY };
    },

    zoom(x, y, factor) {
        this.scale += factor;
        this.x -= x * factor;
        this.y -= y * factor;

        // sheet.scale += factor;
        // const newWidth = sheet.width * sheet.scale;
        // const newHeight = sheet.height * sheet.scale;
        // const newX = sheet.x - (newWidth - sheet.width) * (x / sheet.width);
        // const newY = sheet.y - (newHeight - sheet.height) * (y / sheet.height);
        // sheet.width = newWidth;
        // sheet.height = newHeight;
        // sheet.x = newX;
        // sheet.y = newY;
    }
};

let shapes = [];
/*
Shape: { c: Color, bg: Color }
- Line { p: Vec[] }
- Circle { p: Vec, r: number }

Vec: { x, y}
*/

// setup modes for different usage
const modes = ['move', 'draw'];
let mode = 'move';

for (const mode of modes) {
    $('#' + mode + '-mode-button').addEventListener('click', () => changeMode(mode));
}

function changeMode(newMode) {
    newMode = modes.includes(newMode) ? newMode : modes[0];

    if (newMode !== mode) {
        $('#' + mode + '-mode-button').classList.remove('select');
    }
    $('#' + newMode + '-mode-button').classList.add('select');

    mode = newMode;
}

let pointerMove = null;
let zoomDistance = null;

let pointerDraw = null;

canvas.addEventListener('mousedown', e => {
    if (mode === 'move') {
        pointerMove = { x: e.clientX - sheet.x, y: e.clientY - sheet.y };
    }
    else if (mode === 'draw') {
        const position = sheet.getPointerPosition(e.offsetX, e.offsetY);
        pointerDraw = {
            line: 'black',
            fill: 'red',
            points: [{ x: position.sheetX, y: position.sheetY }],
        }
        render();
    }
});

canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
        pointerMove = { x: e.touches[0].clientX - sheet.x, y: e.touches[0].clientY - sheet.y };
    }
    else {
        zoomDistance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
    }
});

canvas.addEventListener('mousemove', e => {
    if (pointerMove) {
        sheet.x = e.clientX - pointerMove.x;
        sheet.y = e.clientY - pointerMove.y;
        render();
    }
    else if (pointerDraw) {
        const position = sheet.getPointerPosition(e.offsetX, e.offsetY);
        const lastPosition = pointerDraw.points[pointerDraw.points.length - 1];
        const lastPointDistance = Math.sqrt(Math.pow(position.sheetX - lastPosition.x, 2) + Math.pow(position.sheetY - lastPosition.y, 2));
        if (lastPointDistance < pointMergeDistance) {
            return;
        }

        pointerDraw.points.push({ x: position.sheetX, y: position.sheetY });
        render();
    }
});

canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 1) {
        if (pointerMove) {
            sheet.x = e.touches[0].clientX - pointerMove.x;
            sheet.y = e.touches[0].clientY - pointerMove.y;
        }
        render();
    }
    else {
        const currentZoom = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
        const zoomDelta = currentZoom - zoomDistance;

        const { top, left } = canvas.getBoundingClientRect();
        const { sheetX, sheetY } = sheet.getPointerPosition(e.touches[0].clientX - left, e.touches[0].clientY - top);

        const scaleFactor = zoomDelta * 0.01;

        sheet.zoom(sheetX, sheetY, scaleFactor);

        render();
        zoomDistance = currentZoom;
    }
});

canvas.addEventListener('mouseup', () => {
    pointerMove = null;
    if (pointerDraw) {
        shapes.push(pointerDraw);
        pointerDraw = null;
        render();
    }
});

canvas.addEventListener('mouseout', () => {
    pointerMove = null;
    if (pointerDraw) {
        shapes.push(pointerDraw);
        pointerDraw = null;
        render();
    }
});

canvas.addEventListener('touchend', () => {
    pointerMove = null;
});

canvas.addEventListener('touchcancel', () => {
    pointerMove = null;
});

canvas.addEventListener('wheel', e => {
    e.preventDefault();

    const { sheetX, sheetY } = sheet.getPointerPosition(e.offsetX, e.offsetY);
    const scaleFactor = e.wheelDelta * scrollSensitivity;

    sheet.zoom(sheetX, sheetY, scaleFactor);
    render();
});

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sheet.render();

    if (pointerDraw) {
        ctx.fillStyle = pointerDraw.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pointerDraw.points[0].x * sheet.scale + sheet.x, pointerDraw.points[0].y * sheet.scale + sheet.y);
        for (const point of pointerDraw.points) {
            ctx.lineTo(point.x * sheet.scale + sheet.x, point.y * sheet.scale + sheet.y);
        }
        ctx.stroke();
    }

    ctx.lineWidth = 1;
    for (const shape of shapes) {
        ctx.fillStyle = shape.line;
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x * sheet.scale + sheet.x, shape.points[0].y * sheet.scale + sheet.y);
        for (const point of shape.points) {
            ctx.lineTo(point.x * sheet.scale + sheet.x, point.y * sheet.scale + sheet.y);
        }
        ctx.stroke();
    }
}

render();
