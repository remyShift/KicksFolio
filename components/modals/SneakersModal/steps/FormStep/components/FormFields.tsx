import { View, TextInput, ScrollView } from 'react-native';
import { useRef } from 'react';
import SneakerNameInput from '@/components/ui/inputs/sneakerForm/SneakerNameInput';
import SneakerBrandInput from '@/components/ui/inputs/sneakerForm/SneakerBrandInput';
import SneakerStatusInput from '@/components/ui/inputs/sneakerForm/SneakerStatusInput';
import SneakerSizeInput from '@/components/ui/inputs/sneakerForm/SneakerSizeInput';
import SneakerPricePaidInput from '@/components/ui/inputs/sneakerForm/SneakerPricePaidInput';
import SneakerConditionInput from '@/components/ui/inputs/sneakerForm/SneakerConditionInput';
import SneakerDescriptionInput from '@/components/ui/inputs/sneakerForm/SneakerDescriptionInput';

import { SneakerToAdd } from '@/store/useModalStore';

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
    initialValues?: SneakerToAdd | null;
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
    initialValues,
}: FormFieldsProps) => {
    return (
        <View className="flex-1 gap-6 mt-2">
            <View className="flex gap-4 w-full">
                <SneakerNameInput
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerName', error)}
                    onValueChange={onSneakerNameChange}
                    initialValue={initialValues?.model}
                />

                <View className="flex-1 flex-row gap-2">
                    <SneakerBrandInput
                        scrollViewRef={scrollViewRef}
                        onErrorChange={(error) => onErrorChange('sneakerBrand', error)}
                        onValueChange={onSneakerBrandChange}
                        initialValue={initialValues?.brand}
                    />

                    <SneakerStatusInput
                        scrollViewRef={scrollViewRef}
                        onErrorChange={(error) => onErrorChange('sneakerStatus', error)}
                        onValueChange={onSneakerStatusChange}
                        initialValue={initialValues?.status}
                    />
                </View>
            </View>

            <View className="flex-row items-center w-full border-t-2 border-gray-300">
                <SneakerSizeInput
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerSize', error)}
                    onValueChange={onSneakerSizeChange}
                    initialValue={initialValues?.size}
                />

                <SneakerPricePaidInput
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerPricePaid', error)}
                    onValueChange={onSneakerPricePaidChange}
                    initialValue={initialValues?.price_paid}
                />

                <SneakerConditionInput
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerCondition', error)}
                    onValueChange={onSneakerConditionChange}
                    initialValue={initialValues?.condition}
                />
            </View>

            <View className="flex-1 max-h-[130px]">
                <SneakerDescriptionInput
                    scrollViewRef={scrollViewRef}
                    onErrorChange={(error) => onErrorChange('sneakerDescription', error)}
                    onValueChange={onSneakerDescriptionChange}
                    initialValue={initialValues?.description}
                />
            </View>
        </View>
    );
}; 