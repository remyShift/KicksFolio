import { View, Text } from 'react-native';
import { Control } from 'react-hook-form';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import FormSelectInput from '@/components/ui/inputs/FormSelectInput';
import { SneakerFormData } from '@/validation/schemas';
import { sneakerStatusOptions, sneakerBrandOptions } from '@/validation/schemas';
import { TextInput } from 'react-native';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { ImageUploader } from './ImageUploader';
import { useModalStore } from '@/store/useModalStore';

interface FormFieldsProps {
    control: Control<SneakerFormData>;
    handleFieldFocus: (fieldName: keyof SneakerFormData) => void;
    validateFieldOnBlur: (fieldName: keyof SneakerFormData, value: string) => Promise<void>;
    getFieldError: (fieldName: string) => string | undefined;
    modelInputRef: React.RefObject<TextInput>;
    brandInputRef: React.RefObject<TextInput>;
    sizeInputRef: React.RefObject<TextInput>;
    pricePaidInputRef: React.RefObject<TextInput>;
    descriptionInputRef: React.RefObject<TextInput>;
    displayedError: string;
}

export const FormFields = ({
    control,
    handleFieldFocus,
    validateFieldOnBlur,
    getFieldError,
    modelInputRef,
    brandInputRef,
    sizeInputRef,
    displayedError,
    pricePaidInputRef,
    descriptionInputRef,
}: FormFieldsProps) => {
    const getFieldErrorWrapper = (fieldName: string) => {
        return getFieldError(fieldName);
    };
    
    const { sneakerToAdd, setSneakerToAdd, currentSneaker } = useModalStore();

    const imageDisplayed = sneakerToAdd?.images?.[0]?.url || currentSneaker?.images?.[0]?.url;

    return (
        <View className="flex-1 gap-4">
            <ImageUploader
                image={imageDisplayed || ''}
                setImage={(uri: string) => {
                    setSneakerToAdd({
                        ...sneakerToAdd,
                        images: [{ url: uri }, ...(sneakerToAdd?.images?.slice(1) || [])],
                    } as any);
                }}
                isError={false}
                isFocused={false}
                setIsError={() => {}}
            />

            {displayedError && <ErrorMsg content={displayedError} display={true} />}

            <FormTextInput
                name="model"
                control={control}
                placeholder="Air Max 1 x Patta"
                ref={modelInputRef}
                nextInputRef={brandInputRef}
                autoCapitalize="words"
                onFocus={() => handleFieldFocus('model')}
                onBlur={async (value) => { await validateFieldOnBlur('model', value); }}
                error={getFieldErrorWrapper('model')}
                getFieldError={getFieldErrorWrapper}
            />

            <View className="flex flex-row gap-1">
                <FormSelectInput
                    name="brand"
                    control={control}
                    placeholder="Select brand"
                    options={sneakerBrandOptions}
                    onFocus={() => handleFieldFocus('brand')}
                    error={getFieldErrorWrapper('brand')}
                />

                <FormSelectInput
                    name="status"
                    control={control}
                    placeholder="Select status"
                    options={sneakerStatusOptions}
                    onFocus={() => handleFieldFocus('status')}
                    error={getFieldErrorWrapper('status')}
                />
            </View>

            <View className="flex-row items-center w-full border-t-2 border-gray-300">
                <View className="flex-1 flex-col items-center px-4 gap-1 border-r-2 border-gray-300">
                    <Text className="text-base font-spacemono mt-2">*Size (US)</Text>
                    <FormTextInput
                        name="size"
                        control={control}
                        placeholder="9.5"
                        ref={sizeInputRef}
                        nextInputRef={pricePaidInputRef}
                        keyboardType="numeric"
                        onFocus={() => handleFieldFocus('size')}
                        onBlur={async (value) => { await validateFieldOnBlur('size', value); }}
                        error={getFieldErrorWrapper('size')}
                        getFieldError={getFieldErrorWrapper}
                    />
                </View>

                <View className="flex-1 flex-col items-center px-4 gap-1 border-r-2 border-gray-300">
                    <Text className="text-base font-spacemono mt-2">*Condition</Text>
                    <FormTextInput
                        name="condition"
                        control={control}
                        placeholder="9"
                        keyboardType="numeric"
                        onFocus={() => handleFieldFocus('condition')}
                        onBlur={async (value) => { await validateFieldOnBlur('condition', value); }}
                        error={getFieldErrorWrapper('condition')}
                        getFieldError={getFieldErrorWrapper}
                    />
                </View>

                <View className="flex-1 flex-col items-center px-4 gap-1">
                    <Text className="text-base font-spacemono mt-2">Price Paid</Text>
                    <FormTextInput
                        name="pricePaid"
                        control={control}
                        placeholder="150€"
                        ref={pricePaidInputRef}
                        nextInputRef={descriptionInputRef}
                        keyboardType="numeric"
                        onFocus={() => handleFieldFocus('price_paid')}
                        onBlur={async (value) => { await validateFieldOnBlur('price_paid', value); }}
                        error={getFieldErrorWrapper('price_paid')}
                        getFieldError={getFieldErrorWrapper}
                    />
                </View>
            </View>

            <FormTextInput
                name="description"
                control={control}
                placeholder="Additional notes..."
                ref={descriptionInputRef}
                onFocus={() => handleFieldFocus('description')}
                onBlur={async (value) => { await validateFieldOnBlur('description', value); }}
                error={getFieldErrorWrapper('description')}
                getFieldError={getFieldErrorWrapper}
                multiline={true}
                scrollEnabled={true}
                textAlignVertical="top"
            />
        </View>
    );
}; 