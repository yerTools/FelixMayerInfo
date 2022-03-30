/// <reference path="ChartElement.ts" />

namespace Libraries.Charts{
    export class ChartCategory implements IChartElement{
        readonly parent?:IChartElement;
        readonly name:string;
        readonly children:IChartElement[] = [];

        constructor(name:string, parent?:ChartCategory){
            this.name = name;

            if(parent){
                this.parent = parent;
            }
        }
        
        getName(){
            return this.name;
        }

        getValue(){
            let value = 0;
            for(let i = 0; i < this.children.length; i++){
                value += this.children[i]!.getValue();
            }
            return value;
        }

        getParent(){
            return this.parent;
        }

        getChildren(){
            return this.children;
        }

        addCategoryElement(name:string){
            const child = new ChartCategory(name, this);
            this.children.push(child);
            return child;
        }

        addChildElement(name:string, value:number){
            const child = new ChartElement(name, value, this);
            this.children.push(child);
            return child;
        }
    }
}