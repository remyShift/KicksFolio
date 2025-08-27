import Toggle from '@/components/ui/buttons/Toggle';
import { Currency } from '@/types/currency';

interface CurrencyToggleProps {
	onToggle: (newCurrency: Currency) => void;
	currentCurrency: Currency;
}

export default function CurrencyToggle({
	onToggle,
	currentCurrency,
}: CurrencyToggleProps) {
	const handleToggle = (newValue: string) => {
		onToggle(newValue as Currency);
	};

	return (
		<Toggle
			leftValue="USD"
			rightValue="EUR"
			currentValue={currentCurrency}
			onToggle={handleToggle}
			testID="currency-toggle"
			px={3}
		/>
	);
}
