import { useCallback, useRef } from 'react';

export function useSwipeOptimization() {
	const openRowRef = useRef<string | null>(null);

	const closeRow = useCallback((rowId?: string) => {
		if (openRowRef.current && openRowRef.current !== rowId) {
			openRowRef.current = null;
		}
	}, []);

	const setOpenRow = useCallback((rowId: string) => {
		if (openRowRef.current && openRowRef.current !== rowId) {
		}
		openRowRef.current = rowId;
	}, []);

	const isRowOpen = useCallback((rowId: string) => {
		const isOpen = openRowRef.current === rowId;

		return isOpen;
	}, []);

	const clearOpenRow = useCallback(() => {
		openRowRef.current = null;
	}, []);

	return {
		closeRow,
		setOpenRow,
		isRowOpen,
		clearOpenRow,
	};
}
