
        "use strict";
        let socket;
        let canvas;
        let ctx;
        let lastKey;
        let keyBool = true;

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
            //draw side
            ctx.fillStyle = direction.color;
            ctx.fillRect(direction.x,direction.y,direction.width,direction.height);
            ctx.fillStyle = "#000000";
            //draw position
            ctx.fillRect(pos, 0, 100, 300);
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
            e = e || window.event;
            if(keyBool){
                if(!lastKey){
                    if(e.key == "ArrowLeft" || "ArrowRight"){
                        socket.emit('move');
                        keyBool = false;
                        lastKey=e.key;
                    }    
                } else{
                    if((e.key!=lastKey)&& (e.key== "ArrowLeft" || "ArrowRight")){
                        socket.emit('move');
                        keyBool = false;
                        lastKey=e.key;
                        
                    }
                } 
            }
        }
          
        const init = () => {
            socket = io.connect();
            socket.on('sideChosen', (data) => {
                setup();
                handleMessage(data);
            });
            socket.on('update', (data) => {
                draw(data.pos);
            });
           
        };
        document.onkeydown = keyCheck;
        document.onkeyup = resetKey;
        window.onload = init;
