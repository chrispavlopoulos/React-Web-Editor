import React, { Component } from "react";
import Typ from "../utils/Typ.js";
import { connect } from "react-redux";
import { setEditorSelectedProperty } from "../actions/index.js";
import { COLORS } from "../constants.js";
import styled from 'styled-components'

const CoolInput = styled.input`
  color: green;
  font-size:18px;
  padding:10px 10px 10px 5px;
  display:block;
  width:300px;
  border:none;
  border-radius: 2px;
  border-bottom:1px solid #757575;

`;
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

const HighlightBar = styled.span`
  height:2px;
  width:0;
  bottom:1px;
  position:absolute;
  width:0px;
  background-color: ${props => props.color || "#5264AE"};
  transition:0.2s ease all;
  -moz-transition:0.2s ease all;
  -webkit-transition:0.2s ease all;
`;

const Wrapper = styled.div`
  position:relative;

  & ${CoolInput}:hover ~ ${CoolLabel}{
    opacity: 0.5;
  }

  & ${CoolInput}:focus ~ ${CoolLabel}{
    top:-20px;
    font-size:14px;
    color: ${props => props.titleColor || "#5264AE"};
    opacity: 1.0;
  }

  & ${CoolInput}:focus ~ ${HighlightBar}{
    width: 300px;
  }

`;


class MaterialInput extends Component{

  state = {
    suggestions: [],
    selectedProperty: null,
    titleColor: "#5264AE",
    secondaryColor: null,
  }

  constructor(props) {
    super(props);
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
      <Wrapper titleColor={this.state.titleColor}>
        <CoolInput
          id="input"
          ref={this.input}
          type="text" required />
        <HighlightBar color={this.state.secondaryColor} />
        <CoolLabel ref={this.label}>Email</CoolLabel>
      </Wrapper>
    )
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
        case "TITLE":
          target = this.label.current;
          break;
        case "TITLECOLOR":
          return this.state.titleColor;
        case "SECONDARYCOLOR":
          return this.state.secondaryColor;
      }
      if(!target) return;

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
        case "TITLE":
          target = this.label.current;
          break;
        case "TITLECOLOR":
          if(this.state.titleColor !== newValue)
            this.setState({titleColor: newValue});
          return;
        case "SECONDARYCOLOR":
          if(this.state.secondaryColor !== newValue)
            this.setState({secondaryColor: newValue});
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
