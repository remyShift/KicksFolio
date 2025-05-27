import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";

interface SneakerDescriptionInputProps {
    inputRef: React.RefObject<TextInput>;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
}

export default function SneakerDescriptionInput({ 
    inputRef, 
    scrollViewRef, 
    onErrorChange, 
    onValueChange,
    initialValue = ""
}: SneakerDescriptionInputProps) {
    const [isSneakerDescriptionFocused, setIsSneakerDescriptionFocused] = useState(false);
    const [sneakerDescriptionValue, setSneakerDescriptionValue] = useState(initialValue);

    useEffect(() => {
        onErrorChange(''); // Description is optional, no validation needed
    }, []);

    useEffect(() => {
        onValueChange(sneakerDescriptionValue);
    }, [sneakerDescriptionValue]);

    useEffect(() => {
        setSneakerDescriptionValue(initialValue);
    }, [initialValue]);

    const handleFocus = () => {
        setIsSneakerDescriptionFocused(true);
    };

    const handleBlur = () => {
        setIsSneakerDescriptionFocused(false);
    };

    const handleChange = (text: string) => {
        setSneakerDescriptionValue(text);
    };

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>Description</Text>
            <View className="relative w-2/3">
                <TextInput
                    ref={inputRef}
                    placeholder="Description of your sneakers..."
                    inputMode="text"
                    value={sneakerDescriptionValue}
                    autoCorrect={true}
                    placeholderTextColor="gray"
                    returnKeyType="done"
                    multiline={true}
                    textAlignVertical="top"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChangeText={handleChange}
                    className={`bg-white rounded-md p-3 w-full font-spacemono-bold ${
                        isSneakerDescriptionFocused ? 'border-2 border-primary' : ''
                    }`}
                    style={{
                        minHeight: 60,
                        maxHeight: 80
                    }}
                />
            </View>
        </View>
    );
} 