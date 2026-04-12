const canvas = $('#canvas');
const ctx = canvas.getContext('2d');

canvas.width = Math.min(window.innerWidth, 400);
canvas.height = Math.min(window.innerHeight, 400);

const scrollSensitivity = 0.001; // 0.001 normal

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
    }
};

let shapes = [];
/*
Shape: { c: Color, bg: Color }
- Line { p: Vec[] }
- Circle { p: Vec, r: number }

Vec: { x, y}
*/

let mouseDown = null;
let zoomDistance = null;

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderSheet();
}

function renderSheet() {
    ctx.fillStyle = sheet.color;

    ctx.fillRect(sheet.x, sheet.y, sheet.width * sheet.scale, sheet.height * sheet.scale);
}

function zoomSheet(x, y, factor) {
    sheet.scale += factor;
    sheet.x -= x * factor;
    sheet.y -= y * factor;

    // sheet.scale += factor;

    // const newWidth = sheet.width * sheet.scale;
    // const newHeight = sheet.height * sheet.scale;

    // const newX = sheet.x - (newWidth - sheet.width) * (x / sheet.width);
    // const newY = sheet.y - (newHeight - sheet.height) * (y / sheet.height);

    // sheet.width = newWidth;
    // sheet.height= newHeight;
    // sheet.x = newX;
    // sheet.y = newY;
}

render();

canvas.addEventListener('mousedown', e => {
    mouseDown = { x: e.clientX - sheet.x, y: e.clientY - sheet.y };
});

canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
        mouseDown = { x: e.touches[0].clientX - sheet.x, y: e.touches[0].clientY - sheet.y };
    }
    else {
        zoomDistance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
    }
});

canvas.addEventListener('mousemove', e => {
    if (mouseDown) {
        sheet.x = e.clientX - mouseDown.x;
        sheet.y = e.clientY - mouseDown.y;
    }
    render();
});

canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 1) {
        if (mouseDown) {
            sheet.x = e.touches[0].clientX - mouseDown.x;
            sheet.y = e.touches[0].clientY - mouseDown.y;
        }
        render();
    }
    else {
        const currentZoom = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
        const zoomDelta = currentZoom - zoomDistance;

        const { top, left } = canvas.getBoundingClientRect()

        const sheetX = (e.touches[0].clientX - left - sheet.x) / sheet.scale;
        const sheetY = (e.touches[0].clientY - top - sheet.y) / sheet.scale;
        const scaleFactor = zoomDelta * 0.01;

        zoomSheet(sheetX, sheetY, scaleFactor);

        render();
        zoomDistance = currentZoom;
    }
});

canvas.addEventListener('mouseup', () => {
    mouseDown = null;
});

canvas.addEventListener('mouseout', () => {
    mouseDown = null;
});

canvas.addEventListener('touchend', () => {
    mouseDown = null;
});

canvas.addEventListener('touchcancel', () => {
    mouseDown = null;
});

canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const sheetX = (e.offsetX - sheet.x) / sheet.scale;
    const sheetY = (e.offsetY - sheet.y) / sheet.scale;
    const scaleFactor = e.wheelDelta * scrollSensitivity;
    zoomSheet(sheetX, sheetY, scaleFactor);

    render();
});
