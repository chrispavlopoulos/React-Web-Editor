import { PEN_TYPE, ASSET_TYPE, } from "../constants.js";

var assetCount = 0;

class DataHelper{
  static initPens = () =>{
    let temp = [];
    temp.push(this.makePen(PEN_TYPE.NORMAL, "Pointer", "https://image.flaticon.com/icons/svg/99/99167.svg", 0.7));
    temp.push(this.makePen(PEN_TYPE.EDIT, "Edit", "https://image.flaticon.com/icons/svg/99/99169.svg"));

    return temp;
  }

  static makePen = (type, title, image, scale = 1) =>{
    return {id: type, title: title, image: image, scale: scale};
  }

  static initDrawerAssets = () =>{
    let temp = [];
    temp.push(this.makeDrawerAsset(ASSET_TYPE.TEXT, "Text", "Text"));
    temp.push(this.makeDrawerAsset(ASSET_TYPE.IMAGE, "Image", "https://image.flaticon.com/icons/svg/149/149092.svg"));
    temp.push(this.makeDrawerAsset(ASSET_TYPE.VIDEO, "Video", "https://image.flaticon.com/icons/svg/152/152810.svg"));
    temp.push(this.makeDrawerAsset(ASSET_TYPE.INPUT, "Input", "https://image.flaticon.com/icons/svg/118/118779.svg"));

    return temp;
  }

  static makeDrawerAsset = (type, title, content) =>{
    return {type: type, title: title, content: content};
  }

  static packageAsset = (assetDOM, id) =>{
    var packagedStyles = this.packageStyles(assetDOM.style.cssText);
    var assetRect = assetDOM.getBoundingClientRect();
    return {type: assetDOM.dataset.type, id: this.getUniqueAssetId(id), content: assetDOM.dataset.content, left: assetRect.left, top: assetRect.top, style: packagedStyles};
  }

  static packageStyles = (cssText) =>{
    cssText = cssText.replace(/ /g, '');
    const cssArray = cssText.split(';');
    var style = {};
    var cur, split;
    for(var i = 0; i < cssArray.length; i++){
      cur = cssArray[i].replace(/;/g, '');
      split = cur.split(':');
      style[split[0]] = split[1];
    }
    return style;
  }

  static getUniqueAssetId = (genericId) =>{
    return genericId + assetCount++;
  }

  static getPropertiesFor = (type) =>{
    switch (type){
      case ASSET_TYPE.TEXT:
        return [
          new AssetProperty("textContent", "Text", false),
          new AssetProperty("width", "Width"),
          new AssetProperty("height", "Height"),
          new AssetProperty("color", "Color"),
          new AssetProperty("fontSize", "Font Size"),
          new AssetProperty("textAlign", "Align Text").setUniqueId("textalign"),
          new AssetProperty("fontStyle", "Font Style"),
          new AssetProperty("fontWeight", "Font Weight"),
          new AssetProperty("textShadow", "Shadow"),
          new AssetProperty("zIndex", "Z Index"),
        ];

      case ASSET_TYPE.IMAGE:
        return [
          new AssetProperty("src", "URL", false).setUniqueId('src'),
          new AssetProperty("width", "Width"),
          new AssetProperty("height", "Height"),
          new AssetProperty("backgroundColor", "Background Color"),
          new AssetProperty("transform", "Scale").setPrefix("scale(").setPostfix(")"),
          new AssetProperty("transform", "Rotation").setPrefix("rotate(").setPostfix("deg)"),
          new AssetProperty("animation", "Animation"),
          new AssetProperty("filter", "Filter"),
          new AssetProperty("zIndex", "Z Index"),
        ];

      case ASSET_TYPE.VIDEO:
        return [
          new AssetProperty("src", "Src", false),
          new AssetProperty("width", "Width"),
          new AssetProperty("height", "Height"),
          new AssetProperty("transform", "Scale").setPrefix("scale(").setPostfix(")"),
          new AssetProperty("transform", "Rotation").setPrefix("rotate(").setPostfix("deg)"),
          new AssetProperty("filter", "Filter"),
          new AssetProperty("zIndex", "Z Index"),
        ];

      case ASSET_TYPE.INPUT:
        return [
          new AssetProperty("type", "Type").setUniqueId("inputtype"),
          new AssetProperty("textContent", "Title", false).setUniqueId("title"),
          new AssetProperty("titleColor", "Title Color"),
          new AssetProperty("inputColor", "Input Color"),
          new AssetProperty("secondaryColor", "Secondary Color"),
          new AssetProperty("backgroundColor", "Background Color"),
          new AssetProperty("width", "Width"),
          new AssetProperty("height", "Height"),
          new AssetProperty("transform", "Scale").setPrefix("scale(").setPostfix(")"),
          new AssetProperty("transform", "Rotation").setPrefix("rotate(").setPostfix("deg)"),
          new AssetProperty("zIndex", "Z Index"),
        ];
      
      default:
        return [ new AssetProperty("default", "default", false) ];
      
    }
  }
}

class AssetProperty {

  // static make(css, friendlyName, isStyle = true){
  //   this.AssetProperty = new AssetProperty(css, friendlyName, isStyle);
  // }

  constructor(css, friendlyName, isStyle = true) {
    this.css = css;
    this.friendlyName = friendlyName;
    this.isStyle = isStyle;
    this.uniqueId = friendlyName.replace(' ', '').toLowerCase();
    this.prefix = null;
    this.postfix = null;
  }

  setUniqueId = (uniqueId) =>{
    this.uniqueId = uniqueId;
    return this;
  }

  setPrefix = (prefix) =>{
    this.prefix = prefix;
    return this;
  }

  setPostfix = (postfix) =>{
    this.postfix = postfix;
    return this;
  }

}

export default DataHelper
