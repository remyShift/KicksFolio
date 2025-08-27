import { supabase } from '@/config/supabase/supabase';
import { ShareHandlerInterface } from '@/domain/ShareHandler';
import { FilterState } from '@/types/filter';
import {
	CreateSharedCollectionResponse,
	SharedCollectionData,
} from '@/types/sharing';
import { mapDbCollectionToSneaker } from '@/utils/mappers';

class ShareProxy implements ShareHandlerInterface {
	private generateShareToken(): string {
		return (
			Math.random().toString(36).substring(2, 15) +
			Math.random().toString(36).substring(2, 15)
		);
	}

	private buildShareUrl(shareToken: string): string {
		return `https://share.kicksfolio.com/shared.html?token=${shareToken}`;
	}

	private buildInternalShareUrl(shareToken: string): string {
		return `/share-collection/${shareToken}`;
	}

	async createShareLink(
		userId: string,
		filters: FilterState
	): Promise<CreateSharedCollectionResponse> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		if (user.id !== userId) {
			throw new Error('Unauthorized access');
		}

		const shareToken = this.generateShareToken();

		const { data, error } = await supabase
			.from('shared_collections')
			.insert({
				user_id: userId,
				share_token: shareToken,
				filters: filters,
				is_active: true,
			})
			.select('share_token')
			.single();

		if (error) {
			throw error;
		}

		const url = this.buildShareUrl(data.share_token);

		return {
			share_token: data.share_token,
			url,
		};
	}

	async getSharedCollection(
		shareToken: string
	): Promise<SharedCollectionData> {
		const { data: sharedData, error: sharedError } = await supabase.rpc(
			'get_shared_collection',
			{
				token: shareToken,
			}
		);

		if (sharedError) throw sharedError;

		if (!sharedData || sharedData.length === 0) {
			throw new Error('Shared collection not found');
		}

		const result = sharedData[0];

		const { data: completeUserData, error: userError } = await supabase
			.from('users')
			.select(
				'id, username, first_name, last_name, profile_picture, instagram_username, social_media_visibility'
			)
			.eq('id', result.user_data.id)
			.single();

		if (userError) throw userError;

		const [followersResult, followingResult] = await Promise.all([
			supabase
				.from('followers')
				.select('*', {
					count: 'exact',
					head: true,
				})
				.eq('following_id', result.user_data.id),
			supabase
				.from('followers')
				.select('*', {
					count: 'exact',
					head: true,
				})
				.eq('follower_id', result.user_data.id),
		]);

		const followersCount = followersResult.error
			? 0
			: followersResult.count || 0;
		const followingCount = followingResult.error
			? 0
			: followingResult.count || 0;

		const sneakers =
			result.sneakers_data?.map((item: any) =>
				mapDbCollectionToSneaker({
					id: item.id,
					user_id: item.user_id,
					sneaker_id: item.sneaker_id,
					size_eu: item.size_eu,
					size_us: item.size_us,
					og_box: item.og_box,
					ds: item.ds,
					purchase_date: null,
					price_paid: item.price_paid,
					condition: item.condition,
					estimated_value: item.estimated_value,
					images: item.images || [],
					wishlist: item.wishlist || false,
					created_at: item.created_at,
					updated_at: item.updated_at,
					status_id: item.status_id,
					sneakers: {
						id: item.sneaker_id,
						model: item.model,
						gender: item.gender,
						sku: item.sku,
						description: item.description,
						created_at: '',
						updated_at: '',
						image: item.image,
						brand_id: item.brand_id,
						brands: item.brand,
					},
				})
			) || [];

		const userData = {
			id: completeUserData.id,
			username: completeUserData.username,
			first_name: completeUserData.first_name,
			last_name: completeUserData.last_name,
			profile_picture: completeUserData.profile_picture,
			is_following: false,
			followers_count: followersCount,
			following_count: followingCount,
			instagram_username: completeUserData.instagram_username,
			social_media_visibility: completeUserData.social_media_visibility,
			sneakers: sneakers,
		};

		return {
			user_data: userData,
			sneakers_data: sneakers,
			filters: result.filters || {
				brands: [],
				sizes: [],
				conditions: [],
				statuses: [],
			},
		};
	}

	async deleteShareLink(shareToken: string): Promise<void> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		const { error } = await supabase
			.from('shared_collections')
			.update({ is_active: false })
			.eq('share_token', shareToken)
			.eq('user_id', user.id);

		if (error) throw error;
	}

	async getUserShareLinks(userId: string): Promise<string[]> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		if (user.id !== userId) {
			throw new Error('Unauthorized access');
		}

		const { data, error } = await supabase
			.from('shared_collections')
			.select('share_token')
			.eq('user_id', userId)
			.eq('is_active', true);

		if (error) throw error;

		return data?.map((item) => item.share_token) || [];
	}
}

export const shareProxy = new ShareProxy();
