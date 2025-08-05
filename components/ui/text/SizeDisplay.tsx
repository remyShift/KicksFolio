import React from 'react';
import { Text, TextProps } from 'react-native';

import { useSizeConversion } from '@/hooks/useSizeConversion';
import { Sneaker } from '@/types/sneaker';

interface SizeDisplayProps extends TextProps {
	sneaker: Sneaker;
	className: string;
}

export default function SizeDisplay({ sneaker, className }: SizeDisplayProps) {
	const { formatSizeForDisplay } = useSizeConversion();

	return <Text className={className}>{formatSizeForDisplay(sneaker)}</Text>;
}
