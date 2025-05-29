export const skuLookUp = async (
	sku: string,
	sessionToken: string | undefined | null
) => {
	if (!sessionToken) return;

	return fetch(
		`${process.env.EXPO_PUBLIC_BASE_API_URL}/sku_lookup?sku=${sku}`,
		{
			headers: {
				Authorization: `Bearer ${sessionToken}`,
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		}
	)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			if (!data) {
				throw new Error('No data found for this SKU');
			}
			return data;
		})
		.catch((error) => {
			console.error('Error when fetching SKU data:', error);
			throw error;
		});
};
