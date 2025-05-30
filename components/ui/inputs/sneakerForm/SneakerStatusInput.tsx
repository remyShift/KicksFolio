import { useEffect, useState } from "react";
import { Text, View, ScrollView } from "react-native";
import DropdownInput from './DropDownInput';
import { STATUS } from '@/components/modals/SneakersModal/constants';
import { useSneakerFieldValidation } from "@/components/modals/SneakersModal/hooks/useSneakerFieldValidation";

interface SneakerStatusInputProps {
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
}

export default function SneakerStatusInput({ 
    scrollViewRef, 
    onErrorChange, 
    onValueChange,
    initialValue = ""
}: SneakerStatusInputProps) {
    const [sneakerStatusValue, setSneakerStatusValue] = useState(initialValue);

    const { errorMsg, isError, validateStatus, clearErrors } = useSneakerFieldValidation();

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(sneakerStatusValue);
    }, [sneakerStatusValue]);

    useEffect(() => {
        setSneakerStatusValue(initialValue);
    }, [initialValue]);

    const handleStatusSelect = (value: string) => {
        setSneakerStatusValue(value);
        validateStatus(value);
    };

    const handleStatusOpen = () => {
        clearErrors();
    };

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*Status</Text>
            <View className="w-2/3">
                <DropdownInput
                    value={sneakerStatusValue}
                    onSelect={handleStatusSelect}
                    options={STATUS}
                    placeholder="Select a status"
                    isError={isError}
                    onOpen={handleStatusOpen}
                />
                {errorMsg !== '' && (
                    <Text className='text-red-500 text-xs text-center mt-1'>{errorMsg}</Text>
                )}
            </View>
        </View>
    );
} 