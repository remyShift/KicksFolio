import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { useSneakerForm } from "@/hooks/useSneakerForm";

interface SneakerNameInputProps {
    inputRef: React.RefObject<TextInput>;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
    nextInputRef?: React.RefObject<TextInput>;
}

export default function SneakerNameInput({ 
    inputRef, 
    scrollViewRef,
    onErrorChange, 
    onValueChange,
    initialValue = "",
    nextInputRef
}: SneakerNameInputProps) {
    const [isNameError, setIsNameError] = useState(false);
    const [isNameFocused, setIsNameFocused] = useState(false);
    const [nameValue, setNameValue] = useState(initialValue);

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
            ref={inputRef}
            placeholder="Air Max 1"
            inputMode="text"
            value={nameValue}
            autoCorrect={false}
            placeholderTextColor="gray"
            clearButtonMode="while-editing"
            returnKeyType="next"
            onSubmitEditing={() => {
                if (nextInputRef) {
                    handleForm.inputBlur('sneakerName', nameValue, nextInputRef)
                        .then((isValid) => {
                            if (isValid) {
                                nextInputRef.current?.focus();
                            }
                        });
                }
            }}
            enablesReturnKeyAutomatically={true}
            onFocus={() => handleForm.inputFocus('sneakerName')}
            onBlur={() => handleForm.inputBlur('sneakerName', nameValue)}
            onChangeText={(text) => {
                handleForm.inputChange(text, setNameValue);
            }}
            className={`bg-white rounded-md p-3 w-full font-spacemono-bold ${
                isNameError ? 'border-2 border-red-500' : ''
            } ${isNameFocused ? 'border-2 border-primary' : ''}`}
        />
    );
} 