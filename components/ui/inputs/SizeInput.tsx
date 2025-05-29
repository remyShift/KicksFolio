import { useForm } from "@/hooks/useForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { UserData } from "@/types/Auth";

interface SizeInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
}

export default function SizeInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange }: SizeInputProps) {
    const [sizeValue, setSizeValue] = useState(signUpProps.sneaker_size ? String(signUpProps.sneaker_size) : "");
    const [isSizeError, setIsSizeError] = useState(false);
    const [isSizeFocused, setIsSizeFocused] = useState(false);

    const { formValidation, handleForm, errorMsg } = useForm({
        errorSetters: {
            size: (isError: boolean) => setIsSizeError(isError),
        },
        focusSetters: {
            size: (isFocused: boolean) => setIsSizeFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onValueChange(sizeValue);
    }, [sizeValue]);

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*Sneaker size (US)</Text>
            <TextInput
                ref={inputRef}
                className={`bg-white rounded-md p-2 w-2/3 font-spacemono-bold relative ${
                    isSizeError ? 'border-2 border-red-500' : ''
                } ${isSizeFocused ? 'border-2 border-primary' : ''}`} 
                placeholder="9.5"
                inputMode='decimal'
                keyboardType='decimal-pad'
                maxLength={4}
                clearButtonMode='while-editing'
                returnKeyType='done'
                enablesReturnKeyAutomatically={true}
                autoComplete='off'
                placeholderTextColor='gray'
                value={sizeValue}
                onChangeText={(text) => {
                    const formattedText = text.replace(',', '.');
                    if (formattedText === '' || !isNaN(Number(formattedText))) {
                        setSizeValue(formattedText);
                        setSignUpProps({ ...signUpProps, sneaker_size: formattedText === '' ? 0 : Number(formattedText) });
                        handleForm.inputChange(formattedText, (t) => setSignUpProps({ ...signUpProps, sneaker_size: t === '' ? 0 : Number(t) }));
                    }
                }}
                onFocus={() => handleForm.inputFocus('size')}
                onBlur={() => handleForm.inputBlur('size', sizeValue)}
            />
            {errorMsg !== '' && (
                <Text className='text-red-500 text-xs'>{errorMsg}</Text>
            )}
        </View>
    )
}