import React, { Component } from "react";
import { connect } from "react-redux";
import { ASSET_TYPE } from "../constants.js";
import { addAsset } from "../actions/index.js";
import { findTarget } from "../target-finder.jsx";
import DataHelper from "../utils/DataHelper.js";

const mapStateToProps = state => {
  return {
    assets: state.assets,
    drawerAssets: state.drawerAssets,
  };
};

// In this object, keys become prop names,
// and values should be action creator functions.
// They get bound to `dispatch`.
const mapDispatchToProps = {
  addAsset,
};

var dragEl = null;

class ConnectedAssetDrawer extends Component{

  state = {
    open: true,
    dragger: null,
    dragStartX: null,
    dragStartY: null,
  }


  componentDidMount(){
    document.addEventListener('mousemove', this.trackMouse);
    document.addEventListener('mouseup', this.removeDrag);
  }

  startDrag = (e) =>{
    var target = document.elementFromPoint(e.pageX, e.pageY);
    if(!target) return;
    var assetID = target.id.replace('parent', '');
    target = document.getElementById(assetID);
    this.setState({dragger: target.id + "dragger"});

    console.log("Dragging: " +target.id);
  }

  removeDrag = (e) =>{
    var target = document.getElementById(this.state.dragger);
    if(!target) return;
    var targetRect = target.getBoundingClientRect();
    var me = document.getElementById("AssetDrawer");
    if(me){
      var drawerRect = me.getBoundingClientRect();
      if(drawerRect && drawerRect.left < (targetRect.right - targetRect.width / 2) ){
        this.setState({dragger: null});
        dragEl = null;
        target = null;
        return;
      }
    }
    var id = target.id.replace("dragger", '');
    console.log("Pushing asset: " +id +" at position: " +targetRect.left +" " +targetRect.top);

    var packagedAsset = DataHelper.packageAsset(target, id);

    this.props.addAsset(packagedAsset);
    this.setState({dragger: null});
    dragEl = null;
  }

  trackMouse = (e) =>{
    let targetId = this.state.dragger;
    if(!targetId) return;
    let target = document.getElementById(targetId);
    if(!target) return;

    var {dragStartX, dragStartY} = this.state;
    const targetW = target.offsetWidth;
    const targetH = target.offsetHeight;
    if(dragStartX == null || dragStartY == null){
      dragStartX = dragStartY = 0;
      //console.log("left: "+ target.style.left +" top: " + target.style.top);
      dragStartX = e.pageX - target.offsetLeft;
      dragStartY = e.pageY - target.offsetTop;
      //if(dragStartX > (targetW * DRAG_RANGE) || dragStartY > (targetH * DRAG_RANGE))
      //return;

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
  }

  slideInOut = () =>{
    this.setState({open: !this.state.open});
  }

  render() {
    var marginRight = this.state.open? 0: "-18vmin";
    const {drawerAssets} = this.props;
    return (
      <div id="AssetDrawer" className="AssetDrawer" style={{zIndex: 100, width: "20vmin", height: "100vh", marginRight: marginRight, display: "flex", }}>
        <table className="Assets" onMouseDown={this.startDrag} style={{pointerEvents: this.state.open? "all": "none",}}>
          <tbody>

            {drawerAssets.map(description => (
                this.renderAsset(description)
            ))}
          </tbody>
        </table>
        <div className="ADrawer-Arrow"
          onClick={this.slideInOut}
          style={{bottom: 0}} >
           <p style={{margin: 0, cursor: "default", color: "white", marginLeft: "-25vmin", marginTop: "90vh", fontSize: "4vmin"}}> &lt; </p>
        </div>
      </div>
    )
  }

  renderAsset = (drawerAsset) =>{
    var asset, dragger;
    switch(drawerAsset.type){
      case ASSET_TYPE.TEXT:
        asset = <p id={drawerAsset.type} data-type={drawerAsset.type} data-content={drawerAsset.content} style={{ margin: 0, fontSize: "4vmin", color: "white", position: "absolute",}}> {drawerAsset.content} </p>;
        break;
      case ASSET_TYPE.IMAGE:
        asset = <img id={drawerAsset.type} data-type={drawerAsset.type} src={drawerAsset.content} data-content={drawerAsset.content} draggable="false" style={{ margin: 0, width: "12vmin", height: "12vmin", filter: "invert(1)", position: "absolute"}} />;
        break;
      default:
        asset = <img id={drawerAsset.type} data-type={drawerAsset.type} src={drawerAsset.content} data-content={drawerAsset.content} draggable="false" style={{ margin: 0, width: "12vmin", height: "12vmin", filter: "invert(1)", position: "absolute"}} />;
        break;
    }

    if(this.state.dragger === drawerAsset.type + "dragger" && this.dragEl == null) {
      dragger = React.cloneElement(asset, {id: drawerAsset.type + "dragger"});
      console.log("Cloning: " +dragger.id);
    }

    var parentID = drawerAsset.type + "parent";

    return (
      <tr key={drawerAsset.type + "parent"} style={{height: "15vmin",}}>
        <td id={parentID} className="ADrawer-Asset"
          data-dragger="true"
          key={drawerAsset.type}
          onClick={this.handleClick}
          style={{ minHeight: "5vmin", minWidth: "5vmin", width: "19vmin", height: "19vmin", textAlign: "center", overflow: "hidden" }}>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {asset}
            {dragger}
          </div>
        </td>
      </tr>

    )
  }

}


const AssetDrawer = connect(mapStateToProps, mapDispatchToProps)(ConnectedAssetDrawer);

export default AssetDrawer
