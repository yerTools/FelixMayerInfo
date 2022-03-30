namespace Libraries.Charts{
    export interface IChartElement{
        getName():string;
        getValue():number;
        getParent():IChartElement|undefined;
        getChildren():IChartElement[]|undefined;
    }
}