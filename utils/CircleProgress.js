
const ProgressStyles ={
  default:{
    backgroundCircleColor: "#DDD",
    progressColor: "#00A0E5",
    lineWidth: 8,
  }
};

class CircleProgress{



  constructor(layer,visible = true){

    this.lineWidth = 8;
    this.backgroundCircleColor="#DDD";
    this.progressColor="#00A0E5";
    this.visible = visible;
    this._progress = 0;

    let props = ProgressStyles.default;

    for(let i in ProgressStyles) {
      if(ProgressStyles.hasOwnProperty(i)){
        if(layer.hasClass(i)){
          props=ProgressStyles[i];
          break;
        }
      }
    }

    for(let i in props) {
      if (props.hasOwnProperty(i)){
        this[i] = props[i];
      }
    }

    const size = layer.data("layer-size").split(' ').map(s => s * 2);

    this.radius = (size[0] < size[1] ? size[0] : size[1]) / 2 - this.lineWidth / 2;

    const size2 = Math.min(size[0], size[1]);

    this.layer = layer;
    this.canvas = $("<canvas class=\"circle-progress\" width=\""+size2+"\" height=\""+size2+"\" />").appendTo(layer).get(0);
    this.context = this.canvas.getContext("2d");

    this.render();
  }

   get progress() {
     return this._progress;
   }

   set progress(value){
     if(this._progress !== value){
       this._progress = value;
       if(this._visible)
         this.render();
     }
   }

   get visible() {
     return this._visible;
   }

   set visible(value){
     if(this._visible !== value) {
       this._visible = value;

        if(this._visible){
          $(this.canvas).removeClass("hidden");
        }else{
          $(this.canvas).addClass("hidden");
        }
     }
   }

  render(){

    if(!this._visible)
      return;

    const w = this.canvas.width;
    const h = this.canvas.height;


    let ctx = this.context;

    ctx.clearRect(0,0,w,h);
    ctx.beginPath();
    ctx.lineWidth=this.lineWidth;
    ctx.strokeStyle=this.backgroundCircleColor;
    ctx.arc(w/2,h/2,this.radius,0,Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();

    ctx.strokeStyle=this.progressColor;
    ctx.lineWidth=this.lineWidth;

    ctx.arc(w/2,h/2,this.radius,- Math.PI / 2,this._progress * Math.PI * 2 - Math.PI / 2);
    ctx.stroke();

  }
}

export {CircleProgress};