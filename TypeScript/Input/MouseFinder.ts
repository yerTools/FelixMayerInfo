/// <reference path="../General/Point2D.ts" />
/// <reference path="../General/EventHandler.ts" />



namespace Input{
    export let pointerPosition:General.Point2D|undefined;
    export const pointerChanged = new General.EventHandler<General.Point2D|undefined>();

    let mousePosition:General.Point2D|undefined;
    let touchPosition:General.Point2D|undefined;

    let lastMouseOut = 0;
    let lastMove = 0;
    let lastTouchOut = 0;
    let mouseOutTimeout:number|undefined;

    const touchPositions:General.Point2D[] = [];

    addEventListener("mousemove", event => {
        lastMove = new Date().getTime();
        if(lastMove - lastTouchOut < 500) return;

        if(mouseOutTimeout !== undefined){
            clearTimeout(mouseOutTimeout);
            mouseOutTimeout = undefined;
        }

        mousePosition = new General.Point2D(event.clientX / innerWidth, event.clientY / innerHeight);
        pointerPosition = mousePosition;
        pointerChanged.fire(pointerPosition);
    });

    addEventListener("mouseout", () => {
        lastMouseOut = new Date().getTime();
        if(lastMove === lastMouseOut) return;

        if(mouseOutTimeout !== undefined){
            clearTimeout(mouseOutTimeout);
        }

        mouseOutTimeout = setTimeout(() => {
            mousePosition = undefined;
            pointerPosition = touchPosition;
            pointerChanged.fire(pointerPosition);
        }, 10);
    });

    function touchChanged(touches:TouchList){
        touchPositions.length = 0;

        for(let i = 0; i < touches.length; i++){
            touchPositions[touches[i]!.identifier] = new General.Point2D(touches[i]!.clientX / innerWidth, touches[i]!.clientY / innerHeight);
        }

        touchPosition = undefined;
        if(touchPositions.length){
            for(let id in touchPositions){
                touchPosition = touchPositions[id];
                break;
            }

            pointerPosition = touchPosition ?? mousePosition;
        }else{
            lastTouchOut = new Date().getTime();
            pointerPosition = mousePosition;
        }

        pointerChanged.fire(pointerPosition);
    }

    addEventListener("touchstart", event => touchChanged(event.touches));
    addEventListener("touchmove", event => touchChanged(event.touches));
    addEventListener("touchend", event => touchChanged(event.touches));
}