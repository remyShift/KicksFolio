import { useRef, useEffect } from 'react';
import { View, Pressable, Animated, Alert, Linking } from 'react-native';
import DrawerMenuItem from './DrawerMenuItem';
import { router } from 'expo-router';
import { User } from '@/types/User';
import { useAuth } from '@/hooks/useAuth';

interface ProfileDrawerProps {
    visible: boolean;
    onClose: () => void;
    onLogout: () => void;
    user: User | null;
    sessionToken: string | null;
}

export default function ProfileDrawer({ 
    visible, 
    onClose, 
    onLogout,
    user,
    sessionToken 
}: ProfileDrawerProps) {
    const translateX = useRef(new Animated.Value(400)).current;
    const { deleteAccount } = useAuth();

    useEffect(() => {
        if (visible) {
            Animated.timing(translateX, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
        }).start();
        } else {
            Animated.timing(translateX, {
                toValue: 400,
                duration: 300,
                useNativeDriver: true
        }).start();
        }
    }, [visible]);

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
                    onClose();
                    onLogout();
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
                if (user && sessionToken) {
                    deleteAccount(user.id, sessionToken).then((data) => {
                        if (data) {
                            onClose();
                            onLogout();
                        } else {
                            Alert.alert('Error', 'An error occurred while deleting your account');
                        }
                    });
                }
            }
            }
        ]
        );
    };

    if (!visible) return null;

    return (
        <>
        <Pressable 
            className="absolute inset-0 bg-black/50 z-40" 
            onPress={onClose}
        />
            <Animated.View 
                style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 300,
                backgroundColor: 'white',
                padding: 20,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.35,
                shadowRadius: 3.84,
                elevation: 5,
                zIndex: 50,
                transform: [{ translateX: translateX }]
                }}
            >
                <View className="flex-1 gap-8 justify-center">
                    <DrawerMenuItem 
                        icon="exit-outline"
                        label="Logout"
                        onPress={handleLogout}
                    />
                    
                    <DrawerMenuItem 
                        icon="document-text-outline"
                        label="Privacy Policy"
                        onPress={() => Linking.openURL('https://remyshift.github.io/KicksFolio/docs/index.md')}
                    />

                    <DrawerMenuItem 
                        icon="person-outline"
                        label="Edit profile"
                        onPress={() => router.push('/edit-profile')}
                    />

                    <DrawerMenuItem 
                        icon="trash-outline"
                        label="Delete account"
                        onPress={handleDeleteAccount}
                        color="#dc2626"
                        textColor="#dc2626"
                    />
                </View>
            </Animated.View>
        </>
    );
} 