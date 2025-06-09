import { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import DropdownInput from '@/components/ui/inputs/sneakerForm/DropDownInput';
import { BRANDS } from '@/components/modals/SneakersModal/constants';
import { useSneakerForm } from "@/components/modals/SneakersModal/hooks/useSneakerForm";

interface SneakerBrandInputProps {
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
    isError?: boolean;
}

export default function SneakerBrandInput({ 
    scrollViewRef, 
    onErrorChange, 
    onValueChange,
    initialValue = "",
    isError = false,
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
    };

    const handleBrandOpen = () => {
        handleForm.inputFocus('sneakerBrand');
        clearErrors();
    };

    return (
        <View className='flex gap-2 w-1/2'>
            <View className="w-full">
                <DropdownInput
                    value={brandValue}
                    onSelect={handleBrandSelect}
                    options={BRANDS}
                    placeholder="Select a brand"
                    isError={isBrandError || isError}
                    onOpen={handleBrandOpen}
                    onBlur={() => handleForm.inputBlur('sneakerBrand', brandValue)}
                />
            </View>
        </View>
    );
} 