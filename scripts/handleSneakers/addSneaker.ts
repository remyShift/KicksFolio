import { Sneaker } from "@/types/ProfileData";


export const addSneaker = async (sneaker: Sneaker, sneakerId: string, sessionToken: string, userId: string) => {
    const formData = new FormData();
    formData.append('sneaker[model]', sneaker.model);
    formData.append('sneaker[brand]', sneaker.brand);
    formData.append('sneaker[size]', sneaker.size.toString());
    formData.append('sneaker[condition]', sneaker.condition.toString());
    formData.append('sneaker[status]', sneaker.status.toLowerCase());
    formData.append('sneaker[price_paid]', sneaker.price_paid.toString());
    formData.append('sneaker[purchase_date]', sneaker.purchase_date);
    formData.append('sneaker[description]', sneaker.description);
    formData.append('sneaker[estimated_value]', sneaker.estimated_value.toString());

    if (sneaker.images) {
        const imageUriParts = sneaker.images[0].url.split('.');
        const fileType = imageUriParts[imageUriParts.length - 1];
        
        const imageFile = {
            uri: sneaker.images[0].url,
            type: 'image/jpeg',
            name: `photo.${fileType}`
        };
        formData.append('sneaker[images][]', imageFile as any);
    }

    const baseUrl = `${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${userId}/collection/sneakers`;
    const url = sneakerId ? `${baseUrl}/${sneakerId}` : baseUrl;
    const method = sneakerId ? 'PATCH' : 'POST';

    return fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Accept': 'application/json',
        },
        body: formData,
    })
    .then(async response => {
        const text = await response.text();
        if (!response.ok) {
            throw new Error(text);
        }
        return JSON.parse(text);
    })
    .then(data => {
        return data;
    });
};