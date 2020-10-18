import React from 'react';
import { Navigation } from 'react-native-navigation';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import store from '../store/Store';
import { Provider } from 'react-redux';

//Screens
import Users from './users/Users';
import Call from './call/Call';
import Old from '../../App_Old';




interface Screens {
  name: string;
  Screen: any;
}
const screens = [
  { name: 'users', Screen: Users },
  { name: 'call', Screen: Call },
  { name: 'old', Screen: Old },

];
/// create Screen
function createScreen(screen: Screens): void {
  const { name, Screen } = screen;
  let ScreenWraper = (props: object) => (
    <Provider store={store}>
      <Screen {...props} />
    </Provider>
  );
  Navigation.registerComponent(name, () =>
    gestureHandlerRootHOC((props) => <ScreenWraper {...props} />),
  );
}

//// register fun
const registerScreens = () => {
  screens.forEach((screen) => createScreen(screen));
};

export default registerScreens;
