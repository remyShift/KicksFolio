export const deleteSneaker = async (
	sneakerId: string,
	userId: string,
	sessionToken: string
) => {
	return fetch(
		`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${userId}/collection/sneakers/${sneakerId}`,
		{
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${sessionToken}`,
			},
		}
	).then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return true;
	});
};
