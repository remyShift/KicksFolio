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
    collection: Collection;
    friends: User[];
    sneakers: Sneaker[];
    profile_picture: {
        id: string;
        url: string;
    };
    profile_picture_url: string;
}

export type Collection = {
    id: string;
    name: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

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

export type ProfileData = {
    newUsername: string;
    newFirstName: string;
    newLastName: string;
    newSneakerSize: number;
    newProfilePicture: string;
    newEmail: string;
}