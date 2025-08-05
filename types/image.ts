export interface UploadResult {
	success: boolean;
	url?: string;
	fileName?: string;
	error?: string;
}

export interface ImageUploadOptions {
	bucket: 'sneakers' | 'profiles';
	userId: string;
	entityId?: string;
	quality?: number;
}

export interface ImageValidationResult {
	isValid: boolean;
	error?: string;
	size?: number;
}

export interface ImageInfo {
	exists: boolean;
	size?: number;
	width?: number;
	height?: number;
}

export type Photo = {
	id?: string;
	uri: string;
	alt?: string;
};
