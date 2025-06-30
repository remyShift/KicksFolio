import { Text } from 'react-native';
import { useSizeConversion } from '@/hooks/useSizeConversion';
import { SizeUnit, GenderType } from '@/services/SizeConversionService';

interface SizeDisplayProps {
    size: number;
    originalUnit: SizeUnit;
    gender?: GenderType;
    className?: string;
}

export default function SizeDisplay({ 
    size, 
    originalUnit, 
    gender = 'men',
    className = "text-base font-medium"
}: SizeDisplayProps) {
    const { formatSizeForDisplay } = useSizeConversion();

    const displaySize = formatSizeForDisplay(size, originalUnit, gender);

    return (
        <Text className={className}>
            {displaySize}
        </Text>
    );
} 