import { View, Text } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import FormSelectInput from '@/components/ui/inputs/FormSelectInput';
import { SneakerFormData } from '@/validation/schemas';
import { sneakerStatusOptions, sneakerBrandOptions } from '@/validation/schemas';
import { TextInput } from 'react-native';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { PhotoCarousel } from '@/components/ui/images/photoCaroussel/PhotoCarousel';
import { useTranslation } from 'react-i18next';

interface FormFieldsProps {
    control: Control<SneakerFormData>;
    handleFieldFocus: (fieldName: keyof SneakerFormData) => void;
    validateFieldOnBlur: (fieldName: keyof SneakerFormData, value: string) => Promise<boolean>;
    getFieldError: (fieldName: string) => string | undefined;
    modelInputRef: React.RefObject<TextInput>;
    brandInputRef: React.RefObject<TextInput>;
    sizeInputRef: React.RefObject<TextInput>;
    pricePaidInputRef: React.RefObject<TextInput>;
    descriptionInputRef: React.RefObject<TextInput>;
    displayedError: string;
    sneakerId?: string;
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
    sneakerId,
}: FormFieldsProps) => {
    const { t } = useTranslation();
    const getFieldErrorWrapper = (fieldName: string) => {
        return getFieldError(fieldName);
    };
    
    const imageError = getFieldErrorWrapper('images');

    return (
        <View className="flex-1 gap-4">
            <Controller
                name="images"
                control={control}
                render={({ field: { onChange, value } }) => {
                    return (
                        <PhotoCarousel
                            photos={value || []}
                            height={190}
                            mode="edit"
                            onPhotosChange={onChange}
                            maxImages={3}
                            sneakerId={sneakerId}
                        />
                    );
                }}
            />

            {(imageError || displayedError) && (
                <ErrorMsg 
                    content={imageError || displayedError} 
                    display={true} 
                />
            )}

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
                testID="model"
            />

            <View className="flex flex-row gap-1">
                <FormSelectInput
                    name="brand"
                    control={control}
                    placeholder={t('collection.modal.form.labels.brand')}
                    options={sneakerBrandOptions}
                    onFocus={() => handleFieldFocus('brand')}
                    error={getFieldErrorWrapper('brand')}
                    testID="brand"
                />

                <FormSelectInput
                    name="status"
                    control={control}
                    placeholder={t('collection.modal.form.labels.status')}
                    options={sneakerStatusOptions}
                    onFocus={() => handleFieldFocus('status')}
                    error={getFieldErrorWrapper('status')}
                    testID="status"
                />
            </View>

            <View className="flex-row items-center w-full border-t-2 border-gray-300">
                <View className="flex-1 flex-col items-center px-2 gap-1 border-r-2 border-gray-300">
                    <Text className="text-base font-spacemono mt-2">{t('collection.fields.size')}*</Text>
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
                        testID="size"
                    />
                </View>

                <View className="flex-1 flex-col items-center px-4 gap-1 border-r-2 border-gray-300">
                    <Text className="text-base font-spacemono mt-2">{t('collection.fields.condition')}*</Text>
                    <FormTextInput
                        name="condition"
                        control={control}
                        placeholder="9"
                        keyboardType="numeric"
                        onFocus={() => handleFieldFocus('condition')}
                        onBlur={async (value) => { await validateFieldOnBlur('condition', value); }}
                        error={getFieldErrorWrapper('condition')}
                        getFieldError={getFieldErrorWrapper}
                        testID="condition"
                    />
                </View>

                <View className="flex-1 flex-col items-center px-4 gap-1">
                    <Text className="text-base font-spacemono mt-2">{t('collection.fields.price_paid')}</Text>
                    <FormTextInput
                        name="price_paid"
                        control={control}
                        placeholder="150€"
                        ref={pricePaidInputRef}
                        nextInputRef={descriptionInputRef}
                        keyboardType="numeric"
                        onFocus={() => handleFieldFocus('price_paid')}
                        onBlur={async (value) => { await validateFieldOnBlur('price_paid', value); }}
                        error={getFieldErrorWrapper('price_paid')}
                        getFieldError={getFieldErrorWrapper}
                        testID="price"
                    />
                </View>
            </View>

            <FormTextInput
                name="description"
                control={control}
                placeholder={t('collection.fields.description')}
                ref={descriptionInputRef}
                onFocus={() => handleFieldFocus('description')}
                onBlur={async (value) => { await validateFieldOnBlur('description', value); }}
                error={getFieldErrorWrapper('description')}
                getFieldError={getFieldErrorWrapper}
                multiline={true}
                scrollEnabled={true}
                textAlignVertical="top"
                testID="description"
            />
        </View>
    );
}; 