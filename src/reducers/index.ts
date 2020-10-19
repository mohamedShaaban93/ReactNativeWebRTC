import { combineReducers } from 'redux';
import call from './callReducer';
import remoteStream from './remoteStream';


export default combineReducers({
  call,
  remoteStream,
});
