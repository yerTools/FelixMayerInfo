/// <reference path="Animation.ts" />
/// <reference path="../Utilities/Numbers.ts" />
/// <reference path="../Input/MouseFinder.ts" />


namespace Background{
    export class Maze extends Animation{
        private mazeData:MazeData|undefined;

        readonly tileSize:number;
        readonly creationSettings:MazeSettings.Creation;
        readonly waitBeforeNextMaze:number;
        readonly colors:MazeSettings.Colors;

        constructor(tileSize = 24, creationSettings?:MazeSettings.Creation, waitBeforeNextMaze = 3000, colors?:MazeSettings.Colors, fpsTarget?:number){
            super("maze-animation", true, fpsTarget);

            this.tileSize = tileSize;
            this.creationSettings = creationSettings ?? new MazeSettings.Creation();
            this.waitBeforeNextMaze = Math.max(waitBeforeNextMaze, 0);
            this.colors = colors ?? new MazeSettings.Colors();
        }

        protected drawFrame(context: CanvasRenderingContext2D, width: number, height: number, wasCleared: boolean, delta:number|undefined){
            if(!this.mazeData || this.mazeData.widthPixel !== width || this.mazeData.heightPixel !== height){
                this.mazeData = new MazeData(this, width, height);
            }

            this.step(delta ?? this.creationSettings.stepInterval);
            wasCleared ? this.mazeData.drawAll(context) : this,this.mazeData.draw(context);
        }
        
        private step(delta:number){
            if(delta <= 0 || !this.mazeData) return;

            this.mazeData.step(Math.min(delta, 1000));
        }

        protected internalReset(){
            this.mazeData = undefined;
        }
    }

    class MazeData{
        private stepDelta = 0;
        protected currentState:MazeState;
        protected readonly tileDrawList:General.Point2D[];

        readonly maze:Maze;

        readonly tileSize:number;
        readonly widthPixel:number;
        readonly heightPixel:number;
        readonly offsetPixelX:number;
        readonly offsetPixelY:number;

        readonly tilesX:number; //must be odd number
        readonly tilesY:number; //must be odd number
        
        readonly tileColors:(string|null)[][];

        constructor(maze:Maze, width:number, height:number){
            this.maze = maze;

            this.tileSize = Math.round(maze.tileSize);
            this.widthPixel = width;
            this.heightPixel = height;

            this.tilesX = Math.max(Math.floor(Math.round(this.widthPixel / this.tileSize) / 2) * 2 - 1, 0);
            this.tilesY = Math.max(Math.floor(Math.round(this.heightPixel / this.tileSize) / 2) * 2 - 1, 0);

            this.offsetPixelX = Math.round((this.widthPixel - this.tilesX * this.tileSize) / 2);
            this.offsetPixelY = Math.round((this.heightPixel - this.tilesY * this.tileSize) / 2);

            this.tileDrawList = [];
            this.tileColors = [];
            for(let x = 0; x < this.tilesX; x++){
                const column:(string|null)[] = [];
                for(let y = 0; y < this.tilesY; y++){
                    column.push(null);
                }
                this.tileColors.push(column);
            }

            this.currentState = new MazeGenerator(this);
        }

        draw(context: CanvasRenderingContext2D){
            for(let i = 0; i < this.tileDrawList.length; i++){
                const x = this.tileDrawList[i]!.x;
                const y = this.tileDrawList[i]!.y;

                const left = x * this.tileSize + this.offsetPixelX;
                const top = y * this.tileSize + this.offsetPixelY;

                context.clearRect(left, top, this.tileSize, this.tileSize);
                if(this.tileColors[x]![y]){
                    if(context.fillStyle !== this.tileColors[x]![y]){
                        context.fillStyle = this.tileColors[x]![y]!
                    }
                    context.fillRect(left, top, this.tileSize, this.tileSize);
                }
            }

            this.tileDrawList.length = 0;
        }

        drawAll(context: CanvasRenderingContext2D){
            const clearTiles:General.Point2D[] = [];

            for(let i = 0; i < this.tileDrawList.length; i++){
                if(!this.tileColors[this.tileDrawList[i]!.x]![this.tileDrawList[i]!.y]){
                    clearTiles.push(this.tileDrawList[i]!);
                }
            }

            this.tileDrawList.length = 0;
            for(let i = 0; i < clearTiles.length; i++){
                this.tileDrawList.push(clearTiles[i]!);
            }

            for(let x = 0; x < this.tilesX; x++){
                for(let y = 0; y < this.tilesY; y++){
                    if(this.tileColors[x]![y]){
                        this.tileDrawList.push(new General.Point2D(x, y));
                    }
                }
            }

            this.draw(context);
        }

        step(delta:number){
            this.stepDelta += delta;
            const stepCount = Math.floor(this.stepDelta / this.maze.creationSettings.stepInterval);
            this.stepDelta %= this.maze.creationSettings.stepInterval;

            for(let i = 0; i < stepCount; i++){
                this.currentState = this.currentState.step();
            }
        }

        setTileColor(tile:General.Point2D, color:MazeSettings.ColorType){
            const colorString = typeof color === "string" ? color : color(tile.x / this.tilesX, tile.y / this.tilesY);
            if(this.tileColors[tile.x]![tile.y] !== colorString){
                this.tileColors[tile.x]![tile.y] = colorString;
                this.tileDrawList.push(tile);
            }
        }

        clearTile(tile:General.Point2D){
            if(this.tileColors[tile.x]![tile.y]){
                this.tileColors[tile.x]![tile.y] = null;
                this.tileDrawList.push(tile);
            }
        }
    }

    abstract class MazeState{
        readonly data:MazeData;
        readonly maze:Maze;

        constructor(data:MazeData){
            this.data = data;
            this.maze = data.maze;
        }

        protected getAround(point:General.Point2D, callback:(between:General.Point2D, end:General.Point2D) => void){
            if(point.y >= 2){
                callback(new General.Point2D(point.x, point.y - 1), new General.Point2D(point.x, point.y - 2));
            }
            if(point.x + 2 < this.data.tilesX){
                callback(new General.Point2D(point.x + 1, point.y), new General.Point2D(point.x + 2, point.y));
            }
            if(point.y + 2 < this.data.tilesY){
                callback(new General.Point2D(point.x, point.y + 1), new General.Point2D(point.x, point.y + 2));
            }
            if(point.x >= 2){
                callback(new General.Point2D(point.x - 1, point.y), new General.Point2D(point.x - 2, point.y));
            }
        }

        abstract step():MazeState;
    }

    enum MazeGeneratorState{
        Error,
        SetStart,
        CreateGenerators,
        MoveGenerators
    }

    class MazeGenerator extends MazeState{

        private readonly start:General.Point2D;
        private readonly generators:General.Point2D[][];

        private state:MazeGeneratorState;

        constructor(data:MazeData){
            super(data);

            let startX:number;
            let startY:number;

            if(Input.pointerPosition){
                startX = Utilities.Numbers.clampBetween(Math.floor((Input.pointerPosition.x * this.data.widthPixel - this.data.offsetPixelX) / this.data.tileSize), 0, Math.max(this.data.tilesX - 1, 0));
                startY = Utilities.Numbers.clampBetween(Math.floor((Input.pointerPosition.y * this.data.heightPixel - this.data.offsetPixelY) / this.data.tileSize), 0, Math.max(this.data.tilesY - 1, 0));
                
            }else{
                startX = Math.floor(Math.random() * this.data.tilesX);
                startY = Math.floor(Math.random() * this.data.tilesY);
            }

            this.start = new General.Point2D(Math.floor(startX / 2) * 2, Math.floor(startY / 2) * 2);
                
            this.generators = [];
            this.state = MazeGeneratorState.SetStart;
        }

        step(){
            if(this.state === MazeGeneratorState.Error) return this;

            switch(this.state){
                case MazeGeneratorState.SetStart:
                    if(this.start.x === this.data.tilesX || this.start.y === this.data.tilesY){
                        this.state = MazeGeneratorState.Error;
                        break;
                    }

                    this.data.setTileColor(this.start, this.maze.colors.start);
                    this.state = MazeGeneratorState.CreateGenerators;
                    break;

                case MazeGeneratorState.CreateGenerators:
                    const possibleGenerators:[General.Point2D, General.Point2D][] = [];
                    
                    this.getAround(this.start, (between, end) => {
                        possibleGenerators.push([between, end]);
                    });

                    for(let i = 0; i < possibleGenerators.length; i++){
                        if(Math.random() < 0.33){
                            this.data.setTileColor(possibleGenerators[i]![0], this.maze.colors.path);
                            this.data.setTileColor(possibleGenerators[i]![1], this.maze.colors.generator);
    
                            this.generators.push(possibleGenerators[i]!);
                        }
                    }

                    if(this.generators.length === 0){
                        if(possibleGenerators.length === 0){
                            this.state = MazeGeneratorState.Error;
                            break;
                        }

                        const index = Math.floor(Math.random() * possibleGenerators.length);
                        this.data.setTileColor(possibleGenerators[index]![0], this.maze.colors.path);
                        this.data.setTileColor(possibleGenerators[index]![1], this.maze.colors.generator);

                        this.generators.push(possibleGenerators[index]!);
                    }

                    this.state = MazeGeneratorState.MoveGenerators;
                    break;

                case MazeGeneratorState.MoveGenerators:
                    let generatorMoved = false;
                    const newGenerators:General.Point2D[][] = [];

                    for(let i = 0; i < this.generators.length; i++){
                        const generator = this.generators[i]!;
                        if(!generator.length){
                            this.generators.splice(i--, 1);
                            continue;
                        }

                        const availablePaths:[number, General.Point2D, General.Point2D][] = [];

                        this.getAround(generator[generator.length - 1]!, (between, end) => {
                            if(this.data.tileColors[end.x]![end.y]) return;

                            if(Input.pointerPosition){
                                const x = this.data.offsetPixelX + this.data.tileSize * end.x + this.data.tileSize / 2;
                                const y = this.data.offsetPixelY + this.data.tileSize * end.y + this.data.tileSize / 2;

                                const distance = Math.floor(Math.sqrt((x - Input.pointerPosition.x * this.data.widthPixel) * (x - Input.pointerPosition.x * this.data.widthPixel) + (y - Input.pointerPosition.y * this.data.heightPixel) * (y - Input.pointerPosition.y * this.data.heightPixel)));
                                availablePaths.push([distance, between, end]);
                            }else{
                                availablePaths.push([1, between, end]);
                            }
                        });

                        if(availablePaths.length){
                            generatorMoved = true;

                            availablePaths.sort((a, b) => a[0] - b[0]);

                            let selectedDirection:number;
                            
                            if(availablePaths.length === 1 || availablePaths[0]![0] === 0){
                                selectedDirection = 0;
                            }else{
                                const differentDistances:[number, number[]][] = [[availablePaths[0]![0], [0]]];

                                for(let i = 1; i < availablePaths.length; i++){
                                    if(differentDistances[differentDistances.length -1]![0] !== availablePaths[i]![0]){
                                        differentDistances.push([availablePaths[i]![0]!, []]);
                                    }

                                    differentDistances[differentDistances.length - 1]![1].push(i);
                                }

                                const random = Math.random();
                                const distance = differentDistances[Math.floor(random * random * differentDistances.length)]!;

                                if(distance[1].length === 1){
                                    selectedDirection = distance[1][0]!;
                                }else{
                                    selectedDirection = distance[1][Math.floor(Math.random() * distance[1].length)]!;
                                }
                            }

                            generator.push(availablePaths[selectedDirection]![1]);
                            generator.push(availablePaths[selectedDirection]![2]);

                            this.data.setTileColor(generator[generator.length - 3]!, this.maze.colors.path);
                            this.data.setTileColor(generator[generator.length - 2]!, this.maze.colors.path);
                            this.data.setTileColor(generator[generator.length - 1]!, this.maze.colors.generator);

                            if(availablePaths.length > 1 && this.maze.creationSettings.goMultipleWaysPercentage > 0 && Math.random () < this.maze.creationSettings.goMultipleWaysPercentage){
                                let index = Math.floor(Math.random() * (availablePaths.length - 1));
                                if(index >= selectedDirection){
                                    index++;
                                }

                                this.data.setTileColor(availablePaths[index]![1], this.maze.colors.path);
                                this.data.setTileColor(availablePaths[index]![2], this.maze.colors.generator);
                                newGenerators.push([availablePaths[index]![1], availablePaths[index]![2]]);
                            }

                        }else{
                            if(!generator.length) continue;

                            generatorMoved = true;

                            this.data.setTileColor(generator[generator.length - 1]!, this.maze.colors.tile);
                            this.data.setTileColor(generator[generator.length - 2]!, this.maze.colors.tile);
                            generator.length -= 2;
                            if(!generator.length) continue;

                            this.data.setTileColor(generator[generator.length - 1]!, this.maze.colors.generator);
                        }
                    }

                    for(let i = 0; i < newGenerators.length; i++){
                        this.generators.push(newGenerators[i]!);
                    }

                    if(!generatorMoved){
                        this.state = MazeGeneratorState.Error;
                        return new MazeTracer(this.data, this.start);
                    }

                    break;

            }


            return this;
        }
    }

    class MazeTracer extends MazeState{
        private solving = false;
        private paths:General.Point2D[][]

        readonly isSolver:boolean;
        readonly visitedTiles:boolean[][];

        constructor(data:MazeData, start:General.Point2D, isSolver = false){
            super(data);

            this.isSolver = isSolver;
            this.paths = [[start]];
            this.visitedTiles = [];
            for(let x = 0; x < this.data.tilesX; x++){
                const column:boolean[] = [];
                for(let y = 0; y < this.data.tilesY; y++){
                    column.push(false);
                }
                this.visitedTiles.push(column);
            }

            this.visitedTiles[start.x]![start.y] = true;
        }

        step(){
            if(!this.paths.length) return new MazeClearer(this.data);

            if(this.solving){
                if(!this.paths[0]!.length){
                    return new MazeStateWaiter(this.maze.waitBeforeNextMaze / this.maze.creationSettings.stepInterval, new MazeClearer(this.data));
                }
                
                if(this.paths[0]!.length > 1){
                    this.data.setTileColor(this.paths[0]![this.paths[0]!.length - 1]!, this.maze.colors.path);
                }

                this.paths[0]!.length--;
            }else{
                const newPaths:General.Point2D[][] = [];

                for(let i = 0; i < this.paths.length; i++){
                    const current = this.paths[i]![this.paths[i]!.length - 1]!;
                    const next:General.Point2D[] = [];

                    if(current.y >= 1 && !this.visitedTiles[current.x]![current.y - 1]){
                        this.visitedTiles[current.x]![current.y - 1] = true;
                        if(this.data.tileColors[current.x]![current.y - 1]){
                            next.push(new General.Point2D(current.x, current.y - 1));
                        }
                    }
                    if(current.x + 1 < this.data.tilesX && !this.visitedTiles[current.x + 1]![current.y]){
                        this.visitedTiles[current.x + 1]![current.y] = true;
                        if(this.data.tileColors[current.x + 1]![current.y]){
                            next.push(new General.Point2D(current.x + 1, current.y));
                        }
                    }
                    if(current.y + 1 < this.data.tilesY && !this.visitedTiles[current.x]![current.y + 1]){
                        this.visitedTiles[current.x]![current.y + 1] = true;
                        if(this.data.tileColors[current.x]![current.y + 1]){
                            next.push(new General.Point2D(current.x, current.y + 1));
                        }
                    }
                    if(current.x >= 1 && !this.visitedTiles[current.x - 1]![current.y]){
                        this.visitedTiles[current.x - 1]![current.y] = true;
                        if(this.data.tileColors[current.x - 1]![current.y]){
                            next.push(new General.Point2D(current.x - 1, current.y));
                        }
                    }

                    if(this.paths[i]!.length > 1){
                        this.data.setTileColor(this.paths[i]![this.paths[i]!.length - 1]!, this.isSolver ? this.maze.colors.tile : this.maze.colors.tracerVisited);
                    }

                    if(!next.length) continue;

                    this.data.setTileColor(next[0]!, this.maze.colors.tracer);

                    for(let x = 1; x < next.length; x++){
                        this.data.setTileColor(next[x]!, this.maze.colors.tracer);

                        const copy = this.paths[i]!.slice();
                        copy.push(next[x]!);
                        newPaths.push(copy);
                    }

                    this.paths[i]!.push(next[0]!);
                    newPaths.push(this.paths[i]!);
                }

                if(newPaths.length){
                    this.paths = newPaths;
                }else{
                    while(this.paths.length > 1){
                        if(this.paths[0]!.length < this.paths[this.paths.length - 1]!.length){
                            this.paths[0] = this.paths[this.paths.length - 1]!;
                        }
                        this.paths.length--;
                    }

                    this.data.setTileColor(this.paths[0]![this.paths[0]!.length - 1]!, this.isSolver ? this.maze.colors.start : this.maze.colors.end);

                    if(this.isSolver){
                        this.paths[0]!.length--;
                        this.solving = true;
                    }else{
                        return new MazeTracer(this.data, this.paths[0]![this.paths[0]!.length - 1]!, true);
                    }
                }
            }
            return this;
        }
    }

    class MazeClearer extends MazeState{
        private left = 0;
        private top = 0;
        private width:number;
        private height:number;

        private topLeftToBottomRight:boolean|undefined;
        private currentRow = 0;
        private currentColumn = 0;
        private clearRow = true;

        constructor (data:MazeData){
            super(data);

            this.width = this.data.tilesX; 
            this.height = this.data.tilesY;
        }

        step(){
            for(let i = 0; i < 5; i++){
                if(!this.clearTile(Math.round(Math.random()))){
                    this.maze.setCompleted();
                    return new MazeGenerator(this.data);
                } 
            }

            return this;
        }

        private clearTile(randomCount:number){
            if(this.width === 0 || this.height === 0) return false;

            for(let i = 0; i < randomCount; i++){
                const x = Math.floor(Math.random() * this.width) + this.left;
                const y = Math.floor(Math.random() * this.height) + this.top;

                this.data.clearTile(new General.Point2D(x, y));
            }

            if(this.topLeftToBottomRight === undefined){
                this.topLeftToBottomRight = Math.random() < 0.5;
                this.clearRow = Math.random() < 0.5;

                if(this.clearRow){
                    if(this.topLeftToBottomRight){
                        this.currentColumn = this.left;
                    }else{
                        this.currentColumn = this.left + this.width - 1;
                    }

                    this.currentRow = Math.random() < 0.5 ? this.top : this.top + this.height - 1;
                }else{
                    if(this.topLeftToBottomRight){
                        this.currentRow = this.top;
                    }else{
                        this.currentRow = this.top + this.height - 1;
                    }

                    this.currentColumn = Math.random() < 0.5 ? this.left : this.left + this.width - 1;
                }
            }

            this.data.clearTile(new General.Point2D(this.currentColumn, this.currentRow));
            if(this.clearRow){
                if(this.topLeftToBottomRight){
                    this.currentColumn++;
                }else{
                    this.currentColumn--;
                }

                if(this.currentColumn < this.left || this.currentColumn === this.left + this.width){
                    this.topLeftToBottomRight = undefined;
                    this.height--;
                    if(this.currentRow === this.top){
                        this.top++;
                    }
                }
            }else{
                if(this.topLeftToBottomRight){
                    this.currentRow++;
                }else{
                    this.currentRow--;
                }

                if(this.currentRow < this.top || this.currentRow === this.top + this.height){
                    this.topLeftToBottomRight = undefined;
                    this.width--;
                    if(this.currentColumn === this.left){
                        this.left++;
                    }
                }
            }

            return true;
        }
    }

    class MazeStateWaiter extends MazeState{
        private currentCount = 0;

        readonly waitCount:number;
        readonly nextState:MazeState;

        constructor(waitCount:number, nextState:MazeState){
            super(nextState.data);

            this.waitCount = waitCount;
            this.nextState = nextState;
        }

        step():MazeState{
            if(this.currentCount++ < this.waitCount){
                return this;
            }

            return this.nextState;
        }
    }

    namespace MazeSettings{
        export type ColorType = string|((x:number, y:number) => string);

        export class Creation{
            readonly goMultipleWaysPercentage:number;
            readonly stepInterval:number;

            constructor(goMultipleWaysPercentage:number|undefined = 0.04, stepInterval = 1000 / 30){
                this.goMultipleWaysPercentage = Utilities.Numbers.clampBetween(goMultipleWaysPercentage ?? 0, 0, 1);
                this.stepInterval = Math.max(stepInterval, 1);
            }
        }

        export class Colors{
            readonly tile:ColorType;
            readonly generator:ColorType;

            readonly start:ColorType;
            readonly end:ColorType;

            readonly tracer:ColorType;
            readonly tracerVisited:ColorType;
            readonly path:ColorType;

            constructor(tile:ColorType = "rgba(210,210,210,0.6)", generator:ColorType = (x:number, y:number) => `rgb(255, ${Math.floor(156 - 156 * x)}, ${Math.floor(156 - 156 * y)})`, start:ColorType = "#98fb98", end:ColorType = "#ffa07a", tracer:ColorType = "#1e90ff", tracerVisited:ColorType = "#91c4f5", path:ColorType = (() => {
                let vRed = 0;
                let red = 128;
                let green = 128;
                let blue = 128;

                return (x: number, y:number) => {
                    vRed = vRed * 0.9 + Math.random() * 6 - 3;

                    red = Utilities.Numbers.clampBetween(red + vRed * 0.5, 40, 170);
                    green = Utilities.Numbers.clampBetween(Math.random() * 10 * (x - Math.random()) + Math.random() * (128 - green) * 0.02 + green, 40, 170);
                    blue = Utilities.Numbers.clampBetween(Math.random() * 10 * (y - Math.random()) + Math.random() * (128 - blue) * 0.02 + blue, 40, 170);

                    return `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;
                };
            })()){
                this.tile = tile;
                this.generator = generator;

                this.start = start;
                this.end = end;

                this.tracer = tracer;
                this.tracerVisited = tracerVisited;
                this.path = path;
            }
        }
    }
}