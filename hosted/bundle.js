
"use strict";

var socket = void 0;
var canvas = void 0;
var ctx = void 0;
var lastKey = void 0;
var keyBool = true;

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
    //draw side
    ctx.fillStyle = direction.color;
    ctx.fillRect(direction.x, direction.y, direction.width, direction.height);
    ctx.fillStyle = "#000000";
    //draw position
    ctx.fillRect(pos, 0, 100, 300);
};

var setup = function setup() {
    canvas = document.querySelector('#main');
    ctx = canvas.getContext('2d');
    document.getElementById("main").addEventListener("onkeypress", keyCheck);
};

var resetKey = function resetKey() {
    keyBool = true;
};

var keyCheck = function keyCheck(e) {
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
};
var win = function win() {
    ctx.fillStyle = "green";
    ctx.font = "bold 56px Arial";
    ctx.fillText("WIN!", canvas.width / 2 - 50, canvas.height / 2);
};

var lose = function lose() {
    ctx.fillStyle = "green";
    ctx.font = "bold 56px Arial";
    ctx.fillText("LOSE!", canvas.width / 2 - 50, canvas.height / 2);
};

var init = function init() {
    socket = io.connect();
    socket.on('sideChosen', function (data) {
        setup();
        handleMessage(data);
    });
    socket.on('update', function (data) {
        draw(data.apos);
        console.log(data.apos);
    });
    socket.on('win', function () {
        win();
    });
    socket.on('lose', function () {
        lose();
    });
};
document.onkeydown = keyCheck;
document.onkeyup = resetKey;
window.onload = init;
