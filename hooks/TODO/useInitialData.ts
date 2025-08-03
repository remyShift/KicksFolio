import { useSession } from '@/context/authContext';
import { storageProvider } from '@/domain/StorageProvider';
import { User } from '@/types/User';
import { Sneaker } from '@/types/Sneaker';

export function useInitialData() {
	const { setUser, setUserSneakers } = useSession();

	const loadAndSetInitialData = async () => {
		const storedUser = await storageProvider.getItem<User>('user');
		if (storedUser) setUser(storedUser);
		const storedSneakers = await storageProvider.getItem<Sneaker[]>(
			'sneakers'
		);
		if (storedSneakers) setUserSneakers(storedSneakers);
	};

	return { loadAndSetInitialData };
}
