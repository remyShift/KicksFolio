import { View, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/context/authContext';
import DrawerMenuItem from '@/components/screens/app/profile/drawer/DrawerMenuItem';
import SettingsHeader from '@/components/screens/app/settings/SettingsHeader';

export default function Settings() {
    const { user } = useSession();
    const { logout, deleteAccount } = useAuth();

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
                                    Alert.alert('Success', 'Your account has been deleted successfully');
                                })
                                .catch((error) => {
                                    Alert.alert('Error', error.message);
                                });
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-white">
            <SettingsHeader />
            <View className="flex-1 gap-8 justify-center px-6">
                <DrawerMenuItem 
                    icon="exit-outline"
                    label="Logout"
                    onPress={handleLogout}
                    testID="logout"
                />
                
                <DrawerMenuItem 
                    icon="document-text-outline"
                    label="Privacy Policy"
                    onPress={() => Linking.openURL('https://remyshift.github.io/KicksFolio/')}
                />

                <DrawerMenuItem 
                    icon="person-outline"
                    label="Edit profile"
                    onPress={() => router.push('/edit-profile')}
                    testID="edit-profile"
                />

                <DrawerMenuItem 
                    icon="trash-outline"
                    label="Delete account"
                    onPress={handleDeleteAccount}
                    color="#dc2626"
                    textColor="#dc2626"
                    testID="delete-account"
                />
            </View>
        </View>
    );
} 