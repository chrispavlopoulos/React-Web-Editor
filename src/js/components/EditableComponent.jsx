import React, { Component } from "react";
import Typ from "../utils/Typ.js";
import MaterialInput from "./MaterialInput.jsx";
import { connect } from "react-redux";
import { setEditorSelectedProperty } from "../actions/index.js";
import {COLORS, PEN_TYPE, ASSET_TYPE} from "../constants.js";


class EditableComponent extends Component{

  state = {
    descripton: null,
  }

  constructor(props) {
    super(props);
    this.asset = React.createRef();
  }

  componentDidMount(){
    Element.prototype.getPropertyValue = this.getPropertyValue;
  }

  componentDidUpdate() {

  }

  render() {
    var { description } = this.props;
    var groupID = description.id + "AssetGroup";

    let asset;
    switch (description.type){
      case ASSET_TYPE.TEXT:
        asset =
        <p ref={this.asset} id={groupID} key={groupID}
          style={{...description.style, margin: 0, fontSize: "4vmin"}}>{description.content}
        </p>;
        break;
      case ASSET_TYPE.IMAGE:
        asset =
        <img  ref={this.asset} id={groupID} key={groupID}
          data-type={description.type} data-edit="true"
          src={description.content}
          style={{ ...description.style, margin: 0}}
        />;
        break;
      case ASSET_TYPE.VIDEO:
      asset =
        <div ref={this.asset}
        id={description.id + "parent"} key={description.id + "parent"}
          data-type={description.type} data-edit="true"
          style={{
            width: "30vmin", height: "26vmin",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "absolute",
            backgroundColor: "transparent",
            left: description.left, top: description.top}}>
          <iframe
            id={description.id} key={description.id}
            data-type={description.type}
            src={description.content}
            style={{margin: 0, padding: 0, border: "1px solid white", width: "80%", height: "60%", pointerEvents: this.props.penType === PEN_TYPE.EDIT? "none": "all", }}
          />
        </div>
      break;
      case ASSET_TYPE.INPUT:
      asset =
        <div  ref={this.asset}
        id={description.id + "parent"} key={description.id + "parent"}
          data-type={description.type} data-edit="true"
          style={{
            padding: "4vmin",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "absolute",
            backgroundColor: "transparent",
            left: description.left, top: description.top}}>

            <MaterialInput description={description}/>
          {/*
          <form
            data-type={description.type}
            style={{margin: 0, padding: 0, pointerEvents: this.props.penType === PEN_TYPE.EDIT? "none": "all", }}>
              <input
              type="text"
              id={description.id}
              key={description.id}
              data-type={description.type}
              name="fname"
              style={{margin: "8px 0", padding: "10px 10px", color: "black", borderRadius: "10px", backgroundColor: "transparent", width: "12vmin", height: "2vmin"}} />
          </form>
          */}
        </div>
      break;
    }
    asset.props.style.zIndex = 1;
    //asset._self.props.description.id = description.id + "AssetGroup";
    //asset.props.key = description.id + "AssetGroup";

    return (
      <div id={description.id} key={description.id}
      data-type={description.type} data-edit="true"
      style={{position: "absolute", display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "transparent", left: description.left, top: description.top}}>
        {asset}
      </div>
    )
  }

  //  Helper function to GET the desired property for the current selection
  //  i.e. <img> returns its src , <p> returns its textContent
  getPropertyValue = (property, raw = false) =>{
    var target = this.asset.current;
    var css = property.css;

    var value = "";
    if(!property || css === "default"){
      switch (this.props.description.type) {
        case ASSET_TYPE.TEXT:
          value = target.textContent;
        break;
        case ASSET_TYPE.IMAGE:
          value = target.src;
        break;
      }

    }else{
      if(property.isStyle)
        value = target.style[css];
      else
        value = target[css];
    }

    return raw? value: this.parseFixes(value, property.prefix, property.postfix);
  }
  parseFixes = (value, prefix, postfix) =>{
    var result = "";

    //  If a prefix or posfix were given
    if(prefix || postfix){
      if(!prefix) prefix = '';
      if(!postfix) postfix = '';

      var prefixIndex, postfixIndex;
      prefixIndex = postfixIndex = 0;
      var foundPrefix, foundPostfix;
      foundPrefix = foundPostfix = false;
      var current = '';

      for(var i = 0; i < value.length; i++){
        //  Current letter in the raw value
        current = value.charAt(i);

        //  If we've concurrently seen every letter in the prefix, we've found it
        if(prefixIndex >= prefix.length)
          foundPrefix = true;

        if(postfix && postfixIndex >= postfix.length)
          break;

        //  If we found the prefix and we haven't scanned over the postfix,
        //  add the current letter to the result
        if(foundPrefix){
          if(current === postfix[postfixIndex])
            postfixIndex++;

          result += current;
        }
        //  If we haven't found the prefix:
        //    If the current letter matches up with the prefix we're trying to find,
        //      - Increase the prefixIndex to check for the next letter in the prefix
        //    else
        //      - We know this isn't the prefix, reset the index for the future
        else{
          if(current === prefix[prefixIndex])
            prefixIndex++;
          else
            prefixIndex = 0;
        }
      }
    }else
      //  If there is no prefix or postfix, no need to scan
      result = value;


    //  We added the postfix when scanning so let's remove it, that's not what we want
    if(result)
      result = result.replace(postfix, '');

    return result;
  }
  getBeforePrefix = (value, prefix) =>{
    var foundPrefix, prefixIndex, result, current;
    foundPrefix = false;
    prefixIndex = 0;
    result = current = '';

    for(var i = 0; i < value.length; i++){
      //  Current letter in the raw value
      current = value.charAt(i);

      //  If we've concurrently seen every letter in the prefix, we've found it
      if(prefixIndex >= prefix.length)
        foundPrefix = true;

      if(foundPrefix)
        break;

      //  If we found the prefix and we haven't scanned over the postfix,
      //  add the current letter to the result
      result += current;
      if(current === prefix[prefixIndex])
        prefixIndex++;
      else
        prefixIndex = 0;
    }

    //  We added the prefix when scanning so let's remove it
    if(result)
      result = result.replace(prefix, '');

    return result;
  }

  //  Helper function to SET the desired property for the current selection
  //  i.e. <img>, src, cute.jpg -> img gets its src changed to cute.jpg,
  setPropertyValueForTarget = (target, property, newValue) =>{
    var css = property.css;

    //  If no propety is given or its css is 'default', we set a default value
    //  for the element
    if(!property || css === "default"){
      switch (target.dataset.type) {
        case ASSET_TYPE.TEXT:
          if(target.textContent !== newValue)
            target.textContent = newValue;
        break;
        case ASSET_TYPE.IMAGE:
          target.src = newValue;
        break;
      }

    }
    //  A property will either be one of the elment's normal properties
    //    i.e. textContent, src, alt
    //  or something within its styles
    //    i.e. color, width, margin
    //  To handle this, we pass in the 'isStyle' bool that tells us where to look
    //  when setting these values
    else{
      var value = property.isStyle? target.style[css]: target[css];
      var parsedValue = this.parseFixes(value, property.prefix, property.postfix);
      if(parsedValue !== newValue){

        //newValue = Typ.complicate(newValue, css); /////TODO

        var cssValue = newValue;
        var before = "";
        if(property.prefix){
          before = this.getBeforePrefix(value, property.prefix);
          before += property.prefix;
        }
        if(property.postfix){
          var afterPostfix = value.substring(before.length + parsedValue.length + property.postfix.length + 1);
          cssValue = before +newValue +property.postfix +afterPostfix;
         }

        if(property.isStyle)
          target.style[css] = cssValue;
        else
          target[css] = cssValue;
      }

      this.darkenIfValid(target, property, newValue);
    }
  }
}

export default EditableComponent;
