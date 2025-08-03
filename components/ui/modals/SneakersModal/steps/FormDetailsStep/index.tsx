import { Image, Pressable, ScrollView, TextInput, View, Text } from 'react-native';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/TODO/useFormController';
import { createSneakerSchema, SneakerFormData } from '@/validation/schemas';
import { useFormValidation } from '../../hooks/useFormValidation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Photo, SneakerBrand, SneakerStatus, Sneaker } from '@/types/Sneaker';
import { useTranslation } from 'react-i18next';
import { FormFields } from '../../shared/FormFields';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSizeConversion } from '@/hooks/TODO/useSizeConversion';


export const FormDetailsStep = () => {
    const [scrollEnabled, setScrollEnabled] = useState(false);
    const modelInputRef = useRef<TextInput>(null);
    const brandInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const pricePaidInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const { t } = useTranslation();
    const { getSizeForCurrentUnit } = useSizeConversion();

    const { 
        sneakerToAdd, 
        setSneakerToAdd, 
        errorMsg, 
        setModalStep,
        currentSneaker 
    } = useModalStore();

    const currentSneakerSize = useMemo(() => {
        return currentSneaker ? getSizeForCurrentUnit(currentSneaker).toString() : '';
    }, [currentSneaker, getSizeForCurrentUnit]);

    const createFormData = useCallback((sneakerToAdd: SneakerFormData | null, currentSneaker: Sneaker | null, currentSneakerSize: string) => {
        return {
            model: sneakerToAdd?.model || '',
            brand: sneakerToAdd?.brand || SneakerBrand.null,
            status: sneakerToAdd?.status || SneakerStatus.null,
            size: sneakerToAdd?.size || currentSneakerSize,
            condition: sneakerToAdd?.condition || '',
            price_paid: sneakerToAdd?.price_paid || '',
            description: sneakerToAdd?.description || '',
            og_box: sneakerToAdd?.og_box || false,
            ds: sneakerToAdd?.ds || false,
            is_women: sneakerToAdd?.is_women || false,
            images: sneakerToAdd?.images || [],
        } as SneakerFormData;
    }, []);

    const formData = useMemo(() => 
        createFormData(sneakerToAdd, currentSneaker, currentSneakerSize), 
        [sneakerToAdd, currentSneaker, currentSneakerSize, createFormData]
    );
    
    const {
        control,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        reset,
        trigger,
        watch,
        getValues,
        displayedError,
        getFieldErrorWrapper,
        setValue,
    } = useFormController<SneakerFormData>({
        schema: createSneakerSchema(),
        fieldNames: ['model', 'brand', 'status', 'size', 'condition', 'price_paid', 'description'],
        authErrorMsg: errorMsg,
        defaultValues: formData,
        onSubmit: async (data) => {
            setSneakerToAdd({
                ...data,
                images: sneakerToAdd?.images || []
            });
        },
    });
    
    useFormValidation(watch, reset, trigger, (fieldName: any) => getFieldError(fieldName), getValues);

    useEffect(() => {
        if (formData) {
            reset(formData);
        }
    }, [formData, reset]);

    const handleEditImages = () => {
        setModalStep('addFormImages');
    };

    return (
        <KeyboardAwareScrollView
            ref={scrollViewRef}
            className='flex-1'
            scrollEnabled={scrollEnabled}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, padding: 8 }}
            bottomOffset={10}
        >
            <View className="flex-1 gap-4">
                <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-open-sans-bold text-base">
                            {t('collection.modal.titles.selectedImages')}
                        </Text>
                        <Pressable
                            onPress={handleEditImages}
                            className="flex-row items-center gap-2 bg-gray-100 px-3 py-1 rounded-md"
                        >
                            <MaterialIcons name="edit" size={16} color="#F27329" />
                            <Text className="font-open-sans-bold text-sm text-primary">
                                {t('collection.modal.buttons.editImages')}
                            </Text>
                        </Pressable>
                    </View>
                    
                    {sneakerToAdd?.images && sneakerToAdd.images.length > 0 ? (
                        <View className="flex-row gap-2">
                            {sneakerToAdd.images.map((image: Photo, index: number) => (
                                <Image
                                    key={index}
                                    source={{ uri: image.uri }}
                                    className="w-28 h-20 rounded-md"
                                    resizeMode="cover"
                                />
                            ))}
                        </View>
                    ) : (
                        <View className="h-20 bg-gray-100 rounded-md flex items-center justify-center">
                            <MaterialIcons name="image" size={24} color="#9CA3AF" />
                            <Text className="text-gray-400 text-sm mt-1">
                                {t('collection.modal.descriptions.noImages')}
                            </Text>
                        </View>
                    )}
                </View>

                <FormFields
                    control={control}
                    displayedError={displayedError}
                    handleFieldFocus={(fieldName) => {
                        setScrollEnabled(true);
                        handleFieldFocus(fieldName);
                    }}
                    validateFieldOnBlur={async (fieldName, value) => {
                        setScrollEnabled(false);
                        return await validateFieldOnBlur(fieldName, value);
                    }}
                    getFieldError={getFieldErrorWrapper}
                    modelInputRef={modelInputRef}
                    brandInputRef={brandInputRef}
                    sizeInputRef={sizeInputRef}
                    pricePaidInputRef={pricePaidInputRef}
                    descriptionInputRef={descriptionInputRef}
                    setValue={setValue}
                />
            </View>
        </KeyboardAwareScrollView>
    );
}; 