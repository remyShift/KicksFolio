import { useCallback, useRef } from 'react';

export const useSwipeOptimization = () => {
	const openRowRef = useRef<string | null>(null);
	const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const closeRow = useCallback((rowId?: string) => {
		if (animationTimeoutRef.current) {
			clearTimeout(animationTimeoutRef.current);
			animationTimeoutRef.current = null;
		}

		if (openRowRef.current && openRowRef.current !== rowId) {
			openRowRef.current = null;
		}

		animationTimeoutRef.current = setTimeout(() => {
			openRowRef.current = null;
			animationTimeoutRef.current = null;
		}, 100);
	}, []);

	const setOpenRow = useCallback((rowId: string) => {
		openRowRef.current = rowId;
	}, []);

	const isRowOpen = useCallback((rowId: string) => {
		return openRowRef.current === rowId;
	}, []);

	const clearOpenRow = useCallback(() => {
		openRowRef.current = null;
		if (animationTimeoutRef.current) {
			clearTimeout(animationTimeoutRef.current);
			animationTimeoutRef.current = null;
		}
	}, []);

	return {
		closeRow,
		setOpenRow,
		isRowOpen,
		clearOpenRow,
	};
};
