import { Sneaker } from './Sneaker';

export type User = {
	id: string;
	email: string;
	password: string;
	username: string;
	first_name: string;
	last_name: string;
	sneaker_size: number;
	created_at: string;
	updated_at: string;
	friends: User[];
	sneakers: Sneaker[];
	profile_picture: string;
	instagram_username?: string;
	social_media_visibility?: boolean;
};
