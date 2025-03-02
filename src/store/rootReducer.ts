import {combineReducers} from '@reduxjs/toolkit';
import {websocketsApiSlice} from "../api/websocketsApiSlice";

const rootReducer = combineReducers({
  [websocketsApiSlice.reducerPath]: websocketsApiSlice.reducer,
});

export default rootReducer;
