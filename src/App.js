import React, { Component }  from 'react';
import { connect } from 'react-redux';
import List from "./js/components/List.jsx";
import Form from "./js/components/Form.jsx";
import MaterialInput from "./js/components/MaterialInput.jsx";
import EditableComponent from "./js/components/EditableComponent.jsx";
import Pen from "./js/components/Pen.jsx";
import AssetDrawer from "./js/components/AssetDrawer.jsx";
import EditorWindow from "./js/components/EditorWindow.jsx";
import './App.css';
import './InputBox.css';
import logo from './logo.svg';
import {COLORS, PEN_TYPE, ASSET_TYPE} from "./js/constants.js";
import { setEditorTarget } from './js/actions/index.js';

let mouseDownInsideEditor = false;

function mapStateToProps(state){
  return{
    ...state,
    editorTarget: state.editorTarget,
    editingContent: state.editingContent,
  };
}

const mapDispatchToProps = {
  setEditorTarget,
};

class App extends Component {



  state = {
    history: [],
    popStack: [],
    shiftDown: false,
    dragTarget: null,
    dragging: false,
    x: 0,
    y: 0,
    dragStartX: null,
    dragStartY: null,
    startW: null,
    startH: null,
    scaleEndX: null,
    scaleEndY: null,
    highlightLeft: null,
    highlightTop: null,
    highlightWidth: null,
    highlightHeight: null,
  }

  getSnapshotBeforeUpdate(prevProps, prevState){

    return null;
  }

  componentDidUpdate(){

    //  For showing the highlight box
    this.updateHighlightBoxDimens();
  }

  updateHighlightBoxDimens = () =>{
    var left, top, width, height;
    var targetId, target;
    targetId = this.props.editorTarget;
    if(targetId)
      target = document.getElementById(targetId);
    else
      target = this.state.dragTarget;

    if(target){
      var margin = 10;
      var rect = target.getBoundingClientRect();
      left = target.offsetLeft - margin /2;
      top = target.offsetTop - margin /2;
      width = target.offsetWidth + margin;
      height = target.offsetHeight + margin;

      if(this.state.highlightLeft != left || this.state.highlightTop != top ||
        this.state.highlightWidth != width || this.state.highlightHeight != height)
        this.setState({highlightLeft: left, highlightTop: top, highlightWidth: width, highlightHeight: height});
    }
  }

  handleKeyDown = (e) => {
    if(e.key === "Shift"){
      this.setState({shiftDown: true});
    }else if(!this.props.editorTarget && e.key === 'z' && e.metaKey && e.shiftKey){
      this.revertHistory();
    }else if(!this.props.editorTarget && e.key === 'z' && e.metaKey){
      this.popHistory();
    }

    setTimeout(() => {
      if(this.props.editorTarget)
        this.updateHighlightBoxDimens();
    }, 100)
  }

  handleKeyUp = (e) => {
    if(e.key === "Shift"){
      this.setState({shiftDown: false});
    }else if((e.key === 'z' && e.metaKey) || e.key === 'z' || e.metaKey){

    }
  }

  popHistory(){
    let {history, popStack} = this.state;

    if(!history || history.length <= 0){
      console.log("Can't recall from empty history");
      return;
    }

    var item = history.pop();
    let {target, posX, posY, scaleX, scaleY} = item;

    popStack.push({target: target,
      posX: (target.offsetLeft + "").replace("px", '') + "px",
      posY: (target.offsetTop + "").replace("px", '') + "px",
      scaleX:  (target.offsetWidth + "").replace("px", "") + "px",
      scaleY:  (target.offsetHeight + "").replace("px", "") + "px" });

    target.style.left = posX;
    target.style.top = posY;
    if(scaleX !== "px" && (target.style.width && target.style.width !== 0))
      target.style.width = scaleX;
    if(scaleY !== "px" && (target.style.height && target.style.height !== 0))
      target.style.height = scaleY;



    console.log("History popped!");
    this.setState({history: history, popStack: popStack});
  }

  revertHistory(){
    let {history, popStack} = this.state;

    if(!popStack || popStack.length <= 0){
      console.log("Haven't undone anything recently.");
      return;
    }


    var item = popStack.pop();
    let {target, posX, posY, scaleX, scaleY} = item;

    history.push({target: target,
      posX: (target.offsetLeft + "").replace("px", '') + "px",
      posY: (target.offsetTop + "").replace("px", '') + "px",
      scaleX:  (target.offsetWidth + "").replace("px", "") + "px",
      scaleY:  (target.offsetHeight + "").replace("px", "") + "px"});

    target.style.left = posX;
    target.style.top = posY;
    if(scaleX !== "px")
      target.style.width = scaleX;
    if(scaleY !== "px")
      target.style.height = scaleY;

    console.log("History reverted!");
    this.setState({history: history, popStack: popStack});
  }

  //  Tracks the mouse and uses a dragTarget to accomplish scale and location
  //  changes
  trackMouse = (e) =>{
    //  Edge case for a null event
    if(!e || !e.nativeEvent) return;

    //  Sets the location of the 'edit' circle that follows the cursor
    var spinny = document.getElementById("spinny");
    var x = e.pageX - (spinny.clientWidth / 2);
    var y = e.pageY - (spinny.clientHeight / 2);
    this.setState({x: x, y: y});

    //  For dragging and scaling
    var {dragStartX, dragStartY} = this.state;
    if(this.state.dragging){
      var target = this.state.dragTarget;
      if(!target) return;


      if(!this.state.shiftDown){
        // Dragging

        const targetW = target.offsetWidth;
        const targetH = target.offsetHeight;
        if(dragStartX == null || dragStartY == null){
          dragStartX = dragStartY = 0;
          dragStartX = e.pageX - target.offsetLeft;
          dragStartY = e.pageY - target.offsetTop;

          dragStartX -= (targetW / 2);
          dragStartY -= (targetH / 2);
          this.setState({dragStartX: dragStartX, dragStartY: dragStartY});

          return;
        }

        var newX, newY;
        newX = e.pageX - this.state.dragStartX;
        newY = e.pageY - this.state.dragStartY;
        //if(newX + (targetW / 2) > window.innerWidth || newY + (targetH / 2) > window.innerHeight) return;

        target.style.left = newX - (targetW / 2)+ "px";
        target.style.top = newY - (targetH / 2)+ "px";
      }else{
        // Scaling

        var {startW, startH, scaleEndX, scaleEndY} = this.state;

        // If we haven't started dragging yet, setup initial values
        if(dragStartX == null || dragStartY == null || scaleEndX == null || scaleEndY == null){
          console.log("New scale values initialized");
          dragStartX = e.pageX;
          dragStartY = e.pageY;

          startW = target.offsetWidth;
          startH = target.offsetHeight;

          scaleEndX = (dragStartX - startW);
          scaleEndY = (dragStartY - startH);

          // dragStartX -= (startW / 2);
          // dragStartY -= (startH / 2);
          // scaleEndX -= (startW / 2);
          // scaleEndY -= (startH / 2);

          this.setState({dragStartX: dragStartX, dragStartY: dragStartY, startW: startW, startH: startH, scaleEndX: scaleEndX, scaleEndY: scaleEndY});
          return;
        }
        var difX = e.pageX - scaleEndX;
        var difY = e.pageY - scaleEndY;
        var percX = difX / this.state.startW;
        var percY = difY / this.state.startH;

        target.style.width = this.state.startW * percX + "px";
        target.style.height = this.state.startH * percY + "px";

        //console.log(" Dif y: " +difY +" endY: " +scaleEndY);
        //console.log(" Start H: " + this.state.startH +" perc X " + percX +" percY: " +percY +" height: " +target.style.height);
      }

    }
  }

  onMouseDown = (e) =>{
    if(this.props.editorTarget && this.isInsideEditor(e.pageX, e.pageY))
      mouseDownInsideEditor = true;

    if(this.props.penType !== PEN_TYPE.EDIT) return;

    const target = document.elementFromPoint(e.pageX, e.pageY);
    if(!target || !target.dataset || !target.dataset.edit) return;

    var history = this.state.history;
    history.push({target: target,
      posX: (target.offsetLeft + "").replace("px", '') + "px",
      posY: (target.offsetTop + "").replace("px", '') + "px",
      scaleX:  (target.offsetWidth + "").replace("px", "") + "px",
      scaleY:  (target.offsetHeight + "").replace("px", "") + "px"});
    this.setState({history: history, popStack: []});

    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;

    target.style.cursor = "default";
    target.draggable = false
    this.setState({dragTarget: target, dragging: true, dragStartX: null, dragStartY: null});
  }

  onMouseUp = (e) =>{
    if(!e || !e.nativeEvent) return;

    this.setState({dragging: false, dragTarget: null, scaleEndX: null, scaleEndY: null, startW: null, startH: null, dragStartX: null, dragStartY: null,});
  }

  handleClick = (e) =>{
    if(this.props.penType === PEN_TYPE.EDIT)
      return;

    if(mouseDownInsideEditor || (this.props.editorTarget && this.isInsideEditor(e.pageX, e.pageY)) ){
      console.log("Clicked involved the editor");
      mouseDownInsideEditor = false;
      return;
    }
    mouseDownInsideEditor = false;

    var target;
    target = document.elementFromPoint(e.pageX, e.pageY);

    if(target && target.id && target.id.includes("AssetGroup")){
      target = document.getElementById(target.id.replace("AssetGroup", ''));
    }

    if(!target || !target.dataset.edit || (!target.dataset.edit && target.dataset.dragger) || !target.id) {
      this.props.setEditorTarget(null);
      return;
    }

    // var style = document.createElement('style');
    // style.type = 'text/css';
    // var keyFrames = '\
    // @-webkit-keyframes spinIt {\
    //     100% {\
    //         -webkit-transform: rotate(A_DYNAMIC_VALUE);\
    //     }\
    // }\
    // @-moz-keyframes spinIt {\
    //     100% {\
    //         -webkit-transform: rotate(A_DYNAMIC_VALUE);\
    //     }\
    // }';
    // style.innerHTML = keyFrames.replace(/A_DYNAMIC_VALUE/g, "180deg");
    // target[0].appendChild(style);

    this.props.setEditorTarget(target.id);
    console.log("Setting target to: " +target.id);
  }
  isInsideEditor = (x, y) =>{
    var editor = document.getElementById("EditorWindow");
    if(!editor) return false;
    var rect = editor.getBoundingClientRect();

    return rect &&
      rect.left < x && rect.top < y &&
      rect.right > x && rect.bottom > y;
  }


  render(){
    let {x, y} = this.state;
    let {assets} = this.props;

    const spinnyStyle = {
      zIndex: "10",
      alignItems: 'center',
      justifyContent: 'center',
      textAlign:'center',
      position: 'absolute',
      left: x,
      top: y,
      cursor: "default",
      pointerEvents: "none",
      background: this.props.penType === PEN_TYPE.EDIT ? "radial-gradient(" +COLORS.EDIT +", transparent)": "transparent",
      borderRadius: "50%",
      width:15,
      height:15,
    };

    const containerStyle = {
      borderWidth: 1,
      borderRadius: 2,
      borderColor: '#ddd',
      borderBottomWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: '0.8',
      shadowRadius: 2,
      elevation: 1,
      marginLeft: 5,
      marginRight: 5,
      marginTop: 10,
    };


    const spinny = <div id="spinny" style = {spinnyStyle}/>;

    const img = <img id="img" src={logo} className="App-logo" alt="logo"
    draggable="false" data-edit="true" data-type={ASSET_TYPE.IMAGE}
    style = {
      {
        //animation: "spin infinite 20s linear",
        display: "inline-block",
        zIndex: 0,
        position: 'absolute',
        pointerEvents: !this.props.penType === PEN_TYPE.EDIT,
        top: 100}}
        />

    return(
      <div className="App" tabIndex="0"
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
        onClick={this.handleClick}
        onMouseMove={this.trackMouse}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp} >

        {spinny}
        <Pen />
        <AssetDrawer />
        <EditorWindow />

        <div>
          {assets.map(asset => (
            this.renderAsset(asset)
          ))}

          {this.drawHighlightBox()}
        </div>

        <header className="App-header">

        </header>
      </div>
    )
  };

  /*
  <div data-edit="true" style={{position: 'absolute', top: 500}}>
    <Form />
  </div>
  <div className="col-md-4 offset-md-1" data-edit="true" style={{position: 'absolute', top: 600}}>
    <List />
  </div>
  */

  renderAsset = (description) =>{
    return <EditableComponent description={description} />


    // let asset;
    // switch (description.type){
    //   case ASSET_TYPE.TEXT:
    //     asset =
    //     <p
    //       id={description.id} key={description.id}
    //       data-type={description.type} data-edit="true"
    //       style={{...description.style, margin: 0, fontSize: "4vmin", position: "absolute", left: description.left, top: description.top}}>{description.content}
    //     </p>;
    //     break;
    //   case ASSET_TYPE.IMAGE:
    //     asset =
    //     <img
    //       id={description.id} key={description.id}
    //       data-type={description.type} data-edit="true"
    //       src={description.content}
    //       style={{ ...description.style, position: "absolute", margin: 0, left: description.left, top: description.top}}
    //     />;
    //     break;
    //   case ASSET_TYPE.VIDEO:
    //   asset =
    //     <div id={description.id + "parent"} key={description.id + "parent"}
    //       data-type={description.type} data-edit="true"
    //       style={{
    //         width: "30vmin", height: "26vmin",
    //         display: "flex", alignItems: "center", justifyContent: "center",
    //         position: "absolute",
    //         backgroundColor: "transparent",
    //         left: description.left, top: description.top}}>
    //       <iframe
    //         id={description.id} key={description.id}
    //         data-type={description.type}
    //         src={description.content}
    //         style={{margin: 0, padding: 0, border: "1px solid white", width: "80%", height: "60%", pointerEvents: this.props.penType === PEN_TYPE.EDIT? "none": "all", }}
    //       />
    //     </div>
    //   break;
    //   case ASSET_TYPE.INPUT:
    //   asset =
    //     <div id={description.id + "parent"} key={description.id + "parent"}
    //       data-type={description.type} data-edit="true"
    //       style={{
    //         padding: "4vmin",
    //         display: "flex", alignItems: "center", justifyContent: "center",
    //         position: "absolute",
    //         backgroundColor: "transparent",
    //         left: description.left, top: description.top}}>
    //
    //         <MaterialInput description={description}/>
    //       {/*
    //       <form
    //         data-type={description.type}
    //         style={{margin: 0, padding: 0, pointerEvents: this.props.penType === PEN_TYPE.EDIT? "none": "all", }}>
    //           <input
    //           type="text"
    //           id={description.id}
    //           key={description.id}
    //           data-type={description.type}
    //           name="fname"
    //           style={{margin: "8px 0", padding: "10px 10px", color: "black", borderRadius: "10px", backgroundColor: "transparent", width: "12vmin", height: "2vmin"}} />
    //       </form>
    //       */}
    //     </div>
    //   break;
    // }
    // asset.props.style.zIndex = 1;
    //
    // return asset;
  }

  drawHighlightBox = () =>{
    var {highlightLeft, highlightTop, highlightWidth, highlightHeight} = this.state;


    var show = this.props.editorTarget || this.state.dragTarget;

    var img =
    <div style={{
      position: 'absolute',
      display: "flex",
      pointerEvents: "none",
      width: highlightWidth, height: highlightHeight,
      left: highlightLeft, top: highlightTop,
      border: "1px solid " + COLORS.EDIT,
      opacity: show? "1": "0.0",
      transition: "opacity 0.2s ease-in-out"}} />

    return img;
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(App);
