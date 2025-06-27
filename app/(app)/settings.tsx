import { View, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/context/authContext';
import SettingsMenuItem from '@/components/screens/app/settings/SettingsMenuItem';
import SettingsHeader from '@/components/screens/app/settings/SettingsHeader';
import SettingsCategory from '@/components/screens/app/settings/SettingsCategory';
import useToast from '@/hooks/useToast';

export default function Settings() {
    const { user } = useSession();
    const { logout, deleteAccount } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout ?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        showSuccessToast('👋🏼 Logged out', 'See you soon !');
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete account',
            'Are you sure you want to delete your account ? This action is irreversible.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        if (user) {
                            deleteAccount(user.id)
                                .then(() => {
                                    logout();
                                    showSuccessToast('🗑️ Account deleted', 'Your account has been deleted successfully');
                                })
                                .catch((error) => {
                                    showErrorToast('❌ Account deletion failed', 'An error occurred while deleting your account.');
                                });
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-white px-4">
            <SettingsHeader />
            <SettingsCategory title="Account">
                <SettingsMenuItem 
                    icon="exit-outline"
                    label="Logout"
                    onPress={handleLogout}
                    testID="logout"
                />

                <View className="h-px rounded-full w-1/2 bg-gray-300" />
                
                <SettingsMenuItem 
                    icon="document-text-outline"
                    label="Privacy Policy"
                    onPress={() => Linking.openURL('https://remyshift.github.io/KicksFolio/')}
                />

                <View className="h-px rounded-full w-1/2 bg-gray-300" />

                <SettingsMenuItem 
                    icon="person-outline"
                    label="Edit profile"
                    onPress={() => router.push('/edit-profile')}
                    testID="edit-profile"
                />

                <View className="h-px rounded-full w-1/2 bg-gray-300" />

                <SettingsMenuItem 
                    icon="trash-outline"
                    label="Delete account"
                    onPress={handleDeleteAccount}
                    color="#dc2626"
                    textColor="#dc2626"
                    testID="delete-account"
                />
            </SettingsCategory>
        </View>
    );
} 