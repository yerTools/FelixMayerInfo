namespace Background{
    export abstract class Animation{
        private currentWidth = 0;
        private currentHeight = 0;

        private lastDrawTime?:number;
        private fpsDelta = 0;
        private fpsTargetTime:number|undefined;

        constructor(fpsTarget:number|undefined){
            this.setFpsTarget(fpsTarget);
        }

        resize(canvas:HTMLCanvasElement, context:CanvasRenderingContext2D, forceClear = false){
            const size = canvas.getBoundingClientRect();
            this.currentWidth = Math.round(size.width);
            this.currentHeight = Math.round(size.height);

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

        draw(canvas:HTMLCanvasElement, context:CanvasRenderingContext2D, forceClear = false){
            const wasCleared = this.resize(canvas, context, forceClear);
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

        protected abstract drawFrame(context:CanvasRenderingContext2D, width:number, height:number, wasCleared:boolean, delta:number|undefined):void;
    }
}