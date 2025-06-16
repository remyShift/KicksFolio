import { useState, useEffect } from 'react';
import { FriendshipService, Friendship } from '../services/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

interface FriendData {
	id: string;
	username: string;
	first_name: string;
	last_name: string;
	profile_picture?: string;
}

interface FriendshipWithUser extends Friendship {
	friend?: FriendData;
	requester?: FriendData;
}

export const useFriendships = () => {
	const { user, isAuthenticated } = useSupabaseAuth();
	const [friends, setFriends] = useState<FriendshipWithUser[]>([]);
	const [pendingRequests, setPendingRequests] = useState<
		FriendshipWithUser[]
	>([]);
	const [searchResults, setSearchResults] = useState<FriendData[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchLoading, setSearchLoading] = useState(false);

	const fetchFriends = async () => {
		if (!isAuthenticated) return;

		setLoading(true);

		return FriendshipService.getFriends()
			.then((data) => {
				setFriends(data || []);
				return data;
			})
			.catch((error) => {
				console.error('Error fetching friends:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const fetchPendingRequests = async () => {
		if (!isAuthenticated) return;

		setLoading(true);

		return FriendshipService.getPendingRequests()
			.then((data) => {
				setPendingRequests(data || []);
				return data;
			})
			.catch((error) => {
				console.error('Error fetching pending requests:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const searchUsers = async (query: string) => {
		if (!query.trim()) {
			setSearchResults([]);
			return;
		}

		setSearchLoading(true);

		return FriendshipService.searchUsers(query)
			.then((data) => {
				setSearchResults(data || []);
				return data;
			})
			.catch((error) => {
				console.error('Error searching users:', error);
				throw error;
			})
			.finally(() => {
				setSearchLoading(false);
			});
	};

	const sendFriendRequest = async (friendId: string) => {
		setLoading(true);

		return FriendshipService.sendFriendRequest(friendId)
			.then((newFriendship) => {
				// Optionnellement, refetch les données ou mettre à jour localement
				return newFriendship;
			})
			.catch((error) => {
				console.error('Error sending friend request:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const acceptFriendRequest = async (friendshipId: string) => {
		setLoading(true);

		return FriendshipService.acceptFriendRequest(friendshipId)
			.then((updatedFriendship) => {
				// Déplacer de pendingRequests vers friends
				setPendingRequests((prev) =>
					prev.filter((req) => req.id !== friendshipId)
				);

				// Refetch les amis pour avoir les données complètes
				return fetchFriends().then(() => updatedFriendship);
			})
			.catch((error) => {
				console.error('Error accepting friend request:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const blockUser = async (friendshipId: string) => {
		setLoading(true);

		// Implémentation de la logique de blocage
		// Pour l'instant, on peut utiliser la même méthode que acceptFriendRequest
		// mais avec le statut 'blocked'
		return FriendshipService.acceptFriendRequest(friendshipId) // Adapter selon votre API
			.then(() => {
				// Retirer des listes locales
				setFriends((prev) =>
					prev.filter((friend) => friend.id !== friendshipId)
				);
				setPendingRequests((prev) =>
					prev.filter((req) => req.id !== friendshipId)
				);
			})
			.catch((error) => {
				console.error('Error blocking user:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const removeFriend = async (friendshipId: string) => {
		setLoading(true);

		return FriendshipService.acceptFriendRequest(friendshipId) // Adapter selon votre API pour la suppression
			.then(() => {
				setFriends((prev) =>
					prev.filter((friend) => friend.id !== friendshipId)
				);
			})
			.catch((error) => {
				console.error('Error removing friend:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const clearSearchResults = () => {
		setSearchResults([]);
	};

	useEffect(() => {
		if (isAuthenticated && user?.id) {
			fetchFriends();
			fetchPendingRequests();
		} else {
			setFriends([]);
			setPendingRequests([]);
		}
	}, [isAuthenticated, user?.id]);

	return {
		friends,
		pendingRequests,
		searchResults,
		loading,
		searchLoading,
		fetchFriends,
		fetchPendingRequests,
		searchUsers,
		sendFriendRequest,
		acceptFriendRequest,
		blockUser,
		removeFriend,
		clearSearchResults,
	};
};
