import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useReducer } from 'react';
import { Platform } from 'react-native';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
	initialValue: [boolean, T | null] = [true, null]
): UseStateHook<T> {
	return useReducer(
		(
			state: [boolean, T | null],
			action: T | null = null
		): [boolean, T | null] => [false, action],
		initialValue
	) as UseStateHook<T>;
}

async function setStorageItemAsync(key: string, value: string | null) {
	if (Platform.OS === 'web') {
		return new Promise((resolve, reject) => {
			if (value === null) {
				localStorage.removeItem(key);
			} else {
				localStorage.setItem(key, value);
			}
			resolve(true);
		}).catch((error) => {
			console.error('Local storage is unavailable:', error);
		});
	} else {
		return value === null
			? SecureStore.deleteItemAsync(key)
			: SecureStore.setItemAsync(key, value);
	}
}

export function useStorageState(key: string): UseStateHook<string> {
	const [state, setState] = useAsyncState<string>();

	useEffect(() => {
		if (Platform.OS === 'web') {
			if (typeof localStorage !== 'undefined') {
				setState(localStorage.getItem(key));
			}
		} else {
			SecureStore.getItemAsync(key)
				.then((value) => setState(value))
				.catch((error) => console.error('SecureStore error:', error));
		}
	}, [key]);

	const setValue = useCallback(
		(value: string | null) => {
			setState(value);
			setStorageItemAsync(key, value).catch((error) =>
				console.error('Error setting storage:', error)
			);
		},
		[key]
	);

	return [state, setValue];
}
