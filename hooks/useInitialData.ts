import { useSession } from '@/context/authContext';
import { storageService } from '@/services/StorageService';
import { User } from '@/types/User';
import { Sneaker } from '@/types/Sneaker';

export function useInitialData() {
	const { setUser, setUserSneakers } = useSession();

	const loadAndSetInitialData = async () => {
		const storedUser = await storageService.getItem<User>('user');
		if (storedUser) setUser(storedUser);
		const storedSneakers = await storageService.getItem<Sneaker[]>(
			'sneakers'
		);
		if (storedSneakers) setUserSneakers(storedSneakers);
	};

	return { loadAndSetInitialData };
}
