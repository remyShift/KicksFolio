import { View, Text, TextInput } from 'react-native';
import DropdownInput from '@/components/ui/inputs/DropDownInput';
import { BRANDS, STATUS } from '@/components/modals/AddSneakersModal/constants';
import { InputType } from '@/components/modals/AddSneakersModal/types';

interface FormFieldsProps {
    sneakerName: string;
    setSneakerName: (value: string) => void;
    sneakerBrand: string;
    setSneakerBrand: (value: string) => void;
    sneakerStatus: string;
    setSneakerStatus: (value: string) => void;
    sneakerSize: string;
    setSneakerSize: (value: string) => void;
    sneakerCondition: string;
    setSneakerCondition: (value: string) => void;
    sneakerPricePaid: string;
    setSneakerPricePaid: (value: string) => void;
    sneakerDescription: string;
    setSneakerDescription: (value: string) => void;
    isSneakerNameError: boolean;
    isSneakerBrandError: boolean;
    isSneakerStatusError: boolean;
    isSneakerSizeError: boolean;
    isSneakerConditionError: boolean;
    isPricePaidError: boolean;
    isSneakerNameFocused: boolean;
    isSneakerBrandFocused: boolean;
    isSneakerStatusFocused: boolean;
    isSneakerSizeFocused: boolean;
    isSneakerConditionFocused: boolean;
    isPricePaidFocused: boolean;
    handleInputFocus: (type: InputType) => void;
    handleInputBlur: (type: InputType, value: string) => void;
}

export const FormFields = ({
    sneakerName, setSneakerName,
    sneakerBrand, setSneakerBrand,
    sneakerStatus, setSneakerStatus,
    sneakerSize, setSneakerSize,
    sneakerCondition, setSneakerCondition,
    sneakerPricePaid, setSneakerPricePaid,
    sneakerDescription, setSneakerDescription,
    isSneakerNameError, isSneakerBrandError,
    isSneakerStatusError, isSneakerSizeError,
    isSneakerConditionError, isPricePaidError,
    isSneakerNameFocused, isSneakerBrandFocused,
    isSneakerStatusFocused, isSneakerSizeFocused,
    isSneakerConditionFocused, isPricePaidFocused,
    handleInputFocus, handleInputBlur
}: FormFieldsProps) => {
    return (
        <View className="flex flex-col gap-6 mt-2">
            <View className="flex flex-col gap-4 w-4/5">
                <View className='flex flex-col gap-2 w-full justify-center'>
                    <TextInput 
                        className={`bg-white rounded-md p-2 w-full font-spacemono-bold ${
                            isSneakerNameError ? 'border-2 border-red-500' : ''
                        } ${isSneakerNameFocused ? 'border-2 border-primary' : ''}`} 
                        placeholder="Air Max 1"
                        placeholderTextColor='gray'
                        value={sneakerName}
                        onChangeText={setSneakerName}
                        onFocus={() => handleInputFocus('name')}
                        onBlur={() => handleInputBlur('name', sneakerName)}
                    />
                </View>

                <DropdownInput
                    value={sneakerBrand}
                    onSelect={(value) => {
                        setSneakerBrand(value);
                        handleInputBlur('brand', value);
                    }}
                    options={BRANDS}
                    placeholder="Select a brand"
                    isError={isSneakerBrandError}
                    onOpen={() => handleInputFocus('brand')}
                />

                <DropdownInput
                    value={sneakerStatus}
                    onSelect={(value) => {
                        setSneakerStatus(value);
                        handleInputBlur('status', value);
                    }}
                    options={STATUS}
                    placeholder="Select a status"
                    isError={isSneakerStatusError}
                    onOpen={() => handleInputFocus('status')}
                />
            </View>

            <View className="flex-row items-center w-full border-t-2 border-gray-300">
                <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                    <Text className='font-spacemono text-center'>Size (US)</Text>
                    <View className="w-4/5">
                        <TextInput
                            className={`bg-white rounded-md p-2 w-full font-spacemono-bold relative ${
                                isSneakerSizeError ? 'border-2 border-red-500' : ''
                            } ${isSneakerSizeFocused ? 'border-2 border-primary' : ''}`} 
                            placeholder="9.5"
                            inputMode='decimal'
                            keyboardType='decimal-pad'
                            maxLength={4}
                            autoComplete='off'
                            placeholderTextColor='gray'
                            value={sneakerSize ? String(sneakerSize) : ''}
                            onChangeText={(text) => {
                                const formattedText = text.replace(',', '.');
                                if (formattedText === '' || !isNaN(Number(formattedText))) {
                                    setSneakerSize(formattedText);
                                }
                            }}
                            onFocus={() => handleInputFocus('size')}
                            onBlur={() => handleInputBlur('size', String(sneakerSize))}
                        />
                    </View>
                </View>

                <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                    <Text className='font-spacemono text-center'>Price Paid</Text>
                    <View className="w-4/5">
                        <TextInput
                            className={`bg-white rounded-md p-2 w-full font-spacemono-bold relative ${
                                isPricePaidError ? 'border-2 border-red-500' : ''
                            } ${isPricePaidFocused ? 'border-2 border-primary' : ''}`} 
                            placeholder="150"
                            inputMode='decimal'
                            keyboardType='decimal-pad'
                            autoComplete='off'
                            placeholderTextColor='gray'
                            value={sneakerPricePaid ? String(sneakerPricePaid) : ''}
                            onChangeText={(text) => {
                                const formattedText = text.replace(',', '.');
                                if (formattedText === '' || !isNaN(Number(formattedText))) {
                                    setSneakerPricePaid(formattedText);
                                }
                            }}
                            onFocus={() => handleInputFocus('pricePaid')}
                            onBlur={() => handleInputBlur('pricePaid', String(sneakerPricePaid))}
                        />
                    </View>
                </View>

                <View className='flex-col items-center p-2 gap-1 w-1/3'>
                    <Text className='font-spacemono text-center'>Condition</Text>
                    <View className="w-4/5">
                        <TextInput
                            className={`bg-white rounded-md p-2 w-full font-spacemono-bold relative ${
                                isSneakerConditionError ? 'border-2 border-red-500' : ''
                            } ${isSneakerConditionFocused ? 'border-2 border-primary' : ''}`} 
                            placeholder="0 - 10"
                            inputMode='decimal'
                            keyboardType='decimal-pad'
                            maxLength={3}
                            autoComplete='off'
                            placeholderTextColor='gray'
                            value={sneakerCondition ? String(sneakerCondition) : ''}
                            onChangeText={(text) => {
                                const formattedText = text.replace(',', '.');
                                if (formattedText === '' || !isNaN(Number(formattedText))) {
                                    setSneakerCondition(formattedText);
                                }
                            }}
                            onFocus={() => handleInputFocus('condition')}
                            onBlur={() => handleInputBlur('condition', String(sneakerCondition))}
                        />
                    </View>
                </View>
            </View>

            <View className="flex-1 items-center w-full">
                <View className="relative w-full">
                    <TextInput
                        className="bg-white rounded-md p-2 w-full font-spacemono-bold pr-10"
                        value={sneakerDescription}
                        onChangeText={setSneakerDescription}
                        placeholder="Description"
                        placeholderTextColor='gray'
                        multiline={true}
                        textAlignVertical="top"
                        style={{
                            minHeight: 60,
                            maxHeight: 80
                        }}
                    />
                </View>
            </View>
        </View>
    );
}; 