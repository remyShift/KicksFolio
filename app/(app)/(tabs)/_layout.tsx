import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Tabs } from 'expo-router';
import { useModalStore } from '@/store/useModalStore';
import TabAddButton from '@/components/ui/buttons/TabAddButton';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
    const { t } = useTranslation();
    const { setIsVisible, setModalStep } = useModalStore();

    const handleAddPress = () => {
        setModalStep('barcode');
        setIsVisible(true);
    };

    return (
        <Tabs 
            initialRouteName="index"
            screenOptions={{
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
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('navigation.navbar.home'),
                    tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={25} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: t('navigation.navbar.search'),
                    tabBarIcon: ({ color }) => <Feather name="search" size={25} color={color} />,
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
                    title: t('navigation.navbar.wishlist'),
                    tabBarIcon: ({ color }) => <AntDesign name="hearto" size={25} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('navigation.navbar.profile'),
                    tabBarIcon: ({ color }) => <Feather name="user" size={25} color={color} />,
                }}
            />
        </Tabs>
    );
}
