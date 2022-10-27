/// <reference path="General/EventHandler.ts" />
/// <reference path="General/Point2D.ts" />

/// <reference path="Input/MouseFinder.ts" />

/// <reference path="Libraries/Charts/PieChart.ts" />
/// <reference path="Libraries/ImageGallery.ts" />

/// <reference path="Background/Animation.ts" />
/// <reference path="Background/Maze.ts" />
/// <reference path="Background/Matrix.ts" />
/// <reference path="Background/ParticleEmitter.ts" />


function backgroundAnimation(){
    const backgrounds:Background.Animation[] = [
        new Background.Matrix(),
        new Background.Maze(),
        new Background.ParticleEmitter()
    ];
    
    let nextBackgroundIndex:number|undefined;
    let currentBackground = Math.floor(Math.random() * backgrounds.length);
    let currentBackgroundSince = new Date().getTime();

    function nextBackground(_?:Background.Animation){
        const nextBackground = nextBackgroundIndex ?? Math.floor(Math.random() * backgrounds.length);
        if(nextBackground !== currentBackground){
            if(nextBackgroundIndex === undefined && backgrounds[currentBackground]!.canBeEnded){
                backgrounds[currentBackground]!.endAnimation();
                nextBackgroundIndex = nextBackground;
            }else{
                nextBackgroundIndex = undefined;

                if(backgrounds[currentBackground]!.canvasClassName){
                    canvas.classList.remove(backgrounds[currentBackground]!.canvasClassName!);
                }
                currentBackground = nextBackground;
                backgrounds[currentBackground]!.reset();
            }
        }
        currentBackgroundSince = new Date().getTime();
    }

    for(let i = 0; i < backgrounds.length; i++){
        if(backgrounds[i]!.canBeCompleted || backgrounds[i]!.canBeEnded){
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

        if(!background.canBeCompleted && currentBackgroundSince + (nextBackgroundIndex === undefined ? 10000 : 30000) < now){
            nextBackground();
        }

        requestAnimationFrame(draw);
    }
    
    draw();
}

backgroundAnimation();

if(typeof window === "undefined"){
    console.log("window can't be undefined ;)")
}

/*const photographyGalleryContainer = document.getElementById("photography-gallery-container");
if(photographyGalleryContainer){
    const imageGallary = new Libraries.ImageGallary("/DotNet/wwwroot/jpg/full-size/", "/DotNet/wwwroot/jpg/", ".jpg", 39);
    photographyGalleryContainer.appendChild(imageGallary.element);
}*/