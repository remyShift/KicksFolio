import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Tabs } from 'expo-router';

import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

import TabAddButton from '@/components/ui/buttons/TabAddButton';
import { useSession } from '@/contexts/authContext';
import { useModalStore } from '@/store/useModalStore';

export default function TabLayout() {
	const { t } = useTranslation();
	const { setIsVisible, setModalStep } = useModalStore();
	const { user: currentUser } = useSession();
	const insets = useSafeAreaInsets();

	const handleAddPress = () => {
		if (!currentUser) {
			Alert.alert('Vous devez être connecté pour ajouter un modèle.');
			return;
		}
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
					height: 85 + insets.bottom,
					paddingTop: 5,
					paddingBottom: insets.bottom,
					paddingHorizontal: 15,
				},
				sceneStyle: {
					backgroundColor: '#F8FAFC',
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: t('navigation.navbar.home'),
					tabBarIcon: ({ color }) => (
						<Ionicons name="home-outline" size={25} color={color} />
					),
				}}
				listeners={{
					tabPress: (e) => {
						if (!currentUser) {
							e.preventDefault();
							Alert.alert(
								'Vous devez être connecté pour accéder à cette page.'
							);
						}
					},
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: t('navigation.navbar.search'),
					tabBarIcon: ({ color }) => (
						<Feather name="search" size={25} color={color} />
					),
				}}
				listeners={{
					tabPress: (e) => {
						if (!currentUser) {
							e.preventDefault();
						}
					},
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
					tabBarIcon: ({ color }) => (
						<Feather name="heart" size={25} color={color} />
					),
				}}
				listeners={{
					tabPress: (e) => {
						if (!currentUser) {
							e.preventDefault();
						}
					},
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: t('navigation.navbar.profile'),
					tabBarIcon: ({ color }) => (
						<Feather name="user" size={25} color={color} />
					),
				}}
				listeners={{
					tabPress: (e) => {
						if (!currentUser) {
							e.preventDefault();
						}
					},
				}}
			/>
		</Tabs>
	);
}
