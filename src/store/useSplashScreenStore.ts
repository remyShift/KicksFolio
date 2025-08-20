import { create } from 'zustand';

interface SplashScreenState {
	isVisible: boolean;
	isInitialized: boolean;
	setIsVisible: (value: boolean) => void;
	setIsInitialized: (value: boolean) => void;
}

export const useSplashScreenStore = create<SplashScreenState>((set) => ({
	isVisible: true,
	isInitialized: false,
	setIsVisible: (value) => set({ isVisible: value }),
	setIsInitialized: (value) => set({ isInitialized: value }),
}));
