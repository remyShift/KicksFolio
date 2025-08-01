import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/User';
import { Sneaker } from '@/types/Sneaker';
import { FollowingUserWithSneakers } from '@/types/auth';

interface AppState {
	user: User | null;
	sneakers: Sneaker[] | null;
	followingUsers: FollowingUserWithSneakers[] | null;
}

export class StorageProvider {
	private async handleStorageOperation<T>(
		operation: Promise<T>,
		errorMessage: string
	): Promise<T> {
		return operation
			.then((result) => {
				return result;
			})
			.catch((error) => {
				throw new Error(`${errorMessage}: ${error}`);
			});
	}

	async setItem(key: string, value: any): Promise<void> {
		return this.handleStorageOperation(
			AsyncStorage.setItem(key, JSON.stringify(value)),
			`Error storing ${key}:`
		);
	}

	async getItem<T>(key: string): Promise<T | null> {
		return this.handleStorageOperation(
			AsyncStorage.getItem(key).then((value) =>
				value ? JSON.parse(value) : null
			),
			`Error retrieving ${key}:`
		);
	}

	async removeItem(key: string): Promise<void> {
		return this.handleStorageOperation(
			AsyncStorage.removeItem(key),
			`Error removing ${key}:`
		);
	}

	async clearSessionData(): Promise<void> {
		return this.handleStorageOperation(
			Promise.all([
				this.removeItem('user'),
				this.removeItem('sneakers'),
				this.removeItem('wishlistSneakers'),
				this.removeItem('followingUsers'),
			]).then(() => void 0),
			'Error clearing session data:'
		);
	}

	async setUserData(user: User): Promise<void> {
		return this.setItem('user', user);
	}

	async getUserData(): Promise<User | null> {
		return this.getItem<User>('user');
	}

	async setSneakersData(sneakers: Sneaker[]): Promise<void> {
		return this.setItem('sneakers', sneakers);
	}

	async getSneakersData(): Promise<Sneaker[] | null> {
		return this.getItem<Sneaker[]>('sneakers');
	}

	async setFollowingUsersData(
		followingUsers: FollowingUserWithSneakers[]
	): Promise<void> {
		return this.setItem('followingUsers', followingUsers);
	}

	async getFollowingUsersData(): Promise<FollowingUserWithSneakers[] | null> {
		return this.getItem<FollowingUserWithSneakers[]>('followingUsers');
	}

	async initializeStorageData(): Promise<AppState> {
		return this.handleStorageOperation(
			Promise.all([
				this.getUserData(),
				this.getSneakersData(),
				this.getFollowingUsersData(),
			]).then(([user, sneakers, followingUsers]) => ({
				user,
				sneakers,
				followingUsers,
			})),
			'Error initializing storage data:'
		);
	}

	async saveAppState(data: AppState): Promise<void> {
		const promises: Promise<void>[] = [];

		if (data.user) {
			promises.push(this.setUserData(data.user));
		}
		if (data.sneakers) {
			promises.push(this.setSneakersData(data.sneakers));
		}

		return this.handleStorageOperation(
			Promise.all(promises).then(() => undefined),
			'Error saving app state:'
		);
	}
}

export const storageProvider = new StorageProvider();
