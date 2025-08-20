import { create } from 'zustand';

export enum ViewDisplayState {
	Card = 'card',
	List = 'list',
}

type ViewDisplayStateStore = {
	viewDisplayState: ViewDisplayState;
	setViewDisplayState: (viewDisplayState: ViewDisplayState) => void;
};

export const useViewDisplayStateStore = create<ViewDisplayStateStore>(
	(set) => ({
		viewDisplayState: ViewDisplayState.Card,
		setViewDisplayState: (viewDisplayState: ViewDisplayState) => {
			set({ viewDisplayState });
		},
	})
);
