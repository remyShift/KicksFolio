import { useRef, useEffect, useState } from 'react';
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
    testID?: string;
}

export default function ProfileDrawer({ 
    visible, 
    onClose, 
    onLogout,
    user,
    testID = 'profile-drawer'
}: ProfileDrawerProps) {
    const translateX = useRef(new Animated.Value(400)).current;
    const [isVisible, setIsVisible] = useState(false);
    const { deleteAccount } = useAuth();

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            requestAnimationFrame(() => {
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }).start();
            });
        } else {
            Animated.timing(translateX, {
                toValue: 400,
                duration: 300,
                useNativeDriver: true
            }).start(() => {
                setIsVisible(false);
            });
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
                if (user) {
                    deleteAccount(user.id)
                        .then(() => {
                            onClose();
                            onLogout();
                            Alert.alert('Success', 'Your account has been deleted successfully');
                        })
                        .catch((error) => {
                            Alert.alert('Error', error.message );
                        });
                }
            }
            }
        ]
        );
    };

    if (!isVisible) return null;

    return (
        <>
            <Pressable 
                className="absolute inset-0 bg-black/50 z-40" 
                onPress={onClose}
                testID={`${testID}-overlay`}
            />
            <Animated.View 
                testID={testID}
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
            </Animated.View>
        </>
    );
} 