import { Collection } from './Collection';
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
	collection?: Collection;
	friends: User[];
	sneakers: Sneaker[];
	profile_picture: {
		id: string;
		url: string;
	};
	profile_picture_url: string;
};
