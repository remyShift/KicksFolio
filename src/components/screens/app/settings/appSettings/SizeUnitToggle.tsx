import Toggle from '@/components/ui/buttons/Toggle';
import { SizeUnit } from '@/types/sneaker';

interface SizeUnitToggleProps {
	onToggle: (newUnit: SizeUnit) => void;
	currentUnit: SizeUnit;
}

export default function SizeUnitToggle({
	onToggle,
	currentUnit,
}: SizeUnitToggleProps) {
	const handleToggle = (newValue: string) => {
		onToggle(newValue as SizeUnit);
	};

	return (
		<Toggle
			leftValue="US"
			rightValue="EU"
			currentValue={currentUnit}
			onToggle={handleToggle}
			testID="size-unit-toggle"
		/>
	);
}
