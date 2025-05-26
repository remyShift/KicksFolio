import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/Auth";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";

interface SizeInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps?: UserData;
    setSignUpProps?: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
}

export default function SizeInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange }: SizeInputProps) {
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
        onValueChange(sizeValue);
    }, [sizeValue]);

    return (
    <View className='flex flex-col gap-2 w-full justify-center items-center'>
        <Text className='font-spacemono-bold text-lg'>*Sneaker Size</Text>
        <TextInput
            ref={inputRef}
            placeholder="42.5"
            inputMode='decimal'
            value={sizeValue}
            autoComplete='off'
            textContentType='none'
            autoCorrect={false}
            placeholderTextColor='gray'
            clearButtonMode='while-editing'
            returnKeyType='done'
            enablesReturnKeyAutomatically={true}
            onFocus={() => handleForm.inputFocus('size')}
            onBlur={() => handleForm.inputBlur('size', sizeValue)}
            onChangeText={(text) => {
                setSizeValue(text);
                setSignUpProps?.({ ...signUpProps!, sneaker_size: parseFloat(text) });
                handleForm.inputChange(text, (t) => setSignUpProps?.({ ...signUpProps!, sneaker_size: parseFloat(t) }));
            }}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isSizeError ? 'border-2 border-red-500' : ''
            } ${isSizeFocused ? 'border-2 border-primary' : ''}`}
        />
        {errorMsg !== '' && (
            <Text className='text-red-500 text-xs'>{errorMsg}</Text>
        )}
    </View>
    )
}