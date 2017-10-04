
        "use strict";
        let socket;
        let canvas;
        let ctx;
        let direction = {
            x:0,
            y:0,
            width:0,
            height:0,
            color:0,
        }

        const handleMessage = (data) => {
            direction.x = data.x;
            direciton.y = data.y;
            direction.width = data.width;
            direction.height = data.height;
            direction.color = data.color;
            draw(data.pos)
        };

        const draw = (pos) => {
            //draw side
            ctx.fillStyle = direction.color;
            ctx.fillRect(direction.x,direction.y,direction.width,direction.height);
            ctx.fillStyle = "#000000";
            //draw position
            ctx.fillRect(pos, 100, 200, 300);
        };

        const setup = () => {
            canvas = document.querySelector('#main');
            ctx = canvas.getContext('2d');
            document.onkeypress(keyCheck);
        };

        const keyCheck = () => {

        };

        const init = () => {
            socket = io.connect();
            socket.on('sideChosen', (data) => {
                handleMessage(data);
                setup();
            });
            socket.on('update', (data) => {
                draw(data.pos);
            });

            
        };
        
        window.onload = init;
