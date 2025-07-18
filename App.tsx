import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'KicksFolio',
  slug: 'KicksFolio',
  scheme: 'kicksfolio',
  version: '0.0.2',
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_BASE_API_URL
  }
};

export default function App() {
  return <ExpoRoot context={require.context('./app')} />;
}

registerRootComponent(App); 