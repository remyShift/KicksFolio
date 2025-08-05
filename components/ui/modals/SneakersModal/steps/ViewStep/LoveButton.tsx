import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';

import AntDesign from '@expo/vector-icons/AntDesign';

import useWishlist from '@/components/ui/modals/SneakersModal/hooks/useWishlist';
import { Sneaker } from '@/types/sneaker';

export default function LoveButton({ sneaker }: { sneaker: Sneaker }) {
	const primary = '#F27329';
	const [isWishlisted, setIsWishlisted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { addToWishList, removeFromWishList, checkWishlistStatus } =
		useWishlist();

	useEffect(() => {
		checkWishlistStatus(sneaker.id, setIsWishlisted);
	}, [sneaker.id]);

	const handlePress = async () => {
		if (isLoading) return;

		setIsLoading(true);
		const newWishlistStatus = !isWishlisted;

		setIsWishlisted(newWishlistStatus);

		if (newWishlistStatus) {
			addToWishList(sneaker.id, setIsWishlisted, setIsLoading);
		} else {
			removeFromWishList(sneaker.id, setIsWishlisted, setIsLoading);
		}
	};

	return (
		<Pressable
			className="bg-white p-3 rounded-md flex items-center justify-center"
			onPress={handlePress}
			disabled={isLoading}
		>
			{isWishlisted ? (
				<AntDesign name="heart" size={18} color={primary} />
			) : (
				<AntDesign name="hearto" size={18} color="black" />
			)}
		</Pressable>
	);
}
