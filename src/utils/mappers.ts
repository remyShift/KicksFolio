// Type-safe mappers to transform database types to frontend types
// This eliminates the need for manual type casting and improves type safety
import {
	DbCollectionWithSneaker,
	DbSneaker,
	DbSneakerWithBrand,
	DbUser,
	DbWishlistWithSneaker,
	SupabaseCountResult,
} from '@/types/database';
import { BrandId, Sneaker, SneakerStatus } from '@/types/sneaker';
import { SearchUser, User } from '@/types/user';

/**
 * Safely converts Supabase count result to number
 * Supabase can return count as string or number, this ensures consistent typing
 */
export const mapSupabaseCount = (countResult: SupabaseCountResult): number => {
	if (countResult.error) return 0;
	const count = countResult.count;
	if (typeof count === 'string') return parseInt(count, 10) || 0;
	if (typeof count === 'number') return count;
	return 0;
};

/**
 * Maps database collection with sneaker to frontend Sneaker type
 */
export const mapDbCollectionToSneaker = (
	dbCollection: DbCollectionWithSneaker
): Sneaker => {
	const { sneakers: dbSneaker, ...collectionData } = dbCollection;

	// Parse images from database array format
	const images = parseDbImages(collectionData.images, dbSneaker.image);

	return {
		id: collectionData.id, // Already string (uuid)
		sneaker_id: dbSneaker.id, // Already string (uuid)
		user_id: collectionData.user_id, // Already string (uuid)
		model: dbSneaker.model, // Already string (varchar)
		brand_id: dbSneaker.brand_id || BrandId.Other, // Already number (integer)
		brand: dbSneaker.brands || undefined, // Convert null to undefined for frontend type
		sku: dbSneaker.sku || '', // Already string or null (varchar)
		price_paid: collectionData.price_paid || 0, // Already number or null (numeric)
		size_eu: collectionData.size_eu, // Already number (numeric)
		size_us: collectionData.size_us, // Already number (numeric)
		condition: collectionData.condition, // Already number (integer)
		status_id: collectionData.status_id || SneakerStatus.ROCKING, // Already number or null (integer)
		description: dbSneaker.description || '', // Already string or null (text)
		images, // Parsed from database format
		estimated_value: collectionData.estimated_value || 0, // Already number or null (numeric)
		wishlist: collectionData.wishlist, // Already boolean
		gender: dbSneaker.gender || '', // Already 'men' | 'women' (text with check)
		og_box: collectionData.og_box || false, // Already boolean or null
		ds: collectionData.ds || false, // Already boolean or null
	};
};

/**
 * Maps database wishlist item to frontend Sneaker type
 */
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

	return {
		id: dbSneaker.id, // Already string (uuid)
		model: dbSneaker.model || '', // Already string (varchar)
		brand_id: dbSneaker.brand_id || BrandId.Other, // Already number (integer)
		brand: dbSneaker.brands || undefined, // Convert null to undefined for frontend type
		description: dbSneaker.description || '', // Already string or null (text)
		sku: dbSneaker.sku || '', // Already string or null (varchar)
		gender: dbSneaker.gender || '', // Already 'men' | 'women' (text)
		wishlist_added_at: dbWishlistItem.created_at, // Already string (timestamp)
		user_id: '', // Not available in wishlist context
		size_eu: 0, // Not available in wishlist context
		size_us: 0, // Not available in wishlist context
		condition: 0, // Not available in wishlist context
		status_id: SneakerStatus.ROCKING, // Default value
		price_paid: 0, // Not available in wishlist context
		estimated_value: 0, // Not available in wishlist context
		images, // Parsed from database format
		og_box: false, // Not available in wishlist context
		ds: false, // Not available in wishlist context
	};
};

/**
 * Maps database user to frontend SearchUser type
 */
export const mapDbUserToSearchUser = (
	dbUser: DbUser,
	followersCount: number,
	followingCount: number,
	isFollowing: boolean
): SearchUser => {
	return {
		id: dbUser.id, // Already string (uuid)
		username: dbUser.username, // Already string (varchar)
		first_name: dbUser.first_name, // Already string (varchar)
		last_name: dbUser.last_name, // Already string (varchar)
		profile_picture: dbUser.profile_picture, // Already string or null (varchar)
		is_following: isFollowing, // Already boolean
		followers_count: followersCount, // Converted number
		following_count: followingCount, // Converted number
		instagram_username: dbUser.instagram_username || undefined, // Convert null to undefined
		social_media_visibility: dbUser.social_media_visibility, // Already boolean
		sneakers: [], // Will be populated separately
	};
};

/**
 * Maps database user to frontend User type
 */
export const mapDbUserToUser = (dbUser: DbUser): User => {
	return {
		id: dbUser.id, // Already string (uuid)
		email: dbUser.email, // Already string (varchar)
		password: '', // Not returned from database for security
		username: dbUser.username, // Already string (varchar)
		first_name: dbUser.first_name, // Already string (varchar)
		last_name: dbUser.last_name, // Already string (varchar)
		sneaker_size: dbUser.sneaker_size, // Already number (numeric)
		created_at: dbUser.created_at, // Already string (timestamp)
		updated_at: dbUser.updated_at, // Already string (timestamp)
		followers: [], // Will be populated separately
		sneakers: [], // Will be populated separately
		profile_picture: dbUser.profile_picture || '', // Convert null to empty string
		instagram_username: dbUser.instagram_username || undefined, // Convert null to undefined
		social_media_visibility: dbUser.social_media_visibility, // Already boolean
	};
};

/**
 * Parses image data from database format to frontend format
 * Handles various image storage formats used in the database
 */
function parseDbImages(
	imagesArray: string[],
	sneakerImage?: string | null
): { id: string; uri: string }[] {
	// First try to parse the collection images array
	if (imagesArray && imagesArray.length > 0) {
		const parsedImages = imagesArray
			.map((img, index) => {
				if (typeof img === 'string') {
					try {
						const parsed = JSON.parse(img);
						return {
							id: parsed.id || index.toString(),
							uri: parsed.uri || parsed.url || img,
						};
					} catch (error) {
						// If not JSON, treat as plain URI
						return {
							id: index.toString(),
							uri: img,
						};
					}
				}
				return {
					id: index.toString(),
					uri: img,
				};
			})
			.filter((img) => img.uri);

		if (parsedImages.length > 0) return parsedImages;
	}

	// Fallback to sneaker's main image
	if (sneakerImage) {
		let actualUri = sneakerImage;
		try {
			const parsedImage = JSON.parse(sneakerImage);
			actualUri = parsedImage.uri || sneakerImage;
		} catch (error) {
			// If not JSON, use as-is
		}

		return [{ id: 'api-image', uri: actualUri }];
	}

	return [];
}
