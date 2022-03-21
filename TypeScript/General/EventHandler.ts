namespace General{
    export class EventHandler<T>{
        private readonly eventHandler:((parameter:T) => void)[] = []; 

        on(handler:((parameter:T) => void)){
            for(let i = 0; i < this.eventHandler.length; i++){
                if(this.eventHandler[i] === handler) return false;
            }

            this.eventHandler.push(handler);
            return true;
        }

        off(handler:((parameter:T) => void)){
            for(let i = 0; i < this.eventHandler.length; i++){
                if(this.eventHandler[i] === handler){
                    this.eventHandler.splice(i, 1);
                    return true;
                }
            }
            return false;
        }

        fire(parameter:T){
            for(let i = 0; i < this.eventHandler.length; i++){
                this.eventHandler[i]!(parameter);
            }
        }
    }
}