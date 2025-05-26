import { useSession } from '@/context/authContext';
import { storageService } from '@/services/StorageService';
import { User } from '@/types/User';
import { Collection } from '@/types/Collection';
import { Sneaker } from '@/types/Sneaker';

export function useInitialData() {
    const { setUser, setUserCollection, setUserSneakers } = useSession();

    const loadInitialData = async () => {
        const storedUser = await storageService.getItem<User>('user');
        if (storedUser) setUser(storedUser);
        const storedCollection = await storageService.getItem<Collection>('collection');
        if (storedCollection) setUserCollection(storedCollection);
        const storedSneakers = await storageService.getItem<Sneaker[]>('sneakers');
        if (storedSneakers) setUserSneakers(storedSneakers);
    };

    return { loadInitialData };
} 