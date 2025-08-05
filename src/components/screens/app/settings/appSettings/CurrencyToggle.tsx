import Toggle from '@/src/components/ui/buttons/Toggle';
import { Currency } from '@/src/store/useCurrencyStore';

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
