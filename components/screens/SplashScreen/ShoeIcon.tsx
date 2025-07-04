import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface ShoeIconProps {
    name: keyof typeof MaterialCommunityIcons.glyphMap;
    size: number;
    color: string;
}

export const ShoeIcon = ({ name, size, color }: ShoeIconProps) => {
    return (
        <MaterialCommunityIcons
            name={name}
            size={size}
            color={color}
        />
    );
}; 