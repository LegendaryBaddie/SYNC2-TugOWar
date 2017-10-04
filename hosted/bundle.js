
"use strict";

var socket = void 0;
var canvas = void 0;
var ctx = void 0;
var direction = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: 0
};

var handleMessage = function handleMessage(data) {
    direction.x = data.x;
    direciton.y = data.y;
    direction.width = data.width;
    direction.height = data.height;
    direction.color = data.color;
    draw(data.pos);
};

var draw = function draw(pos) {
    //draw side
    ctx.fillStyle = direction.color;
    ctx.fillRect(direction.x, direction.y, direction.width, direction.height);
    ctx.fillStyle = "#000000";
    //draw position
    ctx.fillRect(pos, 100, 200, 300);
};

var setup = function setup() {
    canvas = document.querySelector('#main');
    ctx = canvas.getContext('2d');
    document.onkeypress(keyCheck);
};

var keyCheck = function keyCheck() {};

var init = function init() {
    socket = io.connect();
    socket.on('sideChosen', function (data) {
        handleMessage(data);
        setup();
    });
    socket.on('update', function (data) {
        draw(data.pos);
    });
};

window.onload = init;
