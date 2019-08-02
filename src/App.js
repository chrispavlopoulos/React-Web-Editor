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
import logo from './logo.svg';
import {COLORS, PEN_TYPE, ASSET_TYPE} from "./js/constants.js";
import { setEditorTarget } from './js/actions/index.js';

let mouseDownInsideEditor = false, draggedSomething = false;

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
    dragStart: null, //{startX: , startY: , absoluteX: , absoluteY: }
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

  componentDidMount(){
    window.addEventListener("keydown", this.handleKeyDown, true);
    window.addEventListener("keyup", this.handleKeyUp, true);

    this.selectedAsset = React.createRef();
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

    target = this.selectedAsset.current;

    if(target){
      var margin = 10;
      left = target.getLeft() - margin /2;
      top = target.getTop() - margin /2;
      width = target.getWidth() + margin;
      height = target.getHeight() + margin;

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
    var startX, startY, absoluteStartX, absoluteStartY;
    if(this.state.dragStart){
      startX = this.state.dragStart.startX;
      startY = this.state.dragStart.startY;
      absoluteStartX = this.state.dragStart.absoluteX;
      absoluteStartY = this.state.dragStart.absoluteY;
    }

    // Dragging or scaling something
    if(this.state.dragging){
      var targetRef = this.selectedAsset.current;
      if(!targetRef)
      return;

      var target = targetRef.container.current;

      //var child = document.getElementById(target.id + "AssetGroup");

      if(!this.state.shiftDown){
        // Dragging

        const targetW = target.offsetWidth;
        const targetH = target.offsetHeight;
        if(startX == null || startY == null){
          startX = startY = 0;
          startX = e.pageX - target.offsetLeft;
          startY = e.pageY - target.offsetTop;

          startX -= (targetW / 2);
          startY -= (targetH / 2);
          this.setState({dragStart: {startX: startX, startY: startY, absoluteX: e.pageX, absoluteY: e.pageY}} );

          return;
        }


        var newX, newY;
        newX = e.pageX - startX;
        newY = e.pageY - startY;
        //if(newX + (targetW / 2) > window.innerWidth || newY + (targetH / 2) > window.innerHeight) return;

        var dif = Math.abs(e.pageX - absoluteStartX) + Math.abs(e.pageY - absoluteStartY);
        if(dif < 10) return;

        draggedSomething = true;

        target.style.left = newX - (targetW / 2)+ "px";
        target.style.top = newY - (targetH / 2)+ "px";
      }else{
        // Scaling

        target = targetRef.getAssetDOM();

        var {startW, startH, scaleEndX, scaleEndY} = this.state;

        // If we haven't started dragging yet, setup initial values
        if(startX == null || startY == null || scaleEndX == null || scaleEndY == null){
          console.log("New scale values initialized");
          startX = e.pageX;
          startY = e.pageY;


          startW = target.offsetWidth;
          startH = target.offsetHeight;

          scaleEndX = (startX - startW);
          scaleEndY = (startY - startH);

          // dragStartX -= (startW / 2);
          // dragStartY -= (startH / 2);
          // scaleEndX -= (startW / 2);
          // scaleEndY -= (startH / 2);

          this.setState({dragStart: {startX: startX, startY: startY, absoluteX: e.pageX, absoluteY: e.pageY}, startW: startW, startH: startH, scaleEndX: scaleEndX, scaleEndY: scaleEndY});
          return;
        }
        var difX = e.pageX - scaleEndX;
        var difY = e.pageY - scaleEndY;
        var percX = difX / this.state.startW;
        var percY = difY / this.state.startH;

        var dif = Math.abs(e.pageX - absoluteStartX) + Math.abs(e.pageY - absoluteStartY);
        if(dif < 10) return;

        draggedSomething = true;

        target.style.width = this.state.startW * percX + "px";
        target.style.height = this.state.startH * percY + "px";

        //console.log(" Dif y: " +difY +" endY: " +scaleEndY);
        //console.log(" Start H: " + this.state.startH +" perc X " + percX +" percY: " +percY +" height: " +target.style.height);
      }

      if(draggedSomething && this.props.editorTarget)
        this.props.setEditorTarget(null);
    }
  }

  onMouseDown = (e) =>{
    if(this.props.editorTarget && this.isInsideEditor(e.pageX, e.pageY))
      mouseDownInsideEditor = true;

    //if(this.props.penType !== PEN_TYPE.EDIT) return;

    var target = document.elementFromPoint(e.pageX, e.pageY);

    if(target && target.id && target.id.includes("AssetGroup")){
      target = document.getElementById(target.id.replace("AssetGroup", ''));
    }

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
    this.setState({dragTarget: target.id, dragging: true, dragStart: null});
  }

  onMouseUp = (e) =>{
    if(!e || !e.nativeEvent) return;

    this.setState({dragging: false, dragTarget: null, scaleEndX: null, scaleEndY: null, startW: null, startH: null, dragStart: null,});
  }

  handleClick = (e) =>{
    if(draggedSomething){
      draggedSomething = false;
      return;
    }

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
        onClick={this.handleClick}
        onMouseMove={this.trackMouse}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp} >

        {spinny}
        <Pen />
        <AssetDrawer />
        <EditorWindow editorTargetRef={this.selectedAsset}/>

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

  renderAsset = (description) =>{
    if( (this.state.dragTarget === description.id) || (this.props.editorTarget && this.props.editorTarget === description.id) )
      return <EditableComponent ref={this.selectedAsset} description={description} />
    else
      return <EditableComponent description={description} />
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
