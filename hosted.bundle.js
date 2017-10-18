
"use strict";

var socket = void 0;
var canvas = void 0;
var ctx = void 0;
var lastKey = void 0;
var keyBool = true;
var gameOver = false;
var waiting = true;
var starting = false;
var countdown = 3.0;
var direction = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: 0
};

var handleMessage = function handleMessage(data) {
    direction.x = data.x;
    direction.y = data.y;
    direction.width = data.width;
    direction.height = data.height;
    direction.color = data.color;
    draw(data.pos);
};

var draw = function draw(pos) {
    //reset
    ctx.clearRect(0, 0, 800, 300);

    //draw background
    ctx.fillStyle = "#56b000";
    ctx.fillRect(0, 0, 800, 300);
    ctx.fillStyle = "#794c13";
    ctx.fillRect(350, 0, 100, 300);

    //draw side
    ctx.fillStyle = direction.color;
    ctx.fillRect(direction.x, direction.y, direction.width, direction.height);
    ctx.fillStyle = "#000000";
    ctx.font = "50pt Erica One";
    ctx.fillText("YOU", direction.x + 100, direction.y + 150);

    //draw position
    ctx.fillRect(pos, 25, 20, 250);
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(pos, 25, 20, 250);
    ctx.fillRect(pos + 9.5, 50, 1, 200);

    //dim game add text
    if (waiting) {
        ctx.fillStyle = "#000000";
        ctx.globalAlpha = 0.7;
        ctx.fillRect(0, 0, 800, 300);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#794c13";
        ctx.font = "35pt Erica One";
        ctx.fillText("Waiting for Opponent", 125, 150);
        ctx.strokeStyle = "#56b000";
        ctx.lineWidth = 3;
        ctx.strokeText("Waiting for Opponent", 125, 150);
    }
    if (starting) {
        ctx.fillStyle = "#000000";
        ctx.globalAlpha = 0.7;
        ctx.fillRect(0, 0, 800, 300);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#794c13";
        ctx.font = "50pt Erica One";
        ctx.fillText("Start In:", 250, 100);
        ctx.fillText("" + countdown.toFixed(3), 300, 200);
        ctx.strokeStyle = "#56b000";
        ctx.lineWidth = 3;
        ctx.strokeText("Start In:", 250, 100);
        ctx.strokeText("" + countdown.toFixed(3), 300, 200);
    }
};

var setup = function setup() {
    canvas = document.querySelector('#main');
    ctx = canvas.getContext('2d');
    document.getElementById("main").addEventListener("onkeypress", keyCheck);
};
var startTime = function startTime() {
    waiting = false;
    starting = true;
    var time = setInterval(function () {
        draw();
        countdown -= 0.01;
        if (countdown <= 0) {
            starting = false;
            clearInterval(time);
            draw(390);
        }
    }, 10);
};
var resetKey = function resetKey() {
    keyBool = true;
};
var keyCheck = function keyCheck(e) {
    if (!gameOver && !waiting && !starting) {
        e = e || window.event;
        if (keyBool) {
            if (!lastKey) {
                if (e.keyCode === 37 || e.keyCode === 39) {
                    socket.emit('move');
                    keyBool = false;
                    lastKey = e.key;
                }
            } else {
                if (lastKey != e.keyCode && (e.keyCode === 37 || e.keyCode === 39)) {
                    socket.emit('move');
                    keyBool = false;
                    lastKey = e.keyCode;
                }
            }
        }
    }
};
var win = function win() {
    ctx.fillStyle = "green";
    ctx.font = "56pt Erica One";
    ctx.fillText("WIN!", canvas.width / 2 - 50, canvas.height / 2);
    ctx.strokeText("WIN!", canvas.width / 2 - 50, canvas.height / 2);
};

var lose = function lose() {
    ctx.fillStyle = "green";
    ctx.font = "56pt Erica One";
    ctx.fillText("LOSE!", canvas.width / 2 - 50, canvas.height / 2);
    ctx.strokeText("LOSE!", canvas.width / 2 - 50, canvas.height / 2);
};

var init = function init() {
    socket = io.connect();
    setup();
    socket.on('sideChosenWait', function (data) {
        handleMessage(data);
    });
    socket.on('start', function () {
        startTime();
    });
    socket.on('update', function (data) {
        draw(data.apos);
        console.log(data.apos);
    });
    socket.on('win', function () {
        win();
        gameOver = true;
    });
    socket.on('lose', function () {
        lose();
        gameOver = true;
    });
};
document.onkeydown = keyCheck;
document.onkeyup = resetKey;
window.onload = init;
