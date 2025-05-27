import { View, TextInput, ScrollView } from 'react-native';
import { useRef } from 'react';
import SneakerNameInput from '@/components/ui/inputs/SneakerNameInput';
import SneakerBrandInput from '@/components/ui/inputs/SneakerBrandInput';
import SneakerStatusInput from '@/components/ui/inputs/sneakerForm/SneakerStatusInput';
import SneakerSizeInput from '@/components/ui/inputs/SneakerSizeInput';
import SneakerPricePaidInput from '@/components/ui/inputs/SneakerPricePaidInput';
import SneakerConditionInput from '@/components/ui/inputs/SneakerConditionInput';
import SneakerDescriptionInput from '@/components/ui/inputs/SneakerDescriptionInput';

interface FormFieldsProps {
    scrollViewRef: React.RefObject<ScrollView>;
    onSneakerNameChange: (value: string) => void;
    onSneakerBrandChange: (value: string) => void;
    onSneakerStatusChange: (value: string) => void;
    onSneakerSizeChange: (value: string) => void;
    onSneakerPricePaidChange: (value: string) => void;
    onSneakerConditionChange: (value: string) => void;
    onSneakerDescriptionChange: (value: string) => void;
    onErrorChange: (field: string, error: string) => void;
    initialValues?: {
        sneakerName?: string;
        sneakerBrand?: string;
        sneakerStatus?: string;
        sneakerSize?: string;
        sneakerPricePaid?: string;
        sneakerCondition?: string;
        sneakerDescription?: string;
    };
}

export const FormFields = ({
    scrollViewRef,
    onSneakerNameChange,
    onSneakerBrandChange,
    onSneakerStatusChange,
    onSneakerSizeChange,
    onSneakerPricePaidChange,
    onSneakerConditionChange,
    onSneakerDescriptionChange,
    onErrorChange,
    initialValues = {}
}: FormFieldsProps) => {
    const sneakerNameRef = useRef<TextInput>(null);
    const sneakerSizeRef = useRef<TextInput>(null);
    const sneakerPricePaidRef = useRef<TextInput>(null);
    const sneakerConditionRef = useRef<TextInput>(null);
    const sneakerDescriptionRef = useRef<TextInput>(null);

    return (
        <View className="flex flex-col gap-6 mt-2">
            <View className="flex flex-col gap-4 w-full items-center">
                <SneakerNameInput
                    inputRef={sneakerNameRef}
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerName', error)}
                    onValueChange={onSneakerNameChange}
                    initialValue={initialValues.sneakerName}
                />

                <SneakerBrandInput
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerBrand', error)}
                    onValueChange={onSneakerBrandChange}
                    initialValue={initialValues.sneakerBrand}
                />

                <SneakerStatusInput
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerStatus', error)}
                    onValueChange={onSneakerStatusChange}
                    initialValue={initialValues.sneakerStatus}
                />
            </View>

            <View className="flex-row items-center w-full border-t-2 border-gray-300">
                <SneakerSizeInput
                    inputRef={sneakerSizeRef}
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerSize', error)}
                    onValueChange={onSneakerSizeChange}
                    initialValue={initialValues.sneakerSize}
                />

                <SneakerPricePaidInput
                    inputRef={sneakerPricePaidRef}
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerPricePaid', error)}
                    onValueChange={onSneakerPricePaidChange}
                    initialValue={initialValues.sneakerPricePaid}
                />

                <SneakerConditionInput
                    inputRef={sneakerConditionRef}
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerCondition', error)}
                    onValueChange={onSneakerConditionChange}
                    initialValue={initialValues.sneakerCondition}
                />
            </View>

            <View className="flex-1 items-center w-full">
                <SneakerDescriptionInput
                    inputRef={sneakerDescriptionRef}
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerDescription', error)}
                    onValueChange={onSneakerDescriptionChange}
                    initialValue={initialValues.sneakerDescription}
                />
            </View>
        </View>
    );
}; 