const urlParams = new URLSearchParams(window.location.search);
const template = urlParams.get('template') || 'wedding.svg';

const nameInput = document.getElementById('name');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const venueInput = document.getElementById('venue');
const fontSizeInput = document.getElementById('font-size');
const fontColorInput = document.getElementById('font-color');
const fontFamilyInput = document.getElementById('font-family');
const alignBtns = document.querySelectorAll('.align-btn');
const templatePreview = document.querySelector('.template-preview');
const downloadBtn = document.querySelector('.btn');

let textAlign = 'left';
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
templatePreview.appendChild(canvas);

const img = new Image();
img.src = `cards/${template}`;
img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    redrawCanvas();
};

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = fontColorInput.value;
    ctx.font = `${fontSizeInput.value}px ${fontFamilyInput.value}`;
    ctx.textAlign = textAlign;
    let x;
    if (textAlign === 'center') {
        x = canvas.width / 2;
    } else if (textAlign === 'right') {
        x = canvas.width - 50;
    } else {
        x = 50;
    }
    ctx.fillText(nameInput.value, x, 100);
    ctx.fillText(dateInput.value, x, 150);
    ctx.fillText(timeInput.value, x, 200);
    ctx.fillText(venueInput.value, x, 250);
}

nameInput.addEventListener('input', redrawCanvas);
dateInput.addEventListener('input', redrawCanvas);
timeInput.addEventListener('input', redrawCanvas);
venueInput.addEventListener('input', redrawCanvas);
fontSizeInput.addEventListener('input', redrawCanvas);
fontColorInput.addEventListener('input', redrawCanvas);
fontFamilyInput.addEventListener('input', redrawCanvas);

alignBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        alignBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        textAlign = btn.dataset.align;
        redrawCanvas();
    });
});

downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    html2canvas(templatePreview).then(canvas => {
        const link = document.createElement('a');
        link.download = 'invitation.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});