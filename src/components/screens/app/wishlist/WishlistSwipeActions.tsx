import { TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';

interface WishlistSwipeActionsProps {
	sneaker: Sneaker;
}

export default function WishlistSwipeActions({
	sneaker,
}: WishlistSwipeActionsProps) {
	const { setCurrentSneaker, setModalStep, setIsVisible } = useModalStore();

	const handleSneakerPress = (sneaker: Sneaker) => {
		setCurrentSneaker(sneaker);
		setModalStep('view');
		setIsVisible(true);
	};

	return (
		<View className="flex-row justify-end items-center">
			<TouchableOpacity
				className="bg-blue-500 justify-center items-center px-6 h-full"
				onPress={() => handleSneakerPress(sneaker)}
				style={{ width: 80 }}
			>
				<Ionicons name="eye-outline" size={24} color="white" />
			</TouchableOpacity>
		</View>
	);
}
