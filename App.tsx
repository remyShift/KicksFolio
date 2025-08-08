import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

import './src/styles/global.css';

const App = () => {
	return <ExpoRoot context={require.context('./src/app')} />;
};

registerRootComponent(App);
