import { create } from 'zustand';

interface SplashScreenState {
	isVisible: boolean;
	isInitialized: boolean;
	loadingProgress: number;
	loadingStatus: string;
	setIsVisible: (value: boolean) => void;
	setIsInitialized: (value: boolean) => void;
	setLoadingProgress: (value: number) => void;
	setLoadingStatus: (value: string) => void;
}

export const useSplashScreenStore = create<SplashScreenState>((set) => ({
	isVisible: true,
	isInitialized: false,
	loadingProgress: 0,
	loadingStatus: 'Chargement des ressources...',
	setIsVisible: (value) => set({ isVisible: value }),
	setIsInitialized: (value) => set({ isInitialized: value }),
	setLoadingProgress: (value) => set({ loadingProgress: value }),
	setLoadingStatus: (value) => set({ loadingStatus: value }),
}));
