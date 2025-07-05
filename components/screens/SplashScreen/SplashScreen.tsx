import { View } from 'react-native';
import { ShoeIcon } from './ShoeIcon';
import { AppTitle } from './AppTitle';

export default function SplashScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-primary gap-1">
            <AppTitle text="KicksFolio" />
            <ShoeIcon
                name="shoe-sneaker"
                size={50}
                color="white"
            />
        </View>
    );
}
