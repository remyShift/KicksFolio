import { useForm } from "@/hooks/useForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

interface SkuInputProps {
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    onSubmit: () => void;
}

export default function SkuInput({ onErrorChange, onValueChange, onSubmit }: SkuInputProps) {
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
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(skuValue);
    }, [skuValue]);

    return (
        <View className="flex flex-col gap-2 w-full justify-center items-center">
            <Text className="font-spacemono-bold text-lg">*SKU :</Text>
            <TextInput
                placeholder="DQ4478-101"
                inputMode="text"
                value={skuValue}
                autoCorrect={false}
                placeholderTextColor="gray"
                clearButtonMode="while-editing"
                returnKeyType="search"
                onSubmitEditing={onSubmit}
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
        </View>
    );
}; 