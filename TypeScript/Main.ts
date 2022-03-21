/// <reference path="General/EventHandler.ts" />
/// <reference path="General/Point2D.ts" />

/// <reference path="Input/MouseFinder.ts" />

/// <reference path="Background/Animation.ts" />
/// <reference path="Background/Maze.ts" />


Input.pointerChanged.on(console.log);

function backgroundAnimation(){
    const backgrounds:Background.Animation[] = [
        new Background.Maze()
    ];
    
    const canvas = document.createElement("canvas");
    canvas.className = "background-animation";
    const context = canvas.getContext("2d");
    if(!context) return;

    document.body.appendChild(canvas);
    
    function draw(){
        backgrounds[0]!.draw(canvas, context!);
        requestAnimationFrame(draw);
    }
    
    draw();
}

backgroundAnimation();