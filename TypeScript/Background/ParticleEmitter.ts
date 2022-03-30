/// <reference path="../Input/MouseFinder.ts" />

namespace Background{
    export class ParticleEmitter extends Animation{
        static colorCount = 24; 

        private readonly colors:[number, number, number, number][] = [];

        private readonly particles:{
            x:number,
            y:number
            velocityX:number,
            velocityY:number,
            accelerationX:number,
            accelerationY:number,
            size:number,
            lifetime:number,
            maximumLifetime:number
        }[][] = [];

        private currentParticleCount = 0;

        constructor(fpsTarget = 48){
            super("particles-animation", false, fpsTarget);
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

            const particleCount = Math.ceil(width * height / 3500);

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
                    size: Math.floor(Math.random() * 10) + 5,
                    velocityX: Math.random() * 200 - 100,
                    velocityY: Math.random() * 200 - 100,
                    x: usePointerPosition ? Input.pointerPosition!.x * width + Math.random() * 120 - 60 : Math.random() * width,
                    y: usePointerPosition ? Input.pointerPosition!.y * height + Math.random() * 120 - 60 : Math.random() * height
                });

                this.currentParticleCount++;
            }

            if(!wasCleared){
                context.clearRect(0, 0, width, height);
            }

            if(delta === undefined){
                delta = 50;
            }else if(delta > 1000){
                delta = 1000;
            }
            delta /= 1000;

            const PI2 = 2 * Math.PI;

            for(let color = 0; color < this.particles.length; color++){
                if(!this.particles[color]) continue;
                
                const particles = this.particles[color]!;
                context.fillStyle = `rgba(${this.colors[color]![0]},${this.colors[color]![1]},${this.colors[color]![2]},${this.colors[color]![3]})`;
                context.beginPath();

                for(let i = 0; i < particles.length; i++){
                    const particle = particles[i]!;

                    particle.lifetime += delta;

                    if(Input.pointerPosition){
                        let deltaX = particle.x / width - Input.pointerPosition.x;
                        let deltaY = particle.y / height - Input.pointerPosition.y;

                        if(deltaX < 0 && deltaX > -0.01){
                            deltaX = -0.01;
                        }else if(deltaX >= 0 && deltaX < 0.01){
                            deltaX = 0.01;
                        }

                        if(deltaY < 0 && deltaY > -0.01){
                            deltaY = -0.01;
                        }else if(deltaY >= 0 && deltaY < 0.01){
                            deltaY = 0.01;
                        }

                        particle.accelerationX = -0.001 * width *  1 / deltaX;
                        particle.accelerationY = -0.001 * height * 1 / deltaY;
                    }

                    particle.velocityX += particle.accelerationX * delta;
                    particle.velocityY += particle.accelerationY * delta;

                    particle.x += particle.velocityX * delta;
                    particle.y += particle.velocityY * delta;

                    if(particle.lifetime >= particle.maximumLifetime 
                    || particle.x + particle.size <= 0
                    || particle.x - particle.size >= width
                    || particle.y + particle.size <= 0
                    || particle.y - particle.size >= height){
                        particles.splice(i--, 1);
                        this.currentParticleCount--;
                        continue;        
                    }

                    context.arc(
                        particle.x,
                        particle.y,
                        particle.lifetime < 1 ? particle.lifetime * particle.size : (particle.maximumLifetime - particle.lifetime < 1 ? particle.size * (particle.maximumLifetime - particle.lifetime) : particle.size),
                        0,
                        PI2
                    );
                    context.closePath();
                }
                context.fill();
            }
        }

        protected internalReset(){
            this.colors.length = 0;
            this.particles.length = 0;
            this.currentParticleCount = 0;
        }
    }
}