import { SneakerImageHandler } from '@/domain/SneakerImageHandler';
import {
	DbCollectionWithSneaker,
	DbUser,
	DbWishlistWithSneaker,
	SupabaseCountResult,
} from '@/types/database';
import { BrandId, Sneaker, SneakerStatus } from '@/types/sneaker';
import { SearchUser, User } from '@/types/user';

export const mapSupabaseCount = (countResult: SupabaseCountResult): number => {
	if (countResult.error) return 0;
	const count = countResult.count;
	if (typeof count === 'string') return parseInt(count, 10) || 0;
	if (typeof count === 'number') return count;
	return 0;
};

export const mapDbCollectionToSneaker = (
	dbCollection: DbCollectionWithSneaker
): Sneaker => {
	const { sneakers: dbSneaker, ...collectionData } = dbCollection;

	const images = parseDbImages(collectionData.images, dbSneaker.image);
	const orderedImages = SneakerImageHandler.orderImages(images);

	return {
		id: collectionData.id,
		sneaker_id: dbSneaker.id,
		user_id: collectionData.user_id,
		model: dbSneaker.model,
		brand_id: dbSneaker.brand_id || BrandId.Other,
		brand: dbSneaker.brands || undefined,
		sku: dbSneaker.sku || '',
		price_paid: collectionData.price_paid || 0,
		size_eu: collectionData.size_eu,
		size_us: collectionData.size_us,
		condition: collectionData.condition,
		status_id: collectionData.status_id || SneakerStatus.ROCKING,
		description: dbSneaker.description || '',
		images: orderedImages,
		estimated_value: collectionData.estimated_value || 0,
		wishlist: collectionData.wishlist,
		gender: dbSneaker.gender || '',
		og_box: collectionData.og_box || false,
		ds: collectionData.ds || false,
		created_at: collectionData.created_at,
	};
};

export const mapDbWishlistToSneaker = (
	dbWishlistItem: DbWishlistWithSneaker
): Sneaker | null => {
	if (!dbWishlistItem.sneakers?.id) {
		console.warn(
			'🔍 Missing sneaker data in wishlist item:',
			dbWishlistItem
		);
		return null;
	}

	const dbSneaker = dbWishlistItem.sneakers;
	const images = parseDbImages([], dbSneaker.image);
	const orderedImages = SneakerImageHandler.orderImages(images);

	return {
		id: dbSneaker.id,
		model: dbSneaker.model || '',
		brand_id: dbSneaker.brand_id || BrandId.Other,
		brand: dbSneaker.brands || undefined,
		description: dbSneaker.description || '',
		sku: dbSneaker.sku || '',
		gender: dbSneaker.gender || '',
		wishlist_added_at: dbWishlistItem.created_at,
		user_id: '',
		size_eu: 0,
		size_us: 0,
		condition: 0,
		status_id: SneakerStatus.ROCKING,
		price_paid: 0,
		estimated_value: 0,
		images: orderedImages,
		og_box: false,
		ds: false,
	};
};

export const mapDbUserToSearchUser = (
	dbUser: DbUser,
	followersCount: number,
	followingCount: number,
	isFollowing: boolean
): SearchUser => {
	return {
		id: dbUser.id,
		username: dbUser.username,
		profile_picture: dbUser.profile_picture,
		is_following: isFollowing,
		followers_count: followersCount,
		following_count: followingCount,
		instagram_username: dbUser.instagram_username || undefined,
		social_media_visibility: dbUser.social_media_visibility,
		sneakers: [],
	};
};

export const mapDbUserToUser = (dbUser: DbUser): User => {
	return {
		id: dbUser.id,
		email: dbUser.email,
		password: '',
		username: dbUser.username,
		sneaker_size: dbUser.sneaker_size,
		created_at: dbUser.created_at,
		updated_at: dbUser.updated_at,
		followers: [],
		sneakers: [],
		profile_picture: dbUser.profile_picture || '',
		instagram_username: dbUser.instagram_username || undefined,
		social_media_visibility: dbUser.social_media_visibility,
	};
};

function parseDbImages(
	imagesArray: string[],
	sneakerImage?: string | null
): { id: string; uri: string; type?: 'reference' | 'personal' }[] {
	const images: {
		id: string;
		uri: string;
		type?: 'reference' | 'personal';
	}[] = [];

	if (sneakerImage) {
		try {
			const parsedReferenceImage = JSON.parse(sneakerImage);
			images.push({
				id: parsedReferenceImage.id || 'reference-image',
				uri: parsedReferenceImage.uri || sneakerImage,
				type: 'reference',
			});
		} catch (error) {
			images.push({
				id: 'reference-image',
				uri: sneakerImage,
				type: 'reference',
			});
		}
	}

	if (imagesArray && imagesArray.length > 0) {
		const parsedPersonalImages = imagesArray
			.map((img, index) => {
				if (typeof img === 'string') {
					try {
						const parsed = JSON.parse(img);
						return {
							id: parsed.id || `personal-${index}`,
							uri: parsed.uri || parsed.url || img,
							type: 'personal' as const,
						};
					} catch (error) {
						return {
							id: `personal-${index}`,
							uri: img,
							type: 'personal' as const,
						};
					}
				}
				return {
					id: `personal-${index}`,
					uri: img,
					type: 'personal' as const,
				};
			})
			.filter((img) => img.uri);

		images.push(...parsedPersonalImages);
	}

	return images;
}
