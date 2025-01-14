type SneakerProps = {
    image: string;
    model: string;
    brand: string;
    size: number;
    condition: number;
    status: string;
    userId: string;
    price_paid: number;
    purchase_date: string;
    description: string;
    estimated_value: number;
}

export const handleSneakerSubmit = async (sneaker: SneakerProps, sneakerId: string | null, sessionToken: string | null) => {
    if (!sessionToken) return;

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

    if (sneaker.image) {
        const imageUriParts = sneaker.image.split('.');
        const fileType = imageUriParts[imageUriParts.length - 1];
        
        const imageFile = {
            uri: sneaker.image,
            type: 'image/jpeg',
            name: `photo.${fileType}`
        };
        formData.append('sneaker[images][]', imageFile as any);
    }

    const baseUrl = `${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${sneaker.userId}/collection/sneakers`;
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
        return JSON.parse(text);
    })
    .then(data => {
        return data;
    });
};


export const fetchSkuSneakerData = async (sku: string, sessionToken: string | undefined | null) => {
    console.log('sessionToken', sessionToken);
    console.log('sku', sku);
    if (!sessionToken) return;

    return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/sku_lookup?sku=${sku}`, {
        headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data) {
                throw new Error('No data found for this SKU');
            }
            return data;
        })
        .catch(error => {
            console.error('Error when fetching SKU data:', error);
            throw error;
        });
};
