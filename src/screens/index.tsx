import React from 'react';
import {Navigation} from 'react-native-navigation';
import {gestureHandlerRootHOC} from 'react-native-gesture-handler';

//Screens
import Users from './users/Users';



interface Screens {
  name: string;
  Screen: any;
}
const screens = [
  {name: 'users', Screen: Users},

];
/// create Screen
function createScreen(screen: Screens): void {
  const {name, Screen} = screen;
  let ScreenWraper = (props: object) => (
      <Screen {...props} />
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
