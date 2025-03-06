export const createCollection = async (name: string, userId: string, sessionToken: string) => {
    return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${userId}/collection`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ collection: { name } }),
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.errors ? data.errors.join(', ') : 'Error when creating collection');
        }
        return data;
    })
    .catch(error => {
        throw new Error(`Error when creating collection: ${error}`);
    });
};