import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Suppress specific warnings
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

AppRegistry.registerComponent(appName, () => App);

