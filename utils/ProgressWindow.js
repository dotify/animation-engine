import {CircleProgress} from "./CircleProgress";


let _instance;

class ProgressWindow extends CircleProgress{

  static init(assetLoader) {
    if (_instance)
      throw "ProgressWindow already initialized";

    _instance = new ProgressWindow(assetLoader)

  }

  static getInstance(){
    if (!_instance)
      throw "ProgressWindow not initialized";

    return _instance;
  }

  constructor(assetLoader){
    var wrapper            = $("<div class=\"progress-window\" />").appendTo("body");
    var progressContainer  = $("<div class=\"progress\" data-layer-size=\"100 100\" />").appendTo(wrapper);

    super(progressContainer);

    this.assetLoader = assetLoader;
    this.wrapper = wrapper;
    this.progressContainer = progressContainer;
    this.progressLabel      = $("<div class=\"progress-label\" />").appendTo(this.progressContainer);

    this.assetLoader.setHandlers({
      onLoadStart:(progress,total) => this.updateState("start",progress),
      onLoadProgress:(progress) => this.updateState("progress",progress),
      onLoadComplete:(progress) => this.updateState("complete",progress),
    });
  }

  updateState(action,progress){
    switch(action){
      case "complete":
        this.visible = false;
        break;
      default:
        this.visible = true;
    }

    this.progress = progress;
    this.progressLabel.html(Math.round(progress * 100)+"%");
  }

   get visible() {
     return this._visible;
   }

   set visible(value){
     if(this._visible != value){
       this._visible = value;

       if(this.wrapper) {
         if (this._visible) {
           this.wrapper.removeClass("hidden");
         } else {
           this.wrapper.addClass("hidden");
         }
       }
     }
   }
}

export {ProgressWindow};