import {CALL} from './types';

export const setCall = (call: boolean) => async (
  dispatch: Function,
  store: Function,
) => {

  dispatch({type: CALL, call});
};
