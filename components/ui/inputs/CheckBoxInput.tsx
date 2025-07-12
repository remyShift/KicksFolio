import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';

interface CheckBoxInputProps {
    label?: string;
    checked?: boolean;
    onToggle?: (checked: boolean) => void;
    disabled?: boolean;
}

export default function CheckBoxInput({ 
    label = "OG Box", 
    checked = false, 
    onToggle,
    disabled = false 
}: CheckBoxInputProps) {
    const [isChecked, setIsChecked] = useState(checked);

    const handleCheck = () => {
        if (disabled) return;
        
        const newCheckedState = !isChecked;
        setIsChecked(newCheckedState);
        
        if (onToggle) {
            onToggle(newCheckedState);
        }
    }

    return (
        <View className="flex-row items-center gap-2">
            <Text className={`font-open-sans-semibold text-md`}>{label}</Text>

            <Pressable
                onPress={handleCheck}
                disabled={disabled}
                className="flex-row items-center gap-3"
            >
                <View className={`w-8 h-8 border-2 rounded-md items-center justify-center ${
                    isChecked
                        ? 'bg-primary border-primary' 
                        : 'bg-white border-gray-300'
                } ${disabled ? 'opacity-50' : ''}`}>
                    {isChecked && (
                        <Text className="text-white text-sm font-bold">✓</Text>
                    )}
                </View>
            </Pressable>
        </View>
    )
}
