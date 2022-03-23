/// <reference path="General/EventHandler.ts" />
/// <reference path="General/Point2D.ts" />

/// <reference path="Input/MouseFinder.ts" />

/// <reference path="Background/Animation.ts" />
/// <reference path="Background/Maze.ts" />
/// <reference path="Background/Matrix.ts" />



Input.pointerChanged.on(console.log);

function backgroundAnimation(){
    const backgrounds:Background.Animation[] = [
        new Background.Matrix(),
        new Background.Maze()
    ];
    
    let currentBackground = Math.floor(Math.random() * backgrounds.length);
    let currentBackgroundSince = new Date().getTime();

    function nextBackground(_?:Background.Animation){
        const nextBackground = Math.floor(Math.random() * backgrounds.length);
        if(nextBackground !== currentBackground){
            if(backgrounds[currentBackground]!.canvasClassName){
                canvas.classList.remove(backgrounds[currentBackground]!.canvasClassName!);
            }
            currentBackground = nextBackground;
            backgrounds[currentBackground]!.reset();
        }
        currentBackgroundSince = new Date().getTime();
    }

    for(let i = 0; i < backgrounds.length; i++){
        if(backgrounds[i]!.canBeCompleted){
            backgrounds[i]!.completedHandler.on(nextBackground);
        }
    }

    const canvas = document.createElement("canvas");
    canvas.className = "background-animation";
    const context = canvas.getContext("2d");
    if(!context) return;

    document.body.appendChild(canvas);
    
    function draw(){
        const background = backgrounds[currentBackground]!
        background.draw(canvas, context!);

        const now = new Date().getTime();

        if(!background.canBeCompleted && currentBackgroundSince + 10000 < now){
            nextBackground();
        }

        requestAnimationFrame(draw);
    }
    
    draw();
}

backgroundAnimation();