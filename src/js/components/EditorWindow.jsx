import React, { Component } from "react";
import { connect } from "react-redux";
import { Editor } from 'slate-react';
import Typ from "../utils/Typ.js";
import { Value, Block, Document, Text } from 'slate';
import Plain from 'slate-plain-serializer'
import EditorProperties from "./EditorProperties.jsx";
import EditorSuggestions from "./EditorSuggestions.jsx";
import { COLORS, ASSET_TYPE } from "../constants.js";
import { setEditorTarget, setEditorPropertiesFor, removeAsset, } from "../actions/index.js";
import { vw, vh, vmin, vmax } from "../utils/viewport-helper.jsx";

const DEFAULT_MARGIN = vmin(2);
let needsInit = true;

let windowResized = false;
let lastKnownText = "";
let isTyping = false;
let willRealign = false;

const mapStateToProps = state => {
  return {
    editorTarget: state.editorTarget,
    editorProperties: state.editorProperties,
    editorSelectedProperty: state.editorSelectedProperty,
  };
};

const mapDispatchToProps = {
  setEditorTarget,
  setEditorPropertiesFor,
  removeAsset,
};

const existingValue = localStorage.getItem('content');
const initialValue = Plain.deserialize(
  existingValue || ''
);


class ConnectedEditorWindow extends Component{

  state = {
      waitForPropsToUpdate: false,
      lastTextContent: null,
      validText: false,
      value: initialValue,
      savedContent: null,
      editorTarget: null,
      editorSelectedProperty: null,
      left: 0,
      top: 0,
      pointerOffsetLeft: 0,
      pointerOffsetTop: 0,
      pointerRotation: "0deg",
      editorPointerWidth: 0,
      editorWindowWidth: 0,
      editorWindowWidth: 0,
      editHistory: {},
      editorMark: 'none',
  }

  schema = {
    annotations: {
      highlight: {
        isAtomic: true,
      },
    },
  }

  constructor(props) {
    super(props);
    this.editor = React.createRef();
    this.editorWindow = React.createRef();
    this.editorPointer = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.findValuesForWindowSize();
  }

  findValuesForWindowSize = () =>{
    var editorWindow = this.editorWindow.current;
    var startLeft = window.innerWidth / 2;
    var startTop = window.innerHeight /2;
    var editorWidth = vmin(60);
    var editorHeight = vmin(25);
    if(editorWindow){
      startLeft -= editorWindow.offsetWidth / 2;
      startTop -= editorWindow.offsetTop / 2;
    }
    var editorPointer, editorPointerWidth;
    editorPointer = this.editorPointer.current;
    if(editorPointer)
      editorPointerWidth = editorPointer.offsetWidth;

    if(this.state.editorWindowWidth !== editorWidth || this.state.editorWindowHeight !== editorHeight){
      this.setState({
        editorWindowWidth: editorWidth,
        editorWindowHeight: editorHeight,
        editorPointerWidth: editorPointerWidth,
        left: startLeft, top: startTop,
        editorCenter: {left: startLeft, top: startTop}
      });

      return true;
    }else {
      return false;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () =>{
    if(this.state.vWidth !== window.innerWidth || this.state.height !== window.innerHeight){
      this.setState({vWidth: window.innerWidth, vHeight: window.innerHeight,});
      this.findValuesForWindowSize();
      this.forceUpdate();
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState){
    //  THIS WAS CAUSING THE APP TO FLICKER
    // if(prevProps.editorTarget !== this.props.editorTarget){
    //   this.editor.current.focus();
    // }

    return null;
  }

  componentDidUpdate(){

    //  We need to recalculate our editor sizes for the new window
    if(needsInit){
      //this.findValuesForWindowSize();
      needsInit = false;
    }

    //  Skip an update so we can have the newest props from our dispatch
    if(this.state.waitForPropsToUpdate){
      this.setState({waitForPropsToUpdate: false});
      return;
    }

    var targetId = this.props.editorTarget;
    var open = targetId;
    if(open){
      var target = document.getElementById(targetId);
      if(target){

        this.attachToTarget(target);

        if(!this.state.editorTarget){
          this.alignWindowTo(target);
        }
        else if(!willRealign){
          willRealign = true;

          setTimeout(() =>{
            this.alignWindowTo(target);
            willRealign = false;
          }, 100)
        }

      }
    }else{
      if(this.state.savedContent || this.state.editorSelectedProperty)
        this.setState({savedContent: null, editorTarget: null, editorSelectedProperty: null, lastTextContent: null});
    }
  }

  onKeyDown = (event, editor, next) =>{
    isTyping = true;
    setTimeout(() =>{
      if(isTyping)
        isTyping = false;
    }, 2000);

    return next();
  }

  /**
     * On change, save the new `value`.
     *
     * @param {Editor} editor
     */

  onChange = ({ value }) => {
    if (value.document !== this.state.value.document) {
      const content = Plain.serialize(value);
    }

    this.setState({ value })
  }

  onBlur = (event, editor, next) => {
    if(this.props.editorTarget && isTyping){
      setTimeout(() => {
        this.editor.current.withoutSaving(() =>{
          this.editor.current.focus();
          this.editor.current.moveToEndOfNode(this.state.value.document);
        })
      }, 200);
    }

    return next();
  };

  /**
   * Render a Slate mark.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderMark = (props, editor, next) => {
    const { children, mark, attributes } = props

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>
      case 'code':
        return <code {...attributes}>{children}</code>
      case 'italic':
        return <em {...attributes}>{children}</em>
      case 'underlined':
        return <u {...attributes}>{children}</u>
      case 'valid':
        return <span {...attributes} style={{color: "black", margin: 0, padding: 0,}}>{children}</span>
      default:
        return next()
    }
  }

  /**
   * Render a Slate annotation.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderAnnotation = (props, editor, next) => {
    const { children, annotation, attributes } = props

    switch (annotation.type) {
      case 'valid':
        return (
          <span {...attributes} style={{ color: 'black' }}>
            {children}
          </span>
        )
      default:
        return next()
    }
  }


  onSubmit = () => {
    this.updateHistoryFor(this.state.editorTarget);
    this.setState({editorTarget: null, savedContent: null, waitForPropsToUpdate: true,});
    this.props.setEditorTarget(null);
  }

  onCancel = () => {
    var target = document.getElementById(this.props.editorTarget);
    var targetRef = this.props.editorTargetRef.current;
    if(targetRef){
      targetRef.setPropertyValue(this.props.editorSelectedProperty, this.state.savedContent);
    }
    this.setState({editorTarget: null, savedContent: null, waitForPropsToUpdate: true,});
    this.props.setEditorTarget(null);
  }

  onRemove = () => {
    this.props.removeAsset(this.state.editorTarget);
    this.props.setEditorTarget(null);
    this.setState({editorTarget: null, savedContent: null, waitForPropsToUpdate: true,});
  }

  onSuggestionClicked = (suggestion) =>{
    var editor = this.editor.current;
    const currentText = Plain.serialize(this.state.value);

    var doc = this.state.value.document
    if(suggestion === "clear"){
      editor.moveToStartOfNode(doc).moveFocusToEndOfNode(doc).delete().focus();

      var defaultVal = Typ.getDefault(this.props.editorSelectedProperty.uniqueId);
      setTimeout(() => {
        var targetRef = this.props.editorTargetRef.current;
        if(targetRef)
          targetRef.setPropertyValue(this.props.editorSelectedProperty, defaultVal);
      }, 100)

    }else
      editor.moveToStartOfNode(doc).moveFocusToEndOfNode(doc).insertText(suggestion).focus();
  }

  render() {
    var open = this.props.editorTarget;
    var pointerRotation = this.state.pointerRotation;

    return (
      <div id="EditorWindow" ref={this.editorWindow}
      style={{
        position: "absolute",
        backgroundColor: COLORS.OFFWHITE,
        zIndex: 101,
        width: open ? this.state.editorWindowWidth: 0, height: open? this.state.editorWindowHeight: 0,
        maxWidth: "40em",
        left: this.state.left, top: this.state.top,
        border: "1px solid darkgray", borderRadius: "7px",
        transition: "opacity 0.1s ease-in-out",
        transition: "left, top, width, height, 0.2s ease-in-out",
        opacity: open? 1.0: 0,
        pointerEvents:open? "all": "none",
      }}>

        <img id="EditorPointer" ref={this.editorPointer} src="https://image.flaticon.com/icons/svg/25/25678.svg" draggable="false"
        style={{
          position: "absolute",
          marginLeft: open? this.state.pointerOffsetLeft: 0, marginTop: open? this.state.pointerOffsetTop: 0, top: open? "-6%": "0%",
          height: "12%", width: "5%",
          filter: "invert(1) brightness(0.97)",
          transform: "rotate(" +pointerRotation +")",
          transition: "margin-left, top, 0.2s ease-in-out", }}/>

        <div id="EditorTextField"
        style={{
          position: "absolute",
          backgroundColor: "#f8f8ff",
          zIndex: 101,
          width: open? "100%": 0, height: open? "15vmin": 0,
          maxWidth: "40em",
          marginTop: "5vmin",
          display: "flex",
          borderTop: "1px solid darkgray", borderRadius: "7px",
          transition: "left, width, 0.2s ease-in-out",
        }}>
          <Editor ref={this.editor}
            autoFocus={true}
            value={this.state.value}
            schema={this.schema}
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
            onBlur={this.onBlur}
            renderMark={this.renderMark}
            renderAnnotation={this.renderAnnotation}
            style={{
              display: open? "block": "none",
              width: "98%",
              height: "80%",
              overflowY: "scroll",
              padding: "1vmin",
              fontSize: "2vmin",
              backgroundColor: "transparent",
              color: this.state.validText? "black": "grey",
              transition: "color 0.2s ease-in-out",}} />
        </div>

        <EditorProperties />


        <div style={{
          position: "absolute",
          width: "100%", height: "20%",
          borderTop: "1px solid darkgray",
          display: "flex", flexDirection: 'row',
          zIndex: 102, bottom: 0,}}
          >

            <EditorSuggestions selectedProperty={this.state.editorSelectedProperty} input={this.state.value} onSuggestionClicked={(suggestion) => this.onSuggestionClicked(suggestion)} />




            <div style={{width: "1vmin"}} />

            <div id="Trash Button" className="EditorHoverButton"
              onClick={this.onRemove}
              style={{
                width: "3vmin", height: "3vmin",
                display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center", flexShrink: "0",

              }}
            >
              <img src="https://image.flaticon.com/icons/svg/126/126468.svg" title="Delete Element" style={{width: "60%", height: "60%", filter: "invert(1) brightness(0.4)"}}/>
            </div>

            <div style={{width: "1vmin"}} />

        </div>


        <div style={{position: "absolute", top: "1vmin", right: 0}}>
          <div id="Submit Button" title="Submit" className="EditorHoverButton"
            onClick={this.onSubmit}
            style={{
              position: "absolute",
              right: "1vmin",
              width: "3vmin", height: "3vmin",
              display: "flex", alignItems: "center", justifyContent: "center",
              }}
          >
            <img className="EditorHoverButton-image" src="https://image.flaticon.com/icons/svg/447/447147.svg"
            style={{width: "40%", height: "40%", filter: "invert(1) brightness(0.6) sepia(100%) saturate(300%) brightness(70%) hue-rotate(100deg)"}} />
          </div>

          <div id="Cancel Button" title="Cancel" className="EditorHoverButton"
            onClick={this.onCancel}
            style={{
              position: "absolute",
              right: "5vmin",
              width: "3vmin", height: "3vmin",
              display: "flex", alignItems: "center", justifyContent: "center",
              }}
          >
            <img className="EditorHoverButton-image" src="https://image.flaticon.com/icons/svg/447/447047.svg"
            style={{width: "30%", height: "30%", filter: "invert(1) brightness(0.5) sepia(100%) saturate(300%) brightness(70%) hue-rotate(320deg)"}} />
          </div>
        </div>
      </div>
    )
  }

  alignWindowTo = () =>{
    var target = this.props.editorTargetRef.current;
    if(!target) return;

    var screenWidth, screenHeight, editorWidth, editorHeight, left, top, projectedWidth, projectedHeight, pointerOffsetLeft, pointerOffsetTop, pointerRotation;
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    var {editorWindowWidth, editorWindowHeight} = this.state;
    pointerOffsetLeft = pointerOffsetTop = 0;
    pointerRotation = "0deg";

    left = target.getLeft() + target.getWidth() / 2;
    top = target.getTop() + target.getHeight() + vmax(2);

    projectedHeight = top + editorWindowHeight
    if(projectedHeight + DEFAULT_MARGIN > screenHeight){
      pointerRotation = "180deg";
      pointerOffsetTop = editorWindowHeight;// + vmax(2);
      top = target.getTop() - editorWindowHeight - vmax(2);
    }

    projectedWidth = left + editorWindowWidth;
    if(projectedWidth + DEFAULT_MARGIN > screenWidth) {
      var leftOver = projectedWidth - screenWidth + DEFAULT_MARGIN;
      pointerOffsetLeft = leftOver;
      left -= leftOver;

      if(left + pointerOffsetLeft + DEFAULT_MARGIN > left + editorWindowWidth)
        pointerOffsetLeft = editorWindowWidth - this.state.editorPointerWidth - DEFAULT_MARGIN;
    }

    if(this.state.left !== left || this.state.top !== top ||
      this.state.pointerOffsetLeft !== pointerOffsetLeft || this.state.pointerOffsetTop !== pointerOffsetTop)
      this.setState({left: left, top: top, pointerOffsetLeft: pointerOffsetLeft, pointerOffsetTop: pointerOffsetTop, pointerRotation: pointerRotation});
  }


  attachToTarget = (target) =>{
    if(target.id.includes("parent"))
      target = document.getElementById(target.id.replace("parent",''));

    var targetRef = this.props.editorTargetRef.current;

    if(!target){
      console.log("ERROR", "Null target in attachToTarget");
      return;
    }

    //  Do some refresh operations if a new target was selected
    if(this.props.editorTarget !== this.state.editorTarget){

      //  Update editor properties to reflect current target
      this.props.setEditorPropertiesFor(target.dataset.type);

      //  Give us the new editorTarget and tell the component that it has
      //  a new selection that needs new props
      this.setState({editorTarget: this.props.editorTarget, editorSelectedProperty: null, savedContent: null, lastTextContent: null,});
      return
    }

    //  We have new editor properties so we can now read from the current selection
    if(this.state.editorSelectedProperty !== this.props.editorSelectedProperty){

      //  No target is selected so we can update our state and ignore
      if(!this.props.editorSelectedProperty){
        this.setState({editorSelectedProperty: null});
        return;
      }

      //  A timeout is required before focusing the Editor
      //  otherwise it will not focus the window as desired
      setTimeout(() => {
        if(!this.editor.current) return;

        this.editor.current.withoutSaving(() => {
          this.editor.current.focus();
          this.editor.current.moveToEndOfNode(this.state.value.document);
        });
      }, 200);

      var targetData = targetRef.getPropertyValue(this.props.editorSelectedProperty);

      if(!targetData){
        console.log("Invalid targetData, setting data to empty string");
        targetData = "";
      }

      //  We can assume the value coming directly from the target's css is valid
      setTimeout(() => {
        if(this.editor.current){
          this.editor.current.withoutSaving(() =>{
            this.doDarkenOn(this.editor.current.value.document, targetData);
          })
        }
      }, 100);

      var value = Plain.deserialize(targetData);
      var updatedValue = value;
      // var valueData = this.state.editHistory[target.id];
      // var updatedValue = valueData? value.set('data', valueData): value;

      //  Finish update by setting our editorTarget to the new one
      this.setState({newSelection: false, editorSelectedProperty: this.props.editorSelectedProperty, savedContent: targetData, value: updatedValue});
    }

    if(!this.state.editorSelectedProperty)
      return;

    if(target.dataset){
      const text = Plain.serialize(this.state.value);

      if(text === lastKnownText) return;
      lastKnownText = text;

      targetRef.setPropertyValue(this.props.editorSelectedProperty, Typ.complicate(text, this.props.editorSelectedProperty.css));
    }

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
        newValue = Typ.complicate(newValue, css);
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

  //  Wanted to show a user that their input was actually applied to the element.
  //
  //  A neat trick to check if a css property is valid is to just read from
  //  the elment after setting its value.
  //  If it's the same as the one you typed in, we darken the text
  darkenIfValid = (target, property, newValue) =>{
    var setValue = this.getPropertyValueForTarget(target, property);
    if(newValue.charAt(0) === "#")
      setValue = this.rgbToHex(setValue);
    else
      setValue = this.parseFixes(setValue);

      if(this.state.lastTextContent !== newValue.toUpperCase()){
        this.setState({lastTextContent: newValue.toUpperCase()});
        setTimeout(() => {

          //If they're still typing, wait
          if(newValue.toUpperCase() !== this.state.lastTextContent) return;

          if(!this.state.value.document || !setValue){
            if(this.state.validText)
              this.setState({validText: false});
            return;
          }

          // var editor = this.editor.current;
          //
          // const { value } = editor;
          // const { document, annotations } = value
          // editor.withoutSaving(() => {
          //   annotations.forEach(ann => {
          //     if (ann.type === 'valid') {
          //       editor.removeAnnotation(ann)
          //     }
          //   })

          if(setValue !== '' && setValue.toUpperCase() === Typ.simplify(newValue, property.css).toUpperCase() ){
            this.setState({validText: true});
            Typ.save(newValue, property.uniqueId);
          }else{
            this.setState({validText: false});
          }

        }, 200);
      }
  }
  doDarkenOn = (document, text) =>{
    this.setState({validText: true});
    return;

    // for (const [node, path] of document.texts()) {
    //   const { key, text } = node
    //   const parts = text.split(text)
    //   let offset = 0
    //
    //   var editor = this.editor.current;
    //   parts.forEach((part, i) => {
    //     if (i !== 0) {
    //       editor.addAnnotation({
    //         key: getHighlightKey(),
    //         type: 'valid',
    //         anchor: { path, key, offset: offset - text.length },
    //         focus: { path, key, offset },
    //       })
    //     }
    //
    //     offset = offset + part.length + text.length
    //   })
    // }
  }


  //  Assigns saved history from our state to the current value.
  //  This allows users to edit multiple objects without losing their
  //  respective history.
  updateHistoryFor = (targetId) =>{
    const history = this.state.value.data;
    const storedHistory = this.state.editHistory;
    storedHistory[targetId] = history;
    this.setState({editHistory: storedHistory});
  }

  //  Moves the cursor selection to the end of the document in the editor.
  //  This is called every time the editor selects a new target.
  moveCursorToEnd = (text, data) =>{
    var selection = this.state.value.get('selection');
    var focus = selection.get('focus');
    var endFocus = focus.moveToEndOfNode(this.state.value.document);
    var valueWithEndFocus = this.state.value.set('selection', selection.withMutations((sel) => {
      sel.set('focus', endFocus).set('anchor', endFocus)
    }));
    this.setState({value: valueWithEndFocus});
    if(this.editor.current)
      this.editor.current.focus();
  }


  componentToHex = (c) =>{
    if(!c) return "f";
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  rgbToHex = (rgb) =>{ //rgb(122, 199, 234, 1)
    if(!rgb) return rgb;
    var simpleRgb = rgb.replace(/rgb\(|,|\)/g, '');
    var split = simpleRgb.split(' ');
    var r = split[0];
    var g = split[1];
    var b = split[2];
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

}

let n = 0

function getHighlightKey() {
  return `highlight_${n++}`
}

const EditorWindow = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditorWindow);

export default EditorWindow
