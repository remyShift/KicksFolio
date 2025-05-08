import { View, ActivityIndicator } from 'react-native';

export const Loader = () => (
    <View className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
        <ActivityIndicator size="large" color="#F27329" />
    </View>
); 