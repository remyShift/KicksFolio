import { useEffect, useState } from "react";
import { Text, View, ScrollView } from "react-native";
import DropdownInput from '@/components/ui/inputs/DropDownInput';
import { BRANDS } from '@/components/modals/SneakersModal/constants';
import { useSneakerFieldValidation } from "@/components/modals/SneakersModal/hooks/useSneakerFieldValidation";

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
    const [sneakerBrandValue, setSneakerBrandValue] = useState(initialValue);

    const { errorMsg, isError, validateBrand, clearErrors } = useSneakerFieldValidation();

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(sneakerBrandValue);
    }, [sneakerBrandValue]);

    useEffect(() => {
        setSneakerBrandValue(initialValue);
    }, [initialValue]);

    const handleBrandSelect = (value: string) => {
        setSneakerBrandValue(value);
        validateBrand(value);
    };

    const handleBrandOpen = () => {
        clearErrors();
    };

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*Brand</Text>
            <View className="w-2/3">
                <DropdownInput
                    value={sneakerBrandValue}
                    onSelect={handleBrandSelect}
                    options={BRANDS}
                    placeholder="Select a brand"
                    isError={isError}
                    onOpen={handleBrandOpen}
                />
                {errorMsg !== '' && (
                    <Text className='text-red-500 text-xs text-center mt-1'>{errorMsg}</Text>
                )}
            </View>
        </View>
    );
} 