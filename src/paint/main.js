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
    angle: 0,
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

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderSheet();
}

function renderSheet() {
    ctx.fillStyle = sheet.color;

    ctx.fillRect(sheet.x, sheet.y, sheet.width * sheet.scale, sheet.height * sheet.scale);
}

render();

canvas.addEventListener('pointerdown', e => {
    mouseDown = { x: e.clientX - sheet.x, y: e.clientY - sheet.y };
});

canvas.addEventListener('pointerup', e => {
    mouseDown = null;
});

canvas.addEventListener('pointerleave', e => {
    mouseDown = null;
});

canvas.addEventListener('pointermove', e => {
    if (mouseDown) {
        sheet.x = e.clientX - mouseDown.x;
        sheet.y = e.clientY - mouseDown.y;
    }
    render();
});

canvas.addEventListener('wheel', e => {
    e.preventDefault();
    sheet.scale += e.wheelDelta * scrollSensitivity;
    // sheet.x = e.offestX + sheet.x;
    console.log(e);
    render();
});
