import React, { Component } from "react";
import Typ from "../utils/Typ.js";
import { connect } from "react-redux";
import { setEditorSelectedProperty } from "../actions/index.js";
import { COLORS } from "../constants.js";
import styled from 'styled-components'
import '../../InputBox.css';

const CoolInput = styled.input`
  width:100%;
  color: ${props => props.inputColor || (props.backgroundColor && "black") || "white"};
  background: ${props => props.backgroundColor || "transparent"};
  font-size:18px;
  padding:10px 10px 10px 5px;
  display:block;
  border:none;
  border-radius: 2px;
  transition:0.2s ease border-bottom;
`;

//  width: ${props => props.width || "300px"};


const CoolLabel = styled.label`
  color:#999;
  font-size:18px;
  font-weight:normal;
  position:absolute;
  pointer-events:none;
  left:5px;
  top:10px;
  transition:0.2s ease-out all;
  -moz-transition:0.2s ease-out all;
  -webkit-transition:0.2s ease-out all;
`;

const HighlightBarIn = styled.span`
  width:0%;
  height:2px;
  top:2.5em;
  position:absolute;
  background-color: ${props => props.color || "#5264AE"};
  transition:0.2s ease all;
`;

const HighlightBarOut = styled.span`
  width:100%;
  height:2px;
  top:2.5em;
  right:0px;
  position:absolute;
  background-color: ${props => props.color || "white"};
  transition:0.2s ease all;
`;

const Wrapper = styled.div`
  position:relative;
  width: 300px;

  & ${CoolInput}:hover ~ ${CoolLabel}{
    opacity: 0.5;
  }

  & ${CoolInput}:focus ~ ${CoolLabel},
  & ${CoolInput}:valid ~ ${CoolLabel}{
    top:-20px;
    font-size:14px;
    color: ${props => props.titleColor || "#5264AE"};
    opacity: 1.0;
  }

  & ${CoolInput}:focus ~ ${HighlightBarIn}{
    width: ${props => (props.secondaryColor === "transparent" && "0%") || (props.secondaryColor && "100%") || "100%"};
  }

  & ${CoolInput}:focus ~ ${HighlightBarOut}{
    width: ${props => (props.secondaryColor === "transparent" && "100%") || (props.secondaryColor && "0%") || "0%"};
  }

`;


class MaterialInput extends Component{

  state = {
    suggestions: [],
    selectedProperty: null,
    titleColor: "#5264AE",
    inputColor: null,
    underlineColor: null,
    secondaryColor: null,
    backgroundColor: null,
    width: "100%",
    type: "text",
  }

  constructor(props) {
    super(props);
    this.wrapper = React.createRef();
    this.input = React.createRef();
    this.label = React.createRef();
  }

  componentDidMount(){

  }

  componentDidUpdate() {

  }

  render() {
    var { description } = this.props;

    return (
      <Wrapper ref={ this.wrapper } titleColor={ this.state.titleColor } secondaryColor={ this.state.secondaryColor }>
        <CoolInput id="input" ref={ this.input }
          type={ this.state.type } required
          inputColor={ this.state.inputColor }
          backgroundColor={ this.state.backgroundColor }
          width={ this.state.width }/>
          <HighlightBarIn color={ this.state.secondaryColor } />
          <HighlightBarOut color={ this.state.underlineColor } />
        <CoolLabel ref={ this.label }>Email</CoolLabel>
      </Wrapper>
    )
  }

  getAssetDOM = () =>{
    return this.wrapper.current;
  }

  //  Helper function to GET the desired property for the current selection
  //  i.e. <img> returns its src , <p> returns its textContent
  getPropertyValue = (property, raw = false) =>{
    var target;
    var css = property.css;

    var value = "";
    if(!property || css === "default"){
      value = this.label.textContent;
    }
    else{
      switch(property.uniqueId.toUpperCase()){
        case "INPUTTYPE":
          value = this.state.type;
          break;
        case "TITLE":
          target = this.label.current;
          break;
        case "TITLECOLOR":
          value = this.state.titleColor;
          break;
        case "INPUTCOLOR":
          value = this.state.inputColor;
          break;
        case "UNDERLINECOLOR":
          value = this.state.underlineColor;
          break;
        case "SECONDARYCOLOR":
          value = this.state.secondaryColor;
          break;
        case "BACKGROUNDCOLOR":
          value = this.state.backgroundColor;
          break;
        default:
          target = this.wrapper.current;

      }
      if(!target) return value;

      if(property.isStyle)
        value = target.style[css];
      else
        value = target[css];
    }

    return value;//raw? value: this.parseFixes(value, property.prefix, property.postfix);
  }

  //  If no propety is given or its css is 'default', we set a default value
  //  for the element
  //
  //  A property will either be one of the elment's normal properties
  //    i.e. textContent, src, alt
  //  or something within its styles
  //    i.e. color, width, margin
  //  To handle this, we pass in the 'isStyle' bool that tells us where to look
  //  when setting these values
  setPropertyValue = (property, newValue) =>{
    var target;
    var css = property.css;

    if(!property || css === "default"){
      this.label.textContent = newValue;
    }
    else{
      switch(property.uniqueId.toUpperCase()){
        case "INPUTTYPE":
          if(this.state.type !== newValue)
            this.setState({type: newValue});
          return;
        case "TITLE":
          target = this.label.current;
          break;
        case "TITLECOLOR":
          if(this.state.titleColor !== newValue)
            this.setState({titleColor: newValue});
          return;
        case "INPUTCOLOR":
          if(this.state.inputColor !== newValue)
            this.setState({inputColor: newValue});
          return;
        case "UNDERLINECOLOR":
          if(this.state.underlineColor !== newValue)
            this.setState({underlineColor: newValue});
          return;
        case "SECONDARYCOLOR":
          if(this.state.secondaryColor !== newValue)
            this.setState({secondaryColor: newValue});
          return;
        case "BACKGROUNDCOLOR":
          if(this.state.backgroundColor !== newValue)
            this.setState({backgroundColor: newValue});
          return;

        default:
          target = this.wrapper.current;

      }
      if(!target) return;

      var currentValue = property.isStyle? target.style[css]: target[css];
      if(newValue === currentValue) return;

      if(property.isStyle)
        target.style[css] = newValue;
      else
        target[css] = newValue;
    }
  }

}

export default MaterialInput
