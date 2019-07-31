import { ACTION } from "../actions"
import { PEN_TYPE, ASSET_TYPE,} from "../constants.js";
import DataHelper from "../utils/DataHelper.js";

const initialState = {
  movingTexts: [{id: 10000, title: "Hey There"}],
  penType: PEN_TYPE.NORMAL,
  pens: DataHelper.initPens(),
  editorTarget: null,
  editorProperties: [{}],
  editorSelectedProperty: null,
  drawerAssets: DataHelper.initDrawerAssets(),
  assets: [{type: ASSET_TYPE.TEXT, id: DataHelper.getUniqueAssetId(ASSET_TYPE.TEXT), content: "Hello Wrld", left: 100, top: 100, style: {color: "white"} }],
};

function rootReducer(state = initialState, action) {
  console.log("Action dispatched to reducer! : " +action.type);
  switch(action.type){
    case ACTION.ADD_ARTICLE:
      return Object.assign({}, state, {
        articles: state.articles.concat(action.payload)
      });
    case ACTION.ADD_MOVING_TEXT:
      return Object.assign({}, state, {
        movingTexts: state.movingTexts.concat(action.payload)
      });
    case ACTION.ADD_ASSET:
      return Object.assign({}, state, {
        assets: state.assets.concat(action.payload)
      });
    case ACTION.REMOVE_ASSET:
      return {
        ...state,
        assets: removeElement(state.assets, action.payload),
      };
    case ACTION.CHANGE_PEN:
      return {
        ...state,
        penType: action.payload,
      };
    case ACTION.SET_EDITOR_TARGET:
      return {
        ...state,
        editorTarget: action.payload,
      };
    case ACTION.SET_EDITOR_PROPERTIES_FOR:
      return {
        ...state,
        editorProperties: action.payload,
      };
    case ACTION.SET_EDITOR_SELECTED_PROPERTY:
      return {
        ...state,
        editorSelectedProperty: action.payload,
      };
    default:
      return {
        ...state
      }
  }
  return state;
};

function removeElement(array, id) {
  for(var i = 0; i < array.length; i++){
    if(array[i].id === id.replace('parent', ''))
      array.splice(i, 1);
  }

  return array;
    // var index = array.indexOf(elem);
    // if (index > -1) {
    //     array.splice(index, 1);
    // }
}

export default rootReducer;
