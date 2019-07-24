import DataHelper from "../utils/DataHelper.js";
export const ACTION = {
  ADD_ARTICLE: "ADD_ARTICLE",
  ADD_MOVING_TEXT: "ADD_MOVING_TEXT",
  ADD_ASSET: "ADD_ASSET",
  REMOVE_ASSET: "REMOVE_ASSET",
  CHANGE_PEN: "CHANGE_PEN",
  SET_EDITOR_TARGET: "SET_EDITOR_TARGET",
  SET_EDITOR_PROPERTIES_FOR: "SET_EDITOR_PROPERTIES_FOR",
  SET_EDITOR_SELECTED_PROPERTY: "SET_EDITOR_SELECTED_PROPERTY" }


export function addArticle(payload) {
  return { type: ACTION.ADD_ARTICLE, payload }
};

export function addMovingText(payload) {
  return { type: ACTION.ADD_MOVING_TEXT, payload }
};

export function changePen(payload) {
  return { type: ACTION.CHANGE_PEN, payload }
};

export function addAsset(payload) {
  //DataHelper.makeAsset(payload);
  return { type: ACTION.ADD_ASSET, payload }
};

export function removeAsset(payload) {
  return { type: ACTION.REMOVE_ASSET, payload }
};

export function setEditorTarget(payload) {
  return { type: ACTION.SET_EDITOR_TARGET, payload }
};

export function setEditorPropertiesFor(payload){
  payload = DataHelper.getPropertiesFor(payload);
  return { type: ACTION.SET_EDITOR_PROPERTIES_FOR, payload };
};

export function setEditorSelectedProperty(payload){
  return { type: ACTION.SET_EDITOR_SELECTED_PROPERTY, payload }
}

function makeAsset({type, title, content, left = 0, top = 0}){
  return { type: type, title: title, left: left, top: top };
}
