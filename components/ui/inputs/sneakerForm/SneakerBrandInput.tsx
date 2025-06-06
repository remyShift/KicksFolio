import { useEffect, useState } from "react";
import { Text, View, ScrollView } from "react-native";
import DropdownInput from '@/components/ui/inputs/sneakerForm/DropDownInput';
import { BRANDS } from '@/components/modals/SneakersModal/constants';
import { useSneakerForm } from "@/hooks/useSneakerForm";

interface SneakerBrandInputProps {
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
}

export default function SneakerBrandInput({ 
    scrollViewRef, 
    onErrorChange, 
    onValueChange,
    initialValue = ""
}: SneakerBrandInputProps) {
    const [isBrandError, setIsBrandError] = useState(false);
    const [isBrandFocused, setIsBrandFocused] = useState(false);
    const [brandValue, setBrandValue] = useState(initialValue);

    const { handleForm, errorMsg } = useSneakerForm({
        errorSetters: {
            sneakerBrand: (isError: boolean) => setIsBrandError(isError),
        },
        focusSetters: {
            sneakerBrand: (isFocused: boolean) => setIsBrandFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(brandValue);
    }, [brandValue]);

    useEffect(() => {
        setBrandValue(initialValue);
    }, [initialValue]);

    const handleBrandSelect = (value: string) => {
        handleForm.inputChange(value, setBrandValue);
        handleForm.inputBlur('sneakerBrand', value);
    };

    const handleBrandOpen = () => {
        handleForm.inputFocus('sneakerBrand');
    };

    return (
        <View className='flex gap-2 w-1/2'>
            <View className="w-full">
                <DropdownInput
                    value={brandValue}
                    onSelect={handleBrandSelect}
                    options={BRANDS}
                    placeholder="Select a brand"
                    isError={isBrandError}
                    onOpen={handleBrandOpen}
                />
                {errorMsg !== '' && (
                    <Text className='text-red-500 text-xs text-center mt-1'>{errorMsg}</Text>
                )}
            </View>
        </View>
    );
} 