export type Sneaker = {
    id: string;
    model: string;
    price_paid: number;
    brand: string;
    size: number;
    condition: number;
    status: string;
    purchase_date: string;
    description: string;
    estimated_value: number;
    release_date: string | null;
    collection_id: string;
    created_at: string;
    updated_at: string;
    images: {
        id: string;
        url: string;
    }[];
}