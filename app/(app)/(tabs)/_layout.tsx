import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { useModalStore } from '@/store/useModalStore';
import TabAddButton from '@/components/ui/buttons/TabAddButton';

export default function TabLayout() {
    const { setIsVisible, setModalStep } = useModalStore();

    const handleAddPress = () => {
        setModalStep('index');
        setIsVisible(true);
    };

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#F27329',
            tabBarShowLabel: true,
            tabBarStyle: {
                height: 85,
                paddingTop: 5,
                paddingHorizontal: 15,
            },
            sceneStyle: {
                backgroundColor: '#ECECEC',
            }
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={25} color={color} />,
                }}
            />
            <Tabs.Screen
                name="friends"
                options={{
                    title: 'Friends',
                    tabBarIcon: ({ color }) => <Feather name="users" size={25} color={color} />,
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: '',
                    tabBarIcon: () => (
                        <TabAddButton handleAddPress={handleAddPress} />
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        handleAddPress();
                    },
                }}
            />
            <Tabs.Screen
                name="wishlist"
                options={{
                    title: 'Wishlist',
                    tabBarIcon: ({ color }) => <AntDesign name="hearto" size={25} color={color} />,
                }}
            />
            <Tabs.Screen
                name="user"
                options={{
                    title: 'User',
                    tabBarIcon: ({ color }) => <Feather name="user" size={25} color={color} />,
                }}
            />
        </Tabs>
    );
}
