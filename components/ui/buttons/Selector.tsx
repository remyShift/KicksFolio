import { View, Text, TouchableOpacity } from 'react-native';

interface SelectorOption {
    value: string;
    label: string;
    description?: string;
}

interface SelectorProps {
    title: string;
    options: SelectorOption[];
    currentValue: string;
    onSelect: (value: string) => void;
    testID?: string;
}

export default function Selector({ 
    title, 
    options, 
    currentValue, 
    onSelect,
    testID 
}: SelectorProps) {
    return (
        <View className="p-4" testID={testID}>
            <Text className="text-lg font-bold text-foreground mb-4">
                {title}
            </Text>
            
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    onPress={() => onSelect(option.value)}
                    className={`flex-row items-center justify-between p-3 rounded-lg mb-2 ${
                        currentValue === option.value 
                            ? 'bg-primary/10 border border-primary' 
                            : 'bg-card border border-border'
                    }`}
                >
                    <View>
                        <Text className={`text-base ${
                            currentValue === option.value 
                                ? 'text-primary font-semibold' 
                                : 'text-foreground'
                        }`}>
                            {option.label}
                        </Text>
                        {option.description && (
                            <Text className="text-sm text-muted-foreground">
                                {option.description}
                            </Text>
                        )}
                    </View>
                    
                    {currentValue === option.value && (
                        <View className="w-4 h-4 bg-primary rounded-full" />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
} 