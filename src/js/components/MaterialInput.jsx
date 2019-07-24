import React, { Component } from "react";
import Typ from "../utils/Typ.js";
import { connect } from "react-redux";
import { setEditorSelectedProperty } from "../actions/index.js";
import { COLORS } from "../constants.js";


class EditorSuggestions extends Component{

  state = {
    suggestions: [],
    selectedProperty: null,
  }

  constructor(props) {
    super(props);
  }

  componentDidMount(){

  }

  componentDidUpdate() {

  }

  render() {
    var { description } = this.props;

    return (
      <div class="group">
        <input
        id={description.id}
        key={description.id}
        data-type={description.type}
        type="text" required />
        <span class="bar"></span>
        <label>Email</label>
      </div>
    )
  }

  renderSuggestion = (suggestion, index) =>{
    var selected, highlighted = false;

    return (
      <td key={suggestion} style={{paddingRight: "1vmin"}}>
        <div
          onClick={() => this.props.onSuggestionClicked(suggestion)} >
          <p className="EditorSuggestion"
          style={{
            textAlign: "center",
            margin: 0, padding: "0.5vmin",

            fontStyle: "italic", fontSize: "1.5vmin",
            overflow: "hidden", whiteSpace: "nowrap",
            borderRadius: "10px",
            cursor: "default",
            background: "none",
            transition: "border, background, 0.1s ease-in-out", }}>
          {suggestion}
          </p>
        </div>
      </td>
    )
  }

}

export default EditorSuggestions
