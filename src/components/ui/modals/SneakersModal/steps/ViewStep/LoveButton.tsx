import { useEffect, useRef, useState } from 'react';

import { Animated, Pressable } from 'react-native';

import * as Haptics from 'expo-haptics';

import AntDesign from '@expo/vector-icons/AntDesign';

import useWishlist from '@/components/ui/modals/SneakersModal/hooks/useWishlist';
import { Sneaker } from '@/types/sneaker';

export default function LoveButton({ sneaker }: { sneaker: Sneaker }) {
	const primary = '#F27329';
	const [isWishlisted, setIsWishlisted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const scaleAnim = useRef(new Animated.Value(1)).current;
	const pulseAnim = useRef(new Animated.Value(1)).current;

	const { addToWishList, removeFromWishList, checkWishlistStatus } =
		useWishlist();

	useEffect(() => {
		const wishlistId = sneaker.sneaker_id || sneaker.id;
		checkWishlistStatus(wishlistId, setIsWishlisted);
	}, [sneaker.sneaker_id, sneaker.id]);

	const animatePulse = () => {
		pulseAnim.setValue(1);
		Animated.sequence([
			Animated.timing(pulseAnim, {
				toValue: 1.3,
				duration: 150,
				useNativeDriver: true,
			}),
			Animated.timing(pulseAnim, {
				toValue: 1,
				duration: 150,
				useNativeDriver: true,
			}),
		]).start();
	};

	const animatePress = () => {
		Animated.sequence([
			Animated.timing(scaleAnim, {
				toValue: 0.9,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(scaleAnim, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start();
	};

	const handlePress = async () => {
		if (isLoading) return;

		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		animatePress();

		setIsLoading(true);
		const newWishlistStatus = !isWishlisted;

		setIsWishlisted(newWishlistStatus);

		if (newWishlistStatus) {
			setTimeout(() => animatePulse(), 50);
		}

		const wishlistId = sneaker.sneaker_id || sneaker.id;

		if (newWishlistStatus) {
			addToWishList(wishlistId, setIsWishlisted, setIsLoading);
		} else {
			removeFromWishList(wishlistId, setIsWishlisted, setIsLoading);
		}
	};

	return (
		<Pressable
			className="bg-white p-3 rounded-md flex items-center justify-center"
			onPress={handlePress}
			disabled={isLoading}
		>
			<Animated.View
				style={{
					transform: [
						{ scale: scaleAnim },
						{ scale: isWishlisted ? pulseAnim : 1 },
					],
				}}
			>
				{isWishlisted ? (
					<AntDesign name="heart" size={18} color={primary} />
				) : (
					<AntDesign name="hearto" size={18} color="black" />
				)}
			</Animated.View>
		</Pressable>
	);
}
