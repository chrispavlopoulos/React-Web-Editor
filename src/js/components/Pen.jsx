import React, { Component } from "react";
import { connect } from "react-redux";
import { vw, vh, vmin, vmax } from "../utils/viewport-helper.jsx";
import {APP_EDIT_COLOR} from "../constants.js";
import { changePen } from "../actions/index.js";


const mapStateToProps = state => {
  return {
    pens: state.pens,
    penType: state.penType,
  };
};

// in this object, keys become prop names,
// and values should be action creator functions.
// They get bound to `dispatch`.
const mapDispatchToProps = {
  changePen,
};

class ConnectedPen extends Component{

  state = {
    hoverTarget: null,
    open: false,
    marginRight: 0,
    vWidth: 0,
    vHeight: 0,
  }

  componentDidUpdate(){

  }

  componentDidMount() {
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  resize = () =>{
    if(this.state.vWidth !== window.innerWidth || this.state.height !== window.innerHeight){
      this.setState({vWidth: window.innerWidth, vHeight: window.innerHeight});
      this.forceUpdate();
    }
  }


  handleClick = (e) =>{
    const target = e.target;
    if(!target) {
      console.log("null target");
      return;
    }

    this.props.changePen(target.id.replace('parent', ''));

  }

  slideInOut = () =>{
    console.log("Slidin");

    this.setState({open: !this.state.open});
  }

  render() {

    const {pens} = this.props;
    var containerWidth, marginLeft, arrowRotation;
    containerWidth = vmin(8) * pens.length;
    marginLeft = this.state.open? 0:  -containerWidth;
    return (
      <div className="Pens-container" style={{zIndex: 100, marginLeft: marginLeft + "px", bottom: 0,}} >
        <table className="Pens">
          <tbody>
            <tr style={{height: "8vmin",}}>
              {pens.map(pen => (
                  this.renderPen(pen)
              ))}
              <td className="Pen-Arrow"
                onClick={this.slideInOut}
                onMouseEnter={this.onHover}
                onMouseLeave={this.onNoHover}
                style={{minHeight: "5vmin", minWidth: "5vmin", width: "8vmin", textAlign: "center", overflow: "hidden"}} >
                  <p style={{margin: 0, cursor: "default", transition: "250ms ease-in"}}> &gt; </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  renderPen = (pen) =>{
      const parentID = pen.id + "parent";
      let bgColor, border, blur, maxImgHeight, minImgHeight;

      if (pen.id === this.props.penType){
        bgColor = this.hexToRgba(APP_EDIT_COLOR, 0.3);
        border = "1px solid #D0E4F5";
      }else{
        bgColor = "transparent";
      }

      blur = this.state.hoverTarget === pen.id? "15px": "20px";

      maxImgHeight = vmin(5) * pen.scale;
      minImgHeight = vmin(2) * pen.scale;

      return (
        <td id={parentID} className="Pen"
          key={pen.id}
          onClick={this.handleClick}
          onMouseEnter={this.onHover}
          onMouseLeave={this.onNoHover}
          style={{minHeight: "5vmin", minWidth: "5vmin", width: "8vmin", textAlign: "center", overflow: "hidden", border: border, backgroundColor: bgColor, pointerEvents: this.state.open? "all": "none",}}>

          <img id={pen.id} className="Pen-image"
            src={pen.image}
            alt="pen"
            title={pen.title}
            draggable="false"
            style={{maxHeight: maxImgHeight, minHeight: minImgHeight, maxWidth: maxImgHeight, minWidth: minImgHeight}}
            />

        </td>
      )
  }

  hexToRgba = (hex, alpha) => {
    if(hex.charAt(0) === '#')
      hex = hex.substring(1, hex.length);
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return "rgba(" +r + "," + g + "," + b + "," +alpha + ")";
  }


};

var time = 0;


const Pen = connect(mapStateToProps, mapDispatchToProps)(ConnectedPen);

export default Pen
