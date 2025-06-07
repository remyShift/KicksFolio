import { useEffect, useState } from "react";
import { Text, View, ScrollView, TextInput } from "react-native";
import DropdownInput from './DropDownInput';
import { STATUS } from '@/components/modals/SneakersModal/constants';
import { useSneakerForm } from "@/components/modals/SneakersModal/hooks/useSneakerForm";

interface SneakerStatusInputProps {
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
    nextInputRef?: React.RefObject<TextInput>;
}

export default function SneakerStatusInput({ 
    scrollViewRef, 
    onErrorChange, 
    onValueChange,
    initialValue = "",
    nextInputRef
}: SneakerStatusInputProps) {
    const [isStatusError, setIsStatusError] = useState(false);
    const [isStatusFocused, setIsStatusFocused] = useState(false);
    const [statusValue, setStatusValue] = useState(initialValue);

    const { handleForm, errorMsg } = useSneakerForm({
        errorSetters: {
            sneakerStatus: (isError: boolean) => setIsStatusError(isError),
        },
        focusSetters: {
            sneakerStatus: (isFocused: boolean) => setIsStatusFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(statusValue);
    }, [statusValue]);

    useEffect(() => {
        setStatusValue(initialValue);
    }, [initialValue]);

    const handleStatusSelect = (value: string) => {
        handleForm.inputChange(value, setStatusValue);
    };

    const handleStatusOpen = () => {
        handleForm.inputFocus('sneakerStatus');
    };

    return (
        <View className='flex gap-2 w-1/2'>
            <View className="w-full">
                <DropdownInput
                    value={statusValue}
                    onSelect={handleStatusSelect}
                    options={STATUS}
                    placeholder="Select a status"
                    isError={isStatusError}
                    onOpen={handleStatusOpen}
                    onBlur={() => handleForm.inputBlur('sneakerStatus', statusValue)}
                />
            </View>
        </View>
    );
} 