
import {CircleProgress} from "./CircleProgress";


class SoundProgress extends CircleProgress{
  constructor(layer){
    super(layer,false);

    this.soundPlayer = layer.sound.soundPlayer;
    this.isPlaying = false;

    this._updateDelegate = () => this.updateState() ;
    this._updateProgressDelegate = () => this.updateProgress();

    this.soundPlayer.on("play",this._updateDelegate);
    this.soundPlayer.on("stop",this._updateDelegate);
    this.soundPlayer.on("pause",this._updateDelegate);
    this.soundPlayer.on("seek",this._updateDelegate);
    this.soundPlayer.on("end",this._updateDelegate);

    this.updateState();
  }

  updateState(){

    var isPlaying = this.soundPlayer.playing();

    this.visible = isPlaying;

    if(!this.isPlaying && isPlaying){
      this.isPlaying = isPlaying;

      this.updateProgress();
    }
  }

  updateProgress(){

    this.progress = this.soundPlayer.seek() / this.soundPlayer.duration();

    if(this.isPlaying)
      window.requestAnimationFrame(this._updateProgressDelegate);

  }

}

export {SoundProgress};