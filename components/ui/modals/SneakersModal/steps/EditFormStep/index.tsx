import { ScrollView, TextInput, View, Text, Pressable, Image } from 'react-native';
import { useRef, useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/useFormController';
import { createSneakerSchema, SneakerFormData } from '@/validation/schemas';
import { FormFields } from '../../shared/FormFields';
import { useFormValidation } from '../../hooks/useFormValidation';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import { useSizeConversion } from '@/hooks/useSizeConversion';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Photo } from '@/types/Sneaker';

export const EditFormStep = () => {
    const { t } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);
    const modelInputRef = useRef<TextInput>(null);
    const brandInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const pricePaidInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    
    const { currentSneaker, sneakerToAdd, setSneakerToAdd, errorMsg, setModalStep } = useModalStore();
    const { getSizeForCurrentUnit } = useSizeConversion();
    
    const displaySize = currentSneaker ? getSizeForCurrentUnit(currentSneaker) : 0;

    const handleEditImages = () => {
        setModalStep('editFormImages');
    };



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
        fieldNames: ['model', 'brand', 'status', 'size', 'condition', 'price_paid', 'images'],
        authErrorMsg: errorMsg,
        defaultValues: {
            model: currentSneaker?.model || '',
            brand: currentSneaker?.brand !== SneakerBrand.null ? currentSneaker?.brand : undefined,
            status: currentSneaker?.status !== SneakerStatus.null ? currentSneaker?.status : undefined,
            size: displaySize.toString(),
            condition: currentSneaker?.condition ? String(currentSneaker.condition) : '',
            price_paid: currentSneaker?.price_paid ? String(currentSneaker.price_paid) : '',
            description: currentSneaker?.description || '',
            og_box: currentSneaker?.og_box || false,
            ds: currentSneaker?.ds || false,
            is_women: currentSneaker?.gender === 'women' || false,
            images: sneakerToAdd?.images || currentSneaker?.images || [],
        },
        onSubmit: async (data) => {            
            const updatedSneaker = {
                model: data.model,
                brand: data.brand,
                status: data.status,
                size: data.size,
                condition: data.condition,
                price_paid: data.price_paid,
                description: data.description || '',
                og_box: data.og_box || false,
                ds: data.ds || false,
                is_women: data.is_women || false,
                images: sneakerToAdd?.images || currentSneaker?.images || [],
            } as SneakerFormData;

            setSneakerToAdd(updatedSneaker);
        },
    });

    useFormValidation(watch, reset, trigger, getFieldError, getValues);

    useEffect(() => {
        if (currentSneaker) {
            const initData = {
                model: currentSneaker.model || '',
                brand: currentSneaker.brand || '',
                status: currentSneaker.status || '',
                size: displaySize.toString(),
                condition: currentSneaker.condition.toString() || '',
                price_paid: currentSneaker.price_paid?.toString() || '',
                description: currentSneaker.description || '',
                og_box: currentSneaker.og_box || false,
                ds: currentSneaker.ds || false,
                images: sneakerToAdd?.images || currentSneaker.images || [],
            };
            
            reset(initData as SneakerFormData);
            
            if (!sneakerToAdd) {
                setSneakerToAdd(initData as SneakerFormData);
            }
        }
    }, [currentSneaker, displaySize, reset]);



    useEffect(() => {
        return () => {
            setSneakerToAdd(null);
        };
    }, []);

    if (!currentSneaker) return null;

    const displayImages = sneakerToAdd?.images || currentSneaker.images || [];

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
                            <MaterialIcons name="edit" size={16} color="#F27329" />
                            <Text className="font-open-sans-bold text-sm text-primary">
                                {t('collection.modal.buttons.editImages')}
                            </Text>
                        </Pressable>
                    </View>
                    
                    {displayImages.length > 0 ? (
                        <View className="flex-row gap-2">
                            {displayImages.map((image: Photo, index: number) => (
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
                    handleFieldFocus={handleFieldFocus}
                    validateFieldOnBlur={validateFieldOnBlur}
                    getFieldError={getFieldErrorWrapper}
                    modelInputRef={modelInputRef as React.RefObject<TextInput>}
                    brandInputRef={brandInputRef as React.RefObject<TextInput>}
                    sizeInputRef={sizeInputRef as React.RefObject<TextInput>}
                    pricePaidInputRef={pricePaidInputRef as React.RefObject<TextInput>}
                    descriptionInputRef={descriptionInputRef as React.RefObject<TextInput>}
                    displayedError={typeof displayedError === 'string' ? displayedError : ''}
                    sneakerId={currentSneaker?.id}
                    setValue={setValue}
                />
            </View>
        </KeyboardAwareScrollView>
    );
}; 