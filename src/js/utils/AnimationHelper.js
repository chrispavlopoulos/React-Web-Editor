
class AnimationHelper{
  static addKeyFrames = (document, name, frames) =>{
    this.document = document;

    this.initIfNeeded();
    if(!this.styleSheet) return;

    var pos = this.styleSheet.length;
        this.styleSheet.insertRule(
            "@keyframes " + name + "{" + frames + "}", pos);
  }

  static initIfNeeded = () =>{
    if(!this.document) return;

    if(!this.styleSheet){
      this.styleSheet = document.createElement('style');
    }
  }

}
