// Database-specific types matching the exact Postgres schema
// These types represent the raw data structure from the database

export interface DbBrand {
	id: number; // integer, auto-incremented
	name: string; // varchar, NOT NULL, UNIQUE
}

export interface DbUser {
	id: string; // uuid, primary key
	email: string; // varchar, NOT NULL, UNIQUE
	password_hash: string | null; // varchar, nullable
	username: string; // varchar, NOT NULL, UNIQUE
	first_name: string; // varchar, NOT NULL
	last_name: string; // varchar, NOT NULL
	sneaker_size: number; // numeric, NOT NULL, CHECK constraint
	profile_picture: string | null; // varchar, nullable
	reset_password_token: string | null; // varchar, nullable, UNIQUE
	reset_password_sent_at: string | null; // timestamp with time zone, nullable
	created_at: string; // timestamp with time zone, DEFAULT now()
	updated_at: string; // timestamp with time zone, DEFAULT now()
	instagram_username: string | null; // varchar, nullable
	social_media_visibility: boolean; // boolean, DEFAULT true
}

export interface DbSneaker {
	id: string; // uuid, primary key
	model: string; // varchar, NOT NULL
	gender: 'men' | 'women'; // text, CHECK constraint
	sku: string | null; // varchar, nullable
	description: string | null; // text, nullable
	created_at: string; // timestamp with time zone, DEFAULT now()
	updated_at: string; // timestamp with time zone, DEFAULT now()
	image: string | null; // text, nullable
	brand_id: number | null; // integer, foreign key to brands.id
}

export interface DbCollection {
	id: string; // uuid, primary key
	user_id: string; // uuid, NOT NULL, foreign key to users.id
	sneaker_id: string; // uuid, NOT NULL, foreign key to sneakers.id
	size_eu: number; // numeric, NOT NULL, CHECK constraint
	size_us: number; // numeric, NOT NULL, CHECK constraint
	og_box: boolean | null; // boolean, nullable
	ds: boolean | null; // boolean, nullable
	purchase_date: string | null; // date, nullable
	price_paid: number | null; // numeric, nullable
	condition: number; // integer, NOT NULL, CHECK constraint (1-10)
	estimated_value: number | null; // numeric, nullable
	images: string[]; // text[], DEFAULT ARRAY[]::text[]
	wishlist: boolean; // boolean, NOT NULL, DEFAULT false
	created_at: string; // timestamp with time zone, DEFAULT now()
	updated_at: string; // timestamp with time zone, DEFAULT now()
	status_id: number | null; // integer, foreign key to statuses.id
}

export interface DbStatus {
	id: number; // integer, auto-incremented
	name: string; // varchar, NOT NULL, UNIQUE
}

export interface DbFollower {
	id: string; // uuid, primary key
	follower_id: string; // uuid, NOT NULL, foreign key to users.id
	following_id: string; // uuid, NOT NULL, foreign key to users.id
	created_at: string; // timestamp with time zone, DEFAULT now()
}

export interface DbWishlist {
	id: string; // uuid, primary key
	user_id: string | null; // uuid, foreign key to users.id
	sneaker_id: string | null; // uuid, foreign key to sneakers.id
	created_at: string; // timestamp without time zone, DEFAULT now()
}

// Joint query result types (what Supabase returns with joins)
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

// Supabase-specific types for count queries
export interface SupabaseCountResult {
	count: number | string | null; // Supabase can return count as string or number
	error: any;
}
