/// <reference path="../Input/MouseFinder.ts" />

namespace Background{
    export class ParticleEmitter extends Animation{
        static colorCount = 32; 

        private readonly colors:[number, number, number, number][] = [];

        private readonly particles:{
            x:number,
            y:number

            velocityX:number,
            velocityY:number,
            velocityAngle:number,

            accelerationX:number,
            accelerationY:number,
            
            size:number,
            angle:number,
            
            lifetime:number,
            maximumLifetime:number
        }[][] = [];

        private currentParticleCount = 0;
        private stopped = false;

        constructor(fpsTarget?:number){
            super("particle-emitter-animation", false, true, fpsTarget);
        }

        protected drawFrame(context: CanvasRenderingContext2D, width: number, height: number, wasCleared: boolean, delta: number | undefined): void {
            while(this.colors.length < ParticleEmitter.colorCount){
                this.colors.push([
                    Math.floor(Math.random() * 256),
                    Math.floor(Math.random() * 256),
                    Math.floor(Math.random() * 256),
                    Math.round(Math.random() * 80 + 20) / 100
                ]);
            }

            const particleCount = this.stopped ? 0 : Math.ceil(width * height / 9000);

            while(this.currentParticleCount < particleCount){
                const color = Math.floor(Math.random() * this.colors.length);
                if(!this.particles[color]){
                    this.particles[color] = [];
                }

                const usePointerPosition = Input.pointerPosition && Math.random() < 0.7;

                this.particles[color]!.push({
                    accelerationX: 0,
                    accelerationY: 0,

                    lifetime: 0,
                    maximumLifetime: Math.floor(Math.random() * 100) / 10 + 2,

                    size: Math.floor(Math.random() * 16) + 3,
                    angle: Math.random() * 2 * Math.PI,

                    velocityX: Math.random() * 200 - 100,
                    velocityY: Math.random() * 200 - 100,
                    velocityAngle: Math.random() * 2 - 1,
                    
                    x: usePointerPosition ? Input.pointerPosition!.x * width + Math.random() * 120 - 60 : Math.random() * width,
                    y: usePointerPosition ? Input.pointerPosition!.y * height + Math.random() * 120 - 60 : Math.random() * height
                });

                this.currentParticleCount++;
            }

            if(!wasCleared){
                context.clearRect(0, 0, width, height);
            }

            if(delta === undefined){
                delta = 0.05;
            }else if(delta > 1000){
                delta = 1;
            }else{
                delta /= 1000;
            }


            for(let color = 0; color < this.particles.length; color++){
                if(!this.particles[color]) continue;
                
                const particles = this.particles[color]!;
                context.fillStyle = `rgba(${this.colors[color]![0]},${this.colors[color]![1]},${this.colors[color]![2]},${this.colors[color]![3]})`;

                for(let i = 0; i < particles.length; i++){
                    const particle = particles[i]!;

                    particle.lifetime += this.stopped ? 3 * delta : delta;

                    if(Input.pointerPosition){
                        let deltaX = particle.x / width - Input.pointerPosition.x;
                        let deltaY = particle.y / height - Input.pointerPosition.y;

                        if(deltaX < 0 && deltaX > -0.05){
                            deltaX = -0.05;
                        }else if(deltaX >= 0 && deltaX < 0.05){
                            deltaX = 0.05;
                        }

                        if(deltaY < 0 && deltaY > -0.05){
                            deltaY = -0.05;
                        }else if(deltaY >= 0 && deltaY < 0.05){
                            deltaY = 0.05;
                        }

                        particle.accelerationX = -0.001 * width *  1 / deltaX;
                        particle.accelerationY = -0.001 * height * 1 / deltaY;
                    }

                    particle.velocityX += particle.accelerationX * delta;
                    particle.velocityY += particle.accelerationY * delta;

                    particle.x += particle.velocityX * delta;
                    particle.y += particle.velocityY * delta;
                    particle.angle += particle.velocityAngle * delta;

                    if(particle.lifetime >= particle.maximumLifetime 
                    || particle.x + particle.size * 3 <= 0
                    || particle.x - particle.size >= width
                    || particle.y + particle.size * 3 <= 0
                    || particle.y - particle.size >= height){
                        particles.splice(i--, 1);
                        this.currentParticleCount--;
                        continue;        
                    }

                    const radius = particle.lifetime < 1 ? particle.lifetime * particle.size : (particle.maximumLifetime - particle.lifetime < 1 ? particle.size * (particle.maximumLifetime - particle.lifetime) : particle.size);

                    context.save();
                    context.translate(Math.round(particle.x + radius), Math.round(particle.y + radius));
                    context.rotate(particle.angle);

                    context.fillRect(Math.round(-radius), Math.round(-radius), Math.round(radius * 2), Math.round(radius * 2));
                    context.restore();
                }
            }

            if(this.stopped && this.currentParticleCount === 0){
                this.internalReset();
                this.completedHandler.fire(this);
            }
        }

        protected internalEndAnimation(){
            this.stopped = true;
        }

        protected internalReset(){
            this.stopped = false;
            this.colors.length = 0;
            this.particles.length = 0;
            this.currentParticleCount = 0;
        }
    }
}