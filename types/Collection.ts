import { Sneaker } from './Sneaker';

export type Collection = {
	id: string;
	name: string;
	user_id: string;
	created_at: string;
	updated_at: string;
	sneakers: Sneaker[];
};
