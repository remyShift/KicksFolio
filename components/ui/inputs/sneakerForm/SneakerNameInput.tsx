import { useEffect, useState } from "react";
import { TextInput, ScrollView } from "react-native";
import { useSneakerForm } from "@/components/modals/SneakersModal/hooks/useSneakerForm";
import { useFormErrors } from "@/context/formErrorsContext";

interface SneakerNameInputProps {
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
    isError?: boolean;
}

export default function SneakerNameInput({ 
    scrollViewRef,
    onErrorChange, 
    onValueChange,
    initialValue = "",
    isError = false,
}: SneakerNameInputProps) {
    const [isNameError, setIsNameError] = useState(false);
    const [isNameFocused, setIsNameFocused] = useState(false);
    const [nameValue, setNameValue] = useState(initialValue);
    const { clearErrors } = useFormErrors();
    const { handleForm, errorMsg } = useSneakerForm({
        errorSetters: {
            sneakerName: (isError: boolean) => setIsNameError(isError),
        },
        focusSetters: {
            sneakerName: (isFocused: boolean) => setIsNameFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(nameValue);
    }, [nameValue]);

    useEffect(() => {
        setNameValue(initialValue);
    }, [initialValue]);

    return (
        <TextInput
            placeholder="Air Max 1"
            inputMode="text"
            value={nameValue}
            autoCorrect={false}
            placeholderTextColor="gray"
            clearButtonMode="while-editing"
            returnKeyType="next"
            enablesReturnKeyAutomatically={true}
            onFocus={() => {
                handleForm.inputFocus('sneakerName');
                clearErrors();
            }}
            onBlur={() => handleForm.inputBlur('sneakerName', nameValue)}
            onChangeText={(text) => {
                handleForm.inputChange(text, setNameValue);
            }}
            className={`bg-white rounded-md p-3 w-full font-spacemono-bold ${
                (isNameError || isError) ? 'border-2 border-red-500' : ''
            } ${isNameFocused ? 'border-2 border-primary' : ''}`}
        />
    );
} 