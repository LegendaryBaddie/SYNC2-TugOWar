
        "use strict";
        let socket;
        let canvas;
        let ctx;
        let lastKey;
        let keyBool = true;
        let gameOver = false;

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
            ctx.fillStyle="#000000";
            ctx.fillRect(0,0,800,300);
            ctx.fillStyle="#FFFFFF";
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
        };

        const setup = () => {
            canvas = document.querySelector('#main');
            ctx = canvas.getContext('2d');
            document.getElementById("main").addEventListener("onkeypress", keyCheck);
        };

        const resetKey = () => {
            keyBool = true;
        }
        const keyCheck = (e) => {
            if(!gameOver){
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
        }
        const win = () =>{
            ctx.fillStyle = "green";
            ctx.font = "bold 56px Arial";
            ctx.fillText("WIN!",canvas.width/2 -50, canvas.height/2);
        }

        const lose = () =>{
            ctx.fillStyle = "green";
            ctx.font = "bold 56px Arial";
            ctx.fillText("LOSE!",canvas.width/2 -50, canvas.height/2);
        }
    
        const init = () => {
            socket = io.connect();
            socket.on('sideChosen', (data) => {
                setup();
                handleMessage(data);
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
