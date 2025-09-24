export interface DbBrand {
	id: number;
	name: string;
}

export interface DbUser {
	id: string;
	email: string;
	password_hash: string | null;
	username: string;
	sneaker_size: number;
	profile_picture: string | null;
	reset_password_token: string | null;
	reset_password_sent_at: string | null;
	created_at: string;
	updated_at: string;
	instagram_username: string | null;
	social_media_visibility: boolean;
	following_additions_enabled: boolean;
}

export interface DbSneaker {
	id: string;
	model: string;
	gender: 'men' | 'women';
	sku: string | null;
	description: string | null;
	created_at: string;
	updated_at: string;
	image: string | null;
	brand_id: number | null;
}

export interface DbCollection {
	id: string;
	user_id: string;
	sneaker_id: string;
	size_eu: number;
	size_us: number;
	og_box: boolean | null;
	ds: boolean | null;
	purchase_date: string | null;
	price_paid: number | null;
	condition: number;
	estimated_value: number | null;
	images: string[];
	wishlist: boolean;
	created_at: string;
	updated_at: string;
	status_id: number | null;
}

export interface DbStatus {
	id: number;
	name: string;
}

export interface DbFollower {
	id: string;
	follower_id: string;
	following_id: string;
	created_at: string;
}

export interface DbWishlist {
	id: string;
	user_id: string | null;
	sneaker_id: string | null;
	created_at: string;
}

export interface DbSharedCollection {
	id: string;
	user_id: string;
	share_token: string;
	filters: object;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface DbCollectionWithSneaker extends DbCollection {
	sneakers: DbSneaker & {
		brands: DbBrand | null;
	};
}

export interface DbSneakerWithBrand extends DbSneaker {
	brands: DbBrand | null;
}

export interface DbWishlistWithSneaker extends DbWishlist {
	sneakers: DbSneaker & {
		brands: DbBrand | null;
	};
}

export interface DbNotification {
	id: string;
	recipient_id: string;
	type: 'single_sneaker_added' | 'multiple_sneakers_added' | 'user_followed';
	data: object;
	title: string;
	body: string;
	is_read: boolean;
	created_at: string;
	updated_at: string;
}

export interface DbPushToken {
	id: string;
	user_id: string;
	expo_token: string;
	device_id: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface SupabaseCountResult {
	count: number | string | null;
	error: any;
}
