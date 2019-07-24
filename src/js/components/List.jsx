import React from "react";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    movingTexts: state.movingTexts
  };
};

const ConnectedList = ({ movingTexts }) => (
  <div>
  <h2>-   List  -</h2>
  <ul className="list-group list-group-flush" style={{listStyleType: 'none', margin: 0, padding: 0}} >
    {movingTexts.map(el => (
      <div key={el.id + "div"}>
      <li className="list-group-item" key={el.id} >
        {el.title}
      </li>
      </div>
    ))}
  </ul>
  </div>
);

const List = connect(mapStateToProps)(ConnectedList);

export default List;
