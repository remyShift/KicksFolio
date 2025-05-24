import { Text, TextInput, View, ScrollView } from "react-native";
import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/Auth";

interface SizeInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    isSizeError: boolean;
    isSizeFocused: boolean;
    scrollViewRef: React.RefObject<ScrollView>;
    setIsSizeError: (isError: boolean) => void;
    setIsSizeFocused: (isFocused: boolean) => void;
}

export default function SizeInput({ inputRef, signUpProps, setSignUpProps, isSizeError, isSizeFocused, scrollViewRef, setIsSizeError, setIsSizeFocused }: SizeInputProps) {
    const { formValidation, handleForm } = useForm(
        {
            errorSetters: {
                size: (isError: boolean) => setIsSizeError(isError),
            },
            focusSetters: {
                size: (isFocused: boolean) => setIsSizeFocused(isFocused),
            },
            scrollViewRef
        }
    );

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
                value={signUpProps.sneaker_size ? String(signUpProps.sneaker_size) : ''}
                onChangeText={(text) => {
                    const formattedText = text.replace(',', '.');
                    if (formattedText === '' || !isNaN(Number(formattedText))) {
                        setSignUpProps({ ...signUpProps, sneaker_size: Number(formattedText) });
                        handleForm.inputChange(formattedText, (t) => setSignUpProps({ ...signUpProps, sneaker_size: Number(t) }));
                    }
                }}
                onFocus={() => handleForm.inputFocus('size')}
                onBlur={() => handleForm.inputBlur('size', String(signUpProps.sneaker_size))}
            />
        </View>
    )
}