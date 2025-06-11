import { View } from 'react-native';
import { Control } from 'react-hook-form';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import FormSelectInput from '@/components/ui/inputs/FormSelectInput';
import { SneakerFormData } from '@/validation/schemas';
import { sneakerStatusOptions, sneakerBrandOptions } from '@/validation/schemas';
import { TextInput } from 'react-native';

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
}

export const FormFields = ({
    control,
    handleFieldFocus,
    validateFieldOnBlur,
    getFieldError,
    modelInputRef,
    brandInputRef,
    sizeInputRef,
    pricePaidInputRef,
    descriptionInputRef,
}: FormFieldsProps) => {
    const getFieldErrorWrapper = (fieldName: string) => {
        return getFieldError(fieldName);
    };

    return (
        <View className="flex-1 gap-4">
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

            <FormTextInput
                name="pricePaid"
                control={control}
                placeholder="150"
                ref={pricePaidInputRef}
                nextInputRef={descriptionInputRef}
                keyboardType="numeric"
                onFocus={() => handleFieldFocus('pricePaid')}
                onBlur={async (value) => { await validateFieldOnBlur('pricePaid', value); }}
                error={getFieldErrorWrapper('pricePaid')}
                getFieldError={getFieldErrorWrapper}
            />

            <FormTextInput
                name="description"
                control={control}
                placeholder="Additional notes..."
                ref={descriptionInputRef}
                onFocus={() => handleFieldFocus('description')}
                onBlur={async (value) => { await validateFieldOnBlur('description', value); }}
                error={getFieldErrorWrapper('description')}
                getFieldError={getFieldErrorWrapper}
            />
        </View>
    );
}; 