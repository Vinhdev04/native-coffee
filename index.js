/**
 * @file index.js
 * @desc Điểm khởi đầu của ứng dụng (Entry Point) — đăng ký component chính
 *       với AppRegistry và import các polyfill cần thiết (reanimated).
 * @layer root
 */

import 'react-native-reanimated';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
