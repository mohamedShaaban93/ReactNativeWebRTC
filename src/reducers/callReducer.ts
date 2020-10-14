import {CALL} from '../actions/types';

const initialState = {
  call: true,
};

const reducer = (
  state = initialState,
  action: {type: string; call: boolean},
) => {
  console.log('Action======>>>>>>', action.call);

  switch (action.type) {
    case CALL:
      return {...state, lang: action.call};
    default:
      return state;
  }
};

export default reducer;
