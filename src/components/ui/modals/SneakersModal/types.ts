import { SneakerPhoto } from '@/types/image';
import { Sneaker } from '@/types/sneaker';

export type ModalStep =
	| 'index'
	| 'sku'
	| 'barcode'
	| 'addFormImages'
	| 'addFormDetails'
	| 'editForm'
	| 'editFormImages'
	| 'view';

export type InputType =
	| 'name'
	| 'brand_id'
	| 'size'
	| 'condition'
	| 'status_id'
	| 'pricePaid'
	| 'sku';

export interface InitialStepProps {
	userSneakersLength?: number;
}

export interface SkuStepProps {
	setSneaker: (sneaker: Sneaker | null) => void;
}

export interface FormStepProps {
	sneaker: Sneaker | null;
	setSneaker: (sneaker: Sneaker | null) => void;
	userSneakers: Sneaker[] | null;
	setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export interface ViewStepProps {
	sneaker: Sneaker;
	setSneaker: (sneaker: Sneaker | null) => void;
	userSneakers: Sneaker[] | null;
	setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export interface ValidationErrors {
	[key: string]: string;
}

export interface ValidationError {
	field: string;
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationErrors;
}
