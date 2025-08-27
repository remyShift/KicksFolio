import Toggle from '@/components/ui/buttons/Toggle';

interface NotificationToggleProps {
	onToggle: (enabled: boolean) => void;
	currentValue: boolean;
	disabled?: boolean;
	testID?: string;
}

export default function NotificationToggle({
	onToggle,
	currentValue,
	disabled = false,
	testID,
}: NotificationToggleProps) {
	const handleToggle = (newValue: string) => {
		onToggle(newValue === 'ON');
	};

	return (
		<Toggle
			leftValue="OFF"
			rightValue="ON"
			currentValue={currentValue ? 'ON' : 'OFF'}
			onToggle={disabled ? () => {} : handleToggle}
			testID={testID}
			px={3}
		/>
	);
}
