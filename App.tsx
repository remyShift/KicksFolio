import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { ExpoConfig } from 'expo/config';
import Constants from 'expo-constants';

const config: ExpoConfig = {
  name: 'KicksFolio',
  slug: 'KicksFolio-Frontend',
  scheme: 'kicksfolio',
  version: '0.0.2',
  extra: {
    apiUrl: process.env.API_URL || 'https://www.kicksfolio.app/api/v1'
  }
};

export default function App() {
  return <ExpoRoot context={require.context('./app')} />;
}

registerRootComponent(App); 