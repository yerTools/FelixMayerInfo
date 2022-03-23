/// <reference path="../Input/MouseFinder.ts" />


namespace Background{
    export class Matrix extends Animation{
        private static hiraganaAndKatakanaStart = 0x3040;
        private static hiraganaAndKatakanaEnd = 0x3100;
        private static hiraganaAndKatakanaSize = Matrix.hiraganaAndKatakanaEnd - Matrix.hiraganaAndKatakanaStart;

        private static kanjiStart = 0x4e00;
        private static kanjiEnd = 0x9fb0;
        private static totalChars = Matrix.kanjiEnd - Matrix.kanjiStart + Matrix.hiraganaAndKatakanaSize; 

        private static drawInterval = 1000 / 20;
        private static clearColor = "rgba(0,10,0,0.1)";
        static textColor = "#30ff30";
        static font = "16px monospace";
        static columnWidth = 25;

        public static randomText(length:number){
            let result = "";

            for(let i = 0; i < length; i++){
                const random = Math.random();
                const number = Math.floor(random * random * random * Matrix.totalChars);
                if(number < Matrix.hiraganaAndKatakanaEnd){
                    result += String.fromCharCode(Matrix.hiraganaAndKatakanaStart + number);
                }else{
                    result += String.fromCharCode(Matrix.kanjiStart + number - Matrix.hiraganaAndKatakanaSize);
                }
            }

            return result;
        }

        private readonly characters:{
            chars:string,
            x:number,
            y:number
            velocityY:number,
            velocityCharChange:number,
            charIndex:number,
            lifetime:number
        }[] = [];

        private delta = 0

        constructor(fpsTarget = 48){
            super("matrix-animation", false, fpsTarget);
        }

        protected drawFrame(context: CanvasRenderingContext2D, width: number, height: number, wasCleared: boolean, delta: number | undefined): void {
            const targetChars = Math.ceil(width / 10);
            while(this.characters.length < targetChars){
                const random = Math.random();

                let x:number;
                let y:number;

                if(Input.pointerPosition && Math.random() < 0.5){
                    x = Input.pointerPosition.x * width + Math.random() * 120 - 60;
                    y = Input.pointerPosition.y * height + Math.random() * 120 - 60;
                }else{
                    x = Math.random() * (width + 40) - 20;
                    y = Math.random() * (height + 200) - 100;
                }

                this.characters.push({
                    chars: Matrix.randomText(20),
                    x: Math.round(Math.round(x / Matrix.columnWidth) * Matrix.columnWidth + Matrix.columnWidth / 2),
                    y: y,
                    charIndex: 0,
                    velocityCharChange: 50 * random * random,
                    velocityY: 400 * Math.random() + 100,
                    lifetime: 0
                });
            }

            if(wasCleared){
                for(let x = 0; x < 10; x++){
                    for(let i = 0; i < this.characters.length; i++){
                        this.characters[i]!.velocityY -= Matrix.drawInterval / 1000 * 100;
                        this.characters[i]!.lifetime--;
                        this.characters[i]!.charIndex -= this.characters[i]!.velocityCharChange * Matrix.drawInterval / 1000;
                        this.characters[i]!.y -= this.characters[i]!.velocityY * Matrix.drawInterval / 1000;
                    }
                    this.delta += Matrix.drawInterval;
                }
            }

            this.delta += delta ?? 100;
            while(this.delta >= Matrix.drawInterval){
                this.drawCharacters(context, width, height, Matrix.drawInterval / 1000);
                this.delta -= Matrix.drawInterval;
            }
        }
        

        private drawCharacters(context: CanvasRenderingContext2D, width: number, height: number, delta:number){
            context.fillStyle = Matrix.clearColor;
            context.fillRect(0, 0, width, height);

            context.fillStyle = Matrix.textColor;
            context.font = Matrix.font;

            for(let i = 0; i < this.characters.length; i++){
                if(this.characters[i]!.lifetime >= 0){
                    context.fillText(this.characters[i]!.chars[Math.floor(this.characters[i]!.charIndex + this.characters[i]!.chars.length) % this.characters[i]!.chars.length]!, this.characters[i]!.x, Math.round(this.characters[i]!.y));
                }

                this.characters[i]!.y += this.characters[i]!.velocityY * delta;

                if(this.characters[i]!.y > height + 100){
                    this.characters.splice(i--, 1);
                    continue;
                }

                this.characters[i]!.charIndex += this.characters[i]!.velocityCharChange * delta;
                this.characters[i]!.lifetime++;
                this.characters[i]!.velocityY += delta * 100;
            }
        }

        protected internalReset(){
            this.characters.length = 0;
        }
    }
}