import { useCallback } from 'react';

interface ScrollHandlers {
	handleVerticalScroll: (event: any) => void;
	handleHorizontalScroll: (event: any, brandName: string) => void;
}

interface UseScrollHandlersProps {
	onVerticalScroll?: (scrollY: number, viewHeight: number) => void;
	onHorizontalScroll?: (
		brandName: string,
		scrollX: number,
		viewWidth: number
	) => void;
	isChunkingEnabled?: boolean;
}

export function useScrollHandlers({
	onVerticalScroll,
	onHorizontalScroll,
	isChunkingEnabled = false,
}: UseScrollHandlersProps): ScrollHandlers {
	const handleVerticalScroll = useCallback(
		(event: any) => {
			if (!isChunkingEnabled || !onVerticalScroll) {
				return;
			}

			const { contentOffset, layoutMeasurement } = event.nativeEvent;
			const scrollY = contentOffset.y;
			const viewHeight = layoutMeasurement.height;

			onVerticalScroll(scrollY, viewHeight);
		},
		[isChunkingEnabled, onVerticalScroll]
	);

	const handleHorizontalScroll = useCallback(
		(event: any, brandName: string) => {
			if (!isChunkingEnabled || !onHorizontalScroll) {
				return;
			}

			const { contentOffset, layoutMeasurement } = event.nativeEvent;
			const scrollX = contentOffset.x;
			const viewWidth = layoutMeasurement.width;

			onHorizontalScroll(brandName, scrollX, viewWidth);
		},
		[isChunkingEnabled, onHorizontalScroll]
	);

	return {
		handleVerticalScroll,
		handleHorizontalScroll,
	};
}
