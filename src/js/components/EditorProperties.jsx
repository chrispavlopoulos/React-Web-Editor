import React, { Component } from "react";
import { connect } from "react-redux";
import { setEditorSelectedProperty } from "../actions/index.js";
import { COLORS } from "../constants.js";

const mapStateToProps = state => {
  return {
    editorTarget: state.editorTarget,
    editorProperties: state.editorProperties,
    editorSelectedProperty: state.editorSelectedProperty,
  };
};

const mapDispatchToProps = {
  setEditorSelectedProperty,
};

class ConnectedEditorProperties extends Component{

  state = {
    editorTarget: null,
    editorHighlighedProperty: "",
    editorSelectedProperty: null,
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

  componentDidUpdate(){

    //  No target is selected
    if(!this.props.editorTarget){

      //  Make sure our state is up to date
      if(this.state.editorTarget !== this.props.editorTarget || this.state.editorSelectedProperty != this.props.editorSelectedProperty){
        this.props.setEditorSelectedProperty(null);
        this.setState({editorTarget: null, editorSelectedProperty: null});
      }

      return;
    }

    //  We now know for sure that props.editorTarget is not null


    var selectedProperty = this.props.editorSelectedProperty;

    //  Our targets differ, so we know a new target was clicked
    if(this.state.editorTarget !== this.props.editorTarget){

      //if(this.props && (this.state.editorSelectedProperty === "" || !this.state.editorSelectedProperty) && this.props.editorProperties.length > 0)

      //  If we're given editorProperties, make the first property
      //  the selected one by default
      if(this.props.editorProperties.length > 0){
        selectedProperty = this.props.editorProperties[0];

        //  Let's update the props and state to reflect this selection
        this.props.setEditorSelectedProperty(selectedProperty);
        this.setState({editorTarget: this.props.editorTarget});
        this.scrollTo(selectedProperty);
        return;
      }
    }

    //  Refresh our state if we're out of date
    if(this.state.editorSelectedProperty !== this.props.editorSelectedProperty || this.state.editorTarget !== this.props.editorTarget){
      //this.props.setEditorSelectedProperty(this.props.editorSelectedProperty);
      this.setState({editorTarget: this.props.editorTarget, editorSelectedProperty: this.props.editorSelectedProperty});
    }
  }

  onPropertySelected = (property) =>{
    if(this.state.editorSelectedProperty !== property){
      this.scrollTo(property);
      this.props.setEditorSelectedProperty(property);
    }
  }

  scrollTo = (property) =>{
    var target = document.getElementById(property.uniqueId);
    var scroller = this.horizontalScroller.current;
    if(!target || !scroller) return;

    var left = target.offsetLeft;

    scroller.scrollLeft = left;
  }

  render() {
    const {editorProperties} = this.props;

    return (
      <div style={{ position: "absolute", width: "100%", height: "100%", overflow: "hidden", WebkitUserSelect: "none", MozUserSelect: "none", MSUserSelect: "none",}}>

        {/* The title, it needed to be absolute position so elements could seemingly slide 'underneath' it*/}
        <div style={{zIndex: 2, position: "absolute",  paddingLeft: "1vmin", paddingRight: "1vmin"}}>
          <p
          style={{
            lineHeight: "5vmin",
            textAlign: "center",
            margin: 0,
            color: "darkgray",
            fontStyle: "italic", fontSize: "1.5vmin",
            cursor: "default",}}>
            Properties:
          </p>
        </div>

        {/* A fake left space to align the properties table */}
        <p style={{float: "left", display: "inline", width: "14%",}} />

        {/* Left-hand gradient for fade effect when scrolling properties out */}
        <div style={{
          position: "absolute",
          zIndex: 1,
          width: "15%", height: "100%",
          left: '15%',
          pointerEvents: "none",
          backgroundImage: "linear-gradient(to right, " +COLORS.OFFWHITE +", rgba(255,0,0,0), rgba(255,0,0,0), rgba(255,0,0,0))", }} />

        {/* The actual properties which will start to scroll when too many are listed */}
        <div ref={this.horizontalScroller}
        style={{
          float: "left",
          display: "inline",
          scrollBehavior: "smooth",
          width: '63%', height: '100%',
          paddingLeft: '3%',
          marginLeft: '1%',
          overflow: "auto", overflowX: "scroll", overflowY: "hidden", whiteSpace: "nowrap",
          boxSizing: "content-box", paddingBottom: "10vmin", marginTop: "0.5vmin", }} >
          <table>
            <tbody>
              <tr>
                {editorProperties.map( (property, i) => (
                  this.renderProperty(property, i)
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right-hand gradient for fade effect when scrolling properties in */}
        <div style={{
          position: "absolute",
          zIndex: 1,
          width: "15%", height: "100%",
          left: '68%',
          pointerEvents: "none",
          backgroundImage: "linear-gradient(to left, " +COLORS.OFFWHITE +", rgba(255,0,0,0), rgba(255,0,0,0))", }}
          />

      </div>
    )
  }

  renderProperty = (property, index) =>{
    if(!property || !property.friendlyName || property.css === "default") return;

    var selected = this.props.editorSelectedProperty && this.props.editorSelectedProperty.friendlyName === property.friendlyName;
    var highlighted = this.state.editorHighlighedProperty === property.friendlyName;

    return (
      <td key={property.uniqueId} id={property.uniqueId} style={{paddingRight: "1vmin"}}>
        <div onMouseEnter={() => this.setState({editorHighlighedProperty: property.friendlyName})}
          onMouseLeave={() => this.setState({editorHighlighedProperty: ""})}
          onClick={() => this.onPropertySelected(property)} >
          <p
          style={{
            textAlign: "center",
            margin: 0, padding: "0.5vmin",
            color: selected? "black": "black",
            fontStyle: "italic", fontSize: "1.5vmin",
            overflow: "hidden", whiteSpace: "nowrap",
            borderRadius: "10px",
            cursor: "default",
            background: "none",
            border: selected? "1px solid " +COLORS.EDIT: highlighted? "1px solid rgba(0, 0, 0, 0.2)": "1px solid rgba(0, 0, 0, 0.1)",
            transition: "border, background, 0.1s ease-in-out", }}>
          {property.friendlyName}
          </p>
        </div>
      </td>
    )

  }

}

const EditorProperties = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditorProperties);

export default EditorProperties
