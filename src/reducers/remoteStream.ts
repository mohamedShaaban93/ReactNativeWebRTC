import { MediaStream } from 'react-native-webrtc';
import {REMOTE_STREAM} from '../actions/types';

const initialState = {
  remoteStream: null
};

const reducer = (
  state = initialState,
  action: {type: string; payload: null|MediaStream},
) => {
  switch (action.type) {
    case REMOTE_STREAM:      
      return {...state, remoteStream:action.payload};
    default:
      return state;
  }
};

export default reducer;
