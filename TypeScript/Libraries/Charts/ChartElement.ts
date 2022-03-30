/// <reference path="IChartElement.ts" />

namespace Libraries.Charts{
    export class ChartElement implements IChartElement{
        readonly parent?:IChartElement;
        readonly name:string;
        readonly value:number;

        constructor(name:string, value:number, parent?:IChartElement){
            this.name = name;
            this.value = value;

            if(parent){
                this.parent = parent;
            }
        }

        getName(){
            return this.name
        }
        getValue(){
            return this.value;
        }
        getParent(){
            return this.parent
        }

        getChildren(){
           return undefined;
        }
        
    }
}