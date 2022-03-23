namespace Background{

    let windowWidth =  Math.round(innerWidth);
    let windowHeight = Math.round(innerHeight);

    function getWindowSize(){
        windowWidth =  Math.round(innerWidth);
        windowHeight = Math.round(innerHeight);
    }

    addEventListener("resize", getWindowSize);
    setInterval(getWindowSize, 750);

    export abstract class Animation{
        private currentWidth = 0;
        private currentHeight = 0;

        private lastDrawTime:number|undefined;
        private fpsDelta = 0;
        private fpsTargetTime:number|undefined;

        private forceClear = false;

        readonly completedHandler = new General.EventHandler<Animation>()
        readonly canBeCompleted:boolean;
        readonly canvasClassName:string|undefined;

        constructor(canvasClassName:string|undefined, canBeCompleted:boolean, fpsTarget:number|undefined){
            this.canvasClassName = canvasClassName;
            this.canBeCompleted = canBeCompleted;
            this.setFpsTarget(fpsTarget);
        }

        resize(canvas:HTMLCanvasElement, context:CanvasRenderingContext2D, forceClear = false, fullscreen = true){
            forceClear = forceClear || this.forceClear;
            this.forceClear = false;
           
            if(fullscreen){
                this.currentWidth = windowWidth;
                this.currentHeight = windowHeight;
            }else{
                const size = canvas.getBoundingClientRect();
                this.currentWidth = Math.round(size.width);
                this.currentHeight = Math.round(size.height);
            }

            if(canvas.width !== this.currentWidth || canvas.height !== this.currentHeight){
                if(canvas.width !== this.currentWidth){
                    canvas.width = this.currentWidth;
                }

                if(canvas.height !== this.currentHeight){
                    canvas.height = this.currentHeight;
                }

                return true;
            }
            
            if(forceClear){
                context.clearRect(0, 0, this.currentWidth, this.currentHeight);
                return true;
            }

            return false;
        }

        draw(canvas:HTMLCanvasElement, context:CanvasRenderingContext2D, forceClear = false, fullscreen = true){
            const wasCleared = this.resize(canvas, context, forceClear, fullscreen);
            if(this.canvasClassName && !canvas.classList.contains(this.canvasClassName)){
                canvas.classList.add(this.canvasClassName);
            }
            return this.drawTo(context, this.currentWidth, this.currentHeight, wasCleared);
        }  
        
        drawTo(context:CanvasRenderingContext2D, width:number, height:number, wasCleared = false){
            const now = new Date().getTime();

            if(this.fpsTargetTime && this.lastDrawTime){
                if(this.fpsDelta + (now - this.lastDrawTime) < this.fpsTargetTime) return false;
                this.fpsDelta = (this.fpsDelta + now - this.lastDrawTime) % this.fpsTargetTime;
            }

            this.drawFrame(context, width, height, wasCleared, this.lastDrawTime === undefined ? undefined : now - this.lastDrawTime);
            this.lastDrawTime = now;
            return true;
        }

        getFpsTarget(){
            if(this.fpsTargetTime === undefined) return undefined;

            return 1000 / this.fpsTargetTime 
        }

        setFpsTarget(target:number|undefined){
            if(target === undefined){
                this.fpsTargetTime = undefined;
                return;
            }
            
            if(target <= 0) throw new Error("FPS target can't be zero or less!");
            this.fpsTargetTime = 1000 / target;
        }

        setCompleted(){
            this.completedHandler.fire(this);
        }

        reset(){
            this.fpsDelta = 0;
            this.lastDrawTime = undefined;
            this.forceClear = true;
        }

        protected abstract internalReset():void;

        protected abstract drawFrame(context:CanvasRenderingContext2D, width:number, height:number, wasCleared:boolean, delta:number|undefined):void;
    }
}