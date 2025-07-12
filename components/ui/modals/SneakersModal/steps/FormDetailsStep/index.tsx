import { Image, Pressable, ScrollView, TextInput, View, Text } from 'react-native';
import { useRef, useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/useFormController';
import { createSneakerSchema, SneakerFormData } from '@/validation/schemas';
import { useFormValidation } from '../../hooks/useFormValidation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Photo, SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import { useTranslation } from 'react-i18next';
import { FormFields } from '../../shared/FormFields';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const FormDetailsStep = () => {
    const modelInputRef = useRef<TextInput>(null);
    const brandInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const pricePaidInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const { t } = useTranslation();
    
    const { 
        sneakerToAdd, 
        setSneakerToAdd, 
        errorMsg, 
        setModalStep 
    } = useModalStore();
    
    const {
        control,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        reset,
        trigger,
        watch,
        displayedError,
        getFieldErrorWrapper,
    } = useFormController<SneakerFormData>({
        schema: createSneakerSchema(),
        fieldNames: ['model', 'brand', 'status', 'size', 'condition', 'price_paid', 'description'],
        authErrorMsg: errorMsg,
        defaultValues: {
            model: sneakerToAdd?.model || '',
            brand: sneakerToAdd?.brand || SneakerBrand.null,
            status: sneakerToAdd?.status || SneakerStatus.null,
            size: sneakerToAdd?.size || '',
            condition: sneakerToAdd?.condition || '',
            price_paid: sneakerToAdd?.price_paid || '',
            description: sneakerToAdd?.description || '',
            images: sneakerToAdd?.images || [],
        },
        onSubmit: async (data) => {
            setSneakerToAdd({
                ...data,
                images: sneakerToAdd?.images || []
            });
        },
    });
    
    useFormValidation(control, watch, reset, trigger, getFieldError);

    useEffect(() => {
        const subscription = watch((value) => {
            const currentSneakerToAdd = useModalStore.getState().sneakerToAdd;
            if (currentSneakerToAdd) {
                setSneakerToAdd({
                    ...currentSneakerToAdd,
                    ...value,
                    images: currentSneakerToAdd.images
                });
            }
        });
        
        return () => subscription.unsubscribe();
    }, [watch, setSneakerToAdd]);

    useEffect(() => {
        const currentSneakerToAdd = useModalStore.getState().sneakerToAdd;
        if (currentSneakerToAdd) {
            reset({
                model: currentSneakerToAdd.model || '',
                brand: currentSneakerToAdd.brand || SneakerBrand.null,
                status: currentSneakerToAdd.status || SneakerStatus.null,
                size: currentSneakerToAdd.size || '',
                condition: currentSneakerToAdd.condition || '',
                price_paid: currentSneakerToAdd.price_paid || '',
                description: currentSneakerToAdd.description || '',
                images: currentSneakerToAdd.images || [],
            });
        }
    }, [reset]);

    const handleEditImages = () => {
        setModalStep('addFormImages');
    };

    return (
        <KeyboardAwareScrollView
            ref={scrollViewRef}
            className='flex-1'
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
                            <MaterialIcons name="edit" size={16} color="#666" />
                            <Text className="font-open-sans text-sm text-gray-600">
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

                {/* Formulaire */}
                <FormFields
                    control={control}
                    displayedError={displayedError}
                    handleFieldFocus={handleFieldFocus}
                    validateFieldOnBlur={validateFieldOnBlur}
                    getFieldError={getFieldErrorWrapper}
                    modelInputRef={modelInputRef}
                    brandInputRef={brandInputRef}
                    sizeInputRef={sizeInputRef}
                    pricePaidInputRef={pricePaidInputRef}
                    descriptionInputRef={descriptionInputRef}
                />
            </View>
        </KeyboardAwareScrollView>
    );
}; 