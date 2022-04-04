/// <reference path="../General/EventHandler.ts" />


namespace Libraries{
    const loadThumbnailsHandler = new General.EventHandler<undefined>();
    let loadThumbnails = false;

    addEventListener("load", () => {
        setTimeout(() => {
            loadThumbnails = true;
            loadThumbnailsHandler.fire(undefined);
        }, 200);
    });

    export class ImageGallary{
        
        readonly fullSizePath:string;
        readonly thumbnailPath:string;

        readonly imageType:string;

        readonly imageCount:number;

        readonly element:HTMLDivElement;
        
        private readonly thumbnails:HTMLImageElement[] = [];
        private readonly fullSized:HTMLImageElement[] = [];

        constructor(fullSizePath:string, thumbnailPath:string, imageType:string, imageCount:number){
            this.fullSizePath = fullSizePath;
            this.thumbnailPath = thumbnailPath;
            this.imageType = imageType;
            this.imageCount = imageCount;

            this.element = document.createElement("div");
            this.element.className = "image-gallery";

            const thumbnailContainer = document.createElement("div");
            thumbnailContainer.className = "thumbnail-container";
            this.element.appendChild(thumbnailContainer);

            for(let i = 0; i < imageCount; i++){    
                const thumbnail = new Image(4, 3);

                const wrapper = document.createElement("div");
                wrapper.className = "thumbnail-wrapper";
                wrapper.appendChild(thumbnail);
                thumbnailContainer.appendChild(wrapper);

                const fullSized = new Image();

                thumbnail.addEventListener("click", () => {

                })

                this.thumbnails.push(thumbnail);
                this.fullSized.push(fullSized);
            }

            if(loadThumbnails){
                for(let i = 0; i < imageCount; i++){
                    this.thumbnails[i]!.style.backgroundImage = "url(" + thumbnailPath + i + imageType + ")"; 
                }
            }else{
                loadThumbnailsHandler.on(() => {
                    for(let i = 0; i < imageCount; i++){
                        this.thumbnails[i]!.style.backgroundImage = "url(" + thumbnailPath + i + imageType + ")"; 
                    }
                });
            }
        }
    }
}