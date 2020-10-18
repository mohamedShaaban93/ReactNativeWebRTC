import {CALL} from '../actions/types';

const initialState = {
  comingCall: {
    hasOffer: false,
    name: '',
  },
};

const reducer = (
  state = initialState,
  action: {type: string; payload: {hasOffer:boolean,name:string}},
) => {
  console.log('Action======>>>>>>', action);

  switch (action.type) {
    case CALL:      
      return {...state, comingCall:action.payload};
    default:
      return state;
  }
};

export default reducer;
