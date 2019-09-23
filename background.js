const canvas = document.getElementById('background');
const context = canvas.getContext('2d');
const backgroundColorInput = document.getElementById('background-color');
const radiusInput = document.getElementById('stars-radius');
const amountInput = document.getElementById('stars-amount');

let backgroundColor = "#eeeeee";
let radius = 2;
let pointsAmount = 10;

canvas.height = window.innerHeight / 2;
canvas.width = window.innerWidth

context.fillStyle = backgroundColor;

function generatePoints (pointsAmount) {
    return [...Array(+pointsAmount).keys()].map(item => {
        return ({
            x: (Math.random() - 0.5) * canvas.width,
            y: (Math.random() - 0.5) * canvas.height,
            vx: (Math.random()) * 10 + 2,
            vy: (Math.random()) * 10 + 2,
        })
    });
}

function compare (x, vx, min, max) {
    if(x >= max) {
        return max - 1;
    }

    if(x <= min) {
        return min + 1;
    }

    return x + vx;
}

let points = generatePoints(pointsAmount);

window.requestAnimationFrame(loop);

function padZeros(num, size) {
    if(num.length > 2) {
        return "ff";
    }

    let s = "0" + num;
    return s.substr(s.length - size);
}

function loop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    points = points.map(({ x, y, vx, vy }) => {
        context.fillStyle = `${backgroundColor}${padZeros((Math.round((70 / y) * 255)).toString(16), 2)}`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        const newX = compare(x, vx, 0, canvas.width)
        const newY = compare(y, vy, 0, canvas.height);

        if (y > 200 || x > canvas.width - 5){
            return ({
                x: Math.random() * canvas.width,
                y: (Math.random() - 0.5) * canvas.height,
                vx: Math.random() * 10 + 2,
                vy: Math.random() * 10 + 2,
            })
        }

        return {x: newX, y: newY, vx: vx, vy: vy}
    })

    window.requestAnimationFrame(loop);
}

backgroundColorInput.addEventListener('change', e => {backgroundColor = e.target.value});
radiusInput.addEventListener('change', e => {radius = e.target.value});
amountInput.addEventListener('change', e => {pointsAmount = e.target.value; points = generatePoints(pointsAmount)});