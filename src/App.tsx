import { Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import registerScreens from './screens';

registerScreens();

export const startApp = async () => {
    Navigation.events().registerAppLaunchedListener(() => {
        Navigation.setRoot({
            root: {
                stack: {
                    id: 'CenterStack',
                    children: [
                        {
                            component: {
                                name: 'old'
                            }
                        }
                    ]
                }
            }
        });
    });

    Navigation.setDefaultOptions({
        statusBar: {
            visible: true,
            style: Platform.Version > 23 ? 'dark' : 'light',
            backgroundColor: Platform.Version > 23 ? '#FFF' : '#2662C4',
        },
        topBar: {
            drawBehind: false,
            visible: true,
            animate: false,
        },
        animations: {
            push: {
                waitForRender: false,
            },
            showModal: {
                waitForRender: false,
            },
        },
        layout: {
            backgroundColor: 'white',
            orientation: ['portrait'],
        }
    });
}
