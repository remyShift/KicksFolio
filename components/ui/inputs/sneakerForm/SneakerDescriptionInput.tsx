import { useSneakerForm } from "@/components/modals/SneakersModal/hooks/useSneakerForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";

interface SneakerDescriptionInputProps {
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
}

export default function SneakerDescriptionInput({ 
    onErrorChange, 
    onValueChange,
    initialValue = "",
    scrollViewRef
}: SneakerDescriptionInputProps) {
    const [isSneakerDescriptionError, setIsSneakerDescriptionError] = useState(false);
    const [isSneakerDescriptionFocused, setIsSneakerDescriptionFocused] = useState(false);
    const [sneakerDescriptionValue, setSneakerDescriptionValue] = useState(initialValue);

    const { handleForm, errorMsg } = useSneakerForm({
        errorSetters: {
            sneakerDescription: (isError: boolean) => setIsSneakerDescriptionError(isError),
        },
        focusSetters: {
            sneakerDescription: (isFocused: boolean) => setIsSneakerDescriptionFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(sneakerDescriptionValue);
    }, [sneakerDescriptionValue]);

    useEffect(() => {
        setSneakerDescriptionValue(initialValue);
    }, [initialValue]);

    const handleChange = (text: string) => {
        setSneakerDescriptionValue(text);
    };

    return (
        <TextInput
            placeholder="Description of your sneakers..."
            inputMode="text"
            value={sneakerDescriptionValue}
            autoCorrect={true}
            placeholderTextColor="gray"
            returnKeyType="done"
            multiline={true}
            textAlignVertical="top"
            onFocus={() => handleForm.inputFocus('sneakerDescription')}
            onBlur={() => handleForm.inputBlur('sneakerDescription', sneakerDescriptionValue)}
            onChangeText={handleChange}
            className={`bg-white rounded-md p-3 w-full h-full font-spacemono-bold ${
                isSneakerDescriptionFocused ? 'border-2 border-primary' : ''
            }`}
        />
    );
} 