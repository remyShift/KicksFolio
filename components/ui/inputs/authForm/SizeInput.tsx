import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/auth";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";

interface SizeInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps?: UserData;
    setSignUpProps?: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange?: (value: string) => void;
    onSubmitEditing?: () => Promise<string | null>;
    isError?: boolean;
}

export default function SizeInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange, onSubmitEditing, isError = false }: SizeInputProps) {
    const [isSizeError, setIsSizeError] = useState(false);
    const [isSizeFocused, setIsSizeFocused] = useState(false);
    const [sizeValue, setSizeValue] = useState(signUpProps?.sneaker_size?.toString() || "");

    const { handleForm, errorMsg } = useForm({
        errorSetters: {
            size: (isError: boolean) => setIsSizeError(isError),
        },
        focusSetters: {
            size: (isFocused: boolean) => setIsSizeFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange?.(sizeValue);
    }, [sizeValue, onValueChange]);

    return (
    <View className='flex flex-col gap-2 w-full justify-center items-center'>
        <Text className='font-spacemono-bold text-lg'>*Sneaker Size (US)</Text>
        <TextInput
            ref={inputRef}
            placeholder="9"
            inputMode='decimal'
            value={sizeValue}
            autoComplete='off'
            textContentType='none'
            autoCorrect={false}
            placeholderTextColor='gray'
            clearButtonMode='while-editing'
            returnKeyType='done'
            onSubmitEditing={() => {
                onSubmitEditing?.().then((errorMsg) => {
                    if (errorMsg) {
                        handleForm.inputBlur('size', sizeValue, false, errorMsg);
                    }
                });
            }}
            enablesReturnKeyAutomatically={true}
            onFocus={() => {
                handleForm.inputFocus('size');
            }}
            onBlur={() => handleForm.inputBlur('size', sizeValue)}
            onChangeText={(text) => {
                setSizeValue(text);
                setSignUpProps?.({ ...signUpProps!, sneaker_size: parseFloat(text) });
                handleForm.inputChange(text, (t) => setSignUpProps?.({ ...signUpProps!, sneaker_size: parseFloat(t) }));
            }}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                (isSizeError || isError) ? 'border-2 border-red-500' : ''
            } ${isSizeFocused ? 'border-2 border-primary' : ''}`}
        />
    </View>
    )
}