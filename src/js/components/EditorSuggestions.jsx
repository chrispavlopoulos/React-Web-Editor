import React, { Component } from "react";
import Plain from 'slate-plain-serializer'
import Typ from "../utils/Typ.js";
import { connect } from "react-redux";
import { setEditorSelectedProperty } from "../actions/index.js";
import { COLORS } from "../constants.js";

let knownText = "";

const mapStateToProps = state => {
  return {
    editorTarget: state.editorTarget,
  };
};

const mapDispatchToProps = {

};

class ConnectedEditorSuggestions extends Component{

  state = {
    suggestions: [],
    selectedProperty: null,
  }

  constructor(props) {
    super(props);
    this.horizontalScroller = React.createRef();
  }

  componentDidMount(){
    // Add the event listener which gets triggered when using the trackpad
    this.horizontalScroller.current.addEventListener('mousewheel', function(event) {
      // We don't want to scroll below zero or above the width and height
      var maxX = this.scrollWidth - this.offsetWidth;
      var maxY = this.scrollHeight - this.offsetHeight;

      // If this event looks like it will scroll beyond the bounds of the element, prevent it and set the scroll to the boundary manually
      if (this.scrollLeft + event.deltaX < 0 ||
         this.scrollLeft + event.deltaX > maxX ||
         this.scrollTop + event.deltaY < 0 ||
         this.scrollTop + event.deltaY > maxY) {

        event.preventDefault();

        // Manually set the scroll to the boundary
        this.scrollLeft = Math.max(0, Math.min(maxX, this.scrollLeft + event.deltaX));
        this.scrollTop = Math.max(0, Math.min(maxY, this.scrollTop + event.deltaY));
      }
    }, false);
  }

  componentDidUpdate() {
    const {selectedProperty, input} = this.props;
    if(!selectedProperty || !input){
      if(this.state.selectedProperty !== selectedProperty || this.state.suggestions.length > 0)
        this.setState({selectedProperty: selectedProperty, suggestions: [] });
      return;
    }

    if(selectedProperty !== this.state.selectedProperty){
      knownText = null;
      this.setState({selectedProperty: selectedProperty});

      if(!selectedProperty) return;
    }

    var text = Plain.serialize(input);
    if(text === knownText) return;
    knownText = text;
    var suggestions = Typ.for(text, selectedProperty.uniqueId);
    if(suggestions && suggestions !== this.state.suggestions)
      this.setState({suggestions: suggestions});
  }

  render() {
    var propertyName = this.state.selectedProperty? this.state.selectedProperty.friendlyName: '';

    return (
      <div style={{
      zIndex: 102,
      backgroundColor: "transparent",
      width: "100%", overflow: "hidden", WebkitUserSelect: "none", MozUserSelect: "none", MSUserSelect: "none",}}>

      <div style={{ display: "flex", flexDirection: 'row', justifyContent:'flex-start', alignItems: 'stretch' }}>
            <div style={{zIndex: 2, flexShrink: 0, paddingLeft: "1vmin", paddingRight: "1vmin"}}>
              <p
              style={{
                lineHeight: "5vmin",
                margin: 0,
                color: "black",
                fontStyle: "italic", fontSize: "1.5vmin",
                cursor: "default",}}>
                {propertyName}:
              </p>
            </div>



        {/* The suggestions which will start to scroll when too many are listed */}
        <div ref={this.horizontalScroller}
        style={{
          overflow: "hidden", overflowX: "scroll",
          boxSizing: "content-box", paddingBottom: "10vmin", marginTop: "0.7vmin", }} >
          <table>
            <tbody>
              <tr>
                {this.state.suggestions.map( (suggestion, i) => (
                  this.renderSuggestion(suggestion, i)
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>

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

const EditorSuggestions = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditorSuggestions);

export default EditorSuggestions
