import { Sneaker, SneakerBrand, SneakerStatus, Photo } from '@/types/Sneaker';

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
	| 'brand'
	| 'size'
	| 'condition'
	| 'status'
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

export interface SneakerFormData {
	model: string;
	brand:
		| SneakerBrand.Nike
		| SneakerBrand.Adidas
		| SneakerBrand.Converse
		| SneakerBrand.NewBalance
		| SneakerBrand.Puma
		| SneakerBrand.Jordan
		| SneakerBrand.Asics
		| SneakerBrand.Reebok
		| SneakerBrand.Vans
		| SneakerBrand.Other;
	status:
		| SneakerStatus.Stocking
		| SneakerStatus.Rocking
		| SneakerStatus.Selling;
	size: string;
	condition: string;
	images: Photo[];
	price_paid?: string;
	description?: string;
	og_box?: boolean;
	ds?: boolean;
	is_women?: boolean;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationErrors;
}
