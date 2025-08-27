import { ColorValue, View, ViewStyle } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

interface ModernBackgroundProps {
	children: React.ReactNode;
	variant?: 'modern' | 'revolut' | 'warm' | 'cool' | 'brand' | 'subtle';
	style?: ViewStyle;
}

const gradientVariants = {
	modern: ['#F1F5F9', '#E2E8F0'],
	revolut: ['#667EEA', '#764BA2'],
	warm: ['#FF9A8B', '#A8E6CF', '#FFD3A5'],
	cool: ['#667EEA', '#764BA2', '#F093FB', '#F5576C'],
	brand: ['#FFF5F0', '#FEF3EC', '#FFEEE6'],
	subtle: ['#F8FAFC', '#F1F5F9'],
};

export default function ModernBackground({
	children,
	variant = 'subtle',
	style,
}: ModernBackgroundProps) {
	const colors = gradientVariants[variant];

	return (
		<LinearGradient
			colors={colors as [ColorValue, ColorValue, ...ColorValue[]]}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			style={[{ flex: 1 }, style]}
		>
			{children}
		</LinearGradient>
	);
}

export function SimpleModernBackground({
	children,
	style,
}: {
	children: React.ReactNode;
	style?: ViewStyle;
}) {
	return (
		<View className="flex-1 bg-bg-background" style={style}>
			{children}
		</View>
	);
}
