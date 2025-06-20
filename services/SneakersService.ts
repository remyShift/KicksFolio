import { BaseApiService } from '@/services/BaseApiService';
import { supabase } from './supabase';
import { SneakerBrand } from '@/types/Sneaker';

export interface SupabaseSneaker {
	id: string;
	brand: SneakerBrand;
	model: string;
	size: number;
	purchase_date?: string;
	price_paid?: number;
	condition: number;
	estimated_value?: number;
	description?: string;
	status: string;
	images: { id: string; url: string }[];
	collection_id: string;
	created_at: string;
	updated_at: string;
}

export class SupabaseSneakerService extends BaseApiService {
	static async getSneakersByCollection(collectionId: string) {
		const { data, error } = await supabase
			.from('sneakers')
			.select('*')
			.eq('collection_id', collectionId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data;
	}

	static async createSneaker(
		sneakerData: Omit<SupabaseSneaker, 'id' | 'created_at' | 'updated_at'>
	) {
		const { data, error } = await supabase
			.from('sneakers')
			.insert([sneakerData])
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	static async updateSneaker(id: string, updates: Partial<SupabaseSneaker>) {
		const { data, error } = await supabase
			.from('sneakers')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	static async deleteSneaker(id: string) {
		const { error } = await supabase.from('sneakers').delete().eq('id', id);

		if (error) throw error;
	}

	static async uploadSneakerImage(sneakerId: string, imageUri: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const fileName = `${user.id}/${sneakerId}/${Date.now()}.jpg`;

		const response = await fetch(imageUri);
		const blob = await response.blob();

		const { data, error } = await supabase.storage
			.from('sneakers')
			.upload(fileName, blob);

		if (error) throw error;

		const { data: urlData } = supabase.storage
			.from('sneakers')
			.getPublicUrl(fileName);

		return urlData.publicUrl;
	}

	static async searchBySku(sku: string) {
		const { data, error } = await supabase.functions.invoke('sku-lookup', {
			body: { sku },
		});

		if (error) throw error;
		if (!data) throw new Error('No data found for this SKU');

		return data;
	}
}
