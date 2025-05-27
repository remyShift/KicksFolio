import { useForm } from "@/hooks/useForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { Link } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

interface SkuInputProps {
    inputRef: React.RefObject<TextInput>;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
}

export default function SkuInput({ inputRef, scrollViewRef, onErrorChange, onValueChange }: SkuInputProps) {
    const [isSkuError, setIsSkuError] = useState(false);
    const [isSkuFocused, setIsSkuFocused] = useState(false);
    const [skuValue, setSkuValue] = useState("");

    const { handleForm, errorMsg } = useForm({
        errorSetters: {
            sku: (isError: boolean) => setIsSkuError(isError),
        },
        focusSetters: {
            sku: (isFocused: boolean) => setIsSkuFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(skuValue);
    }, [skuValue]);

    return (
        <View className="flex-1 w-full justify-center items-center gap-12 pt-10">
            <View className="flex-row items-center">
                <Text className="font-spacemono-bold text-xl text-center px-6">
                    Put you sneakers SKU below
                </Text>
                <Link href="https://www.wikihow.com/Find-Model-Numbers-on-Nike-Shoes" 
                    className="flex-row justify-center items-center gap-2">
                    <FontAwesome6 name="lightbulb" size={20} color="#F27329" />
                </Link>
            </View>
            <Text className="font-spacemono-bold text-sm text-center px-6">
                NB : For Nike sneakers dont forget the "-" and the 3 numbers following it or it will not work.
            </Text>
            <View className="flex flex-col gap-2 w-full justify-center items-center">
                <Text className="font-spacemono-bold text-lg">*SKU</Text>
                <TextInput
                    ref={inputRef}
                    placeholder="DQ4478-101"
                    inputMode="text"
                    value={skuValue}
                    autoCorrect={false}
                    placeholderTextColor="gray"
                    clearButtonMode="while-editing"
                    returnKeyType="next"
                    enablesReturnKeyAutomatically={true}
                    onFocus={() => handleForm.inputFocus('sku')}
                    onBlur={() => handleForm.inputBlur('sku', skuValue)}
                    onChangeText={(text) => {
                        setSkuValue(text);
                        handleForm.inputChange(text, setSkuValue);
                    }}
                    className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                        isSkuError ? 'border-2 border-red-500' : ''
                    } ${isSkuFocused ? 'border-2 border-primary' : ''}`}
                />
                {errorMsg !== '' && (
                    <Text className='text-red-500 text-xs'>{errorMsg}</Text>
                )}
            </View>
        </View>
    );
}; 