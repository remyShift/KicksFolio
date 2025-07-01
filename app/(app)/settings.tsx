import { View } from 'react-native';
import SettingsHeader from '@/components/screens/app/settings/SettingsHeader';
import AccountSettings from '@/components/screens/app/settings/accountSettings/AccountSettings';
import AppSettings from '@/components/screens/app/settings/appSettings/AppSettings';

export default function Settings() {
    return (
        <View className="flex-1 bg-white px-4" testID="settings-container">
            <SettingsHeader />
            <View className="flex-1 gap-10" testID="settings-content">
                <AccountSettings />
                <AppSettings />
            </View>
        </View>
    );
} 