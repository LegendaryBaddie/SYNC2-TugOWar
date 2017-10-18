
        "use strict";
        let socket;
        let canvas;
        let ctx;
        let lastKey;
        let keyBool = true;
        let gameOver = false;
        let waiting = true;
        let starting = false;
        let countdown = 3.0;
        let direction = {
            x:0,
            y:0,
            width:0,
            height:0,
            color:0,
        }

        const handleMessage = (data) => {
            direction.x = data.x;
            direction.y = data.y;
            direction.width = data.width;
            direction.height = data.height;
            direction.color = data.color;
            draw(data.pos)
        };

        const draw = (pos) => {
            //reset
            ctx.clearRect(0,0,800,300);
            
            //draw background
            ctx.fillStyle="#56b000";
            ctx.fillRect(0,0,800,300);
            ctx.fillStyle="#794c13";
            ctx.fillRect(350,0,100,300);
            
            //draw side
            ctx.fillStyle = direction.color;
            ctx.fillRect(direction.x,direction.y,direction.width,direction.height);
            ctx.fillStyle = "#000000";
            ctx.font = "50pt Erica One"
            ctx.fillText("YOU",direction.x+100, direction.y +150);

            //draw position
            ctx.fillRect(pos, 25, 20, 250);
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#FFFFFF";
            ctx.strokeRect(pos, 25, 20, 250);
            ctx.fillRect(pos+9.5, 50, 1, 200);

            //dim game add text
            if(waiting){
                ctx.fillStyle = "#000000";
                ctx.globalAlpha = 0.7;
                ctx.fillRect(0,0,800,300);
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#794c13";
                ctx.font = "35pt Erica One";
                ctx.fillText("Waiting for Opponent",125,150);
                ctx.strokeStyle = "#56b000";
                ctx.lineWidth = 3;
                ctx.strokeText("Waiting for Opponent",125,150);
            }
            if(starting){
                ctx.fillStyle = "#000000";
                ctx.globalAlpha = 0.7;
                ctx.fillRect(0,0,800,300);
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#794c13";
                ctx.font = "50pt Erica One";
                ctx.fillText("Start In:",250,100);
                ctx.fillText(`${countdown.toFixed(3)}`,300,200);
                ctx.strokeStyle = "#56b000";
                ctx.lineWidth = 3;
                ctx.strokeText("Start In:",250,100);
                ctx.strokeText(`${countdown.toFixed(3)}`,300,200);
            }
        };

        const setup = () => {
            canvas = document.querySelector('#main');
            ctx = canvas.getContext('2d');
            document.getElementById("main").addEventListener("onkeypress", keyCheck);
        };
        const startTime = () => {
            waiting = false;
            starting = true;
            let time = setInterval(()=>{
                draw();
                countdown -= 0.01;
                if(countdown<=0){
                    starting = false;
                    clearInterval(time);
                    draw(390);
                }
            }, 10); 
        };
        const resetKey = () => {
            keyBool = true;
        };
        const keyCheck = (e) => {
            if(!gameOver && !waiting && !starting){
                e = e || window.event;
                if(keyBool){
                    if(!lastKey){
                        if(e.keyCode === 37 || e.keyCode === 39){
                            socket.emit('move');
                            keyBool = false;
                            lastKey=e.key; 
                        }    
                    }else{
                        if((lastKey != e.keyCode) && (e.keyCode === 37 || e.keyCode === 39)){
                            socket.emit('move');
                            keyBool = false;
                            lastKey = e.keyCode;
                        }
                    } 
                }
            }
        };
        const win = () =>{
            ctx.fillStyle = "green";
            ctx.font = "bold 56px Arial";
            ctx.fillText("WIN!",canvas.width/2 -50, canvas.height/2);
        };

        const lose = () =>{
            ctx.fillStyle = "green";
            ctx.font = "bold 56px Arial";
            ctx.fillText("LOSE!",canvas.width/2 -50, canvas.height/2);
        };
    
        const init = () => {
            socket = io.connect();
            setup();
            socket.on('sideChosenWait', (data) => {
                handleMessage(data);
            });
            socket.on('start', () => {
                startTime();
            });
            socket.on('update', (data) => {
                draw(data.apos);
                console.log(data.apos);
            });
            socket.on('win', () =>{
                win();
                gameOver=true;
            });
            socket.on('lose', () =>{
                lose();
                gameOver=true;
            });
        };
        document.onkeydown = keyCheck;
        document.onkeyup = resetKey;
        window.onload = init;
