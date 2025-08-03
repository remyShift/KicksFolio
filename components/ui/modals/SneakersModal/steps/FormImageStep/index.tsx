import { View, Text } from 'react-native';
import { useEffect, useMemo, useCallback } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/TODO/useFormController';
import { createSneakerSchema, SneakerFormData } from '@/validation/schemas';
import { Controller } from 'react-hook-form';
import { Photo } from '@/types/Sneaker';
import { SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import { useTranslation } from 'react-i18next';
import { PhotoCarousel } from '@/components/ui/images/photoCaroussel/PhotoCarousel';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useSizeConversion } from '@/hooks/TODO/useSizeConversion';

export const FormImageStep = () => {
    const { t } = useTranslation();
    const { getSizeForCurrentUnit } = useSizeConversion();
    
    const { 
        fetchedSneaker, 
        setFetchedSneaker, 
        sneakerToAdd, 
        setSneakerToAdd, 
        errorMsg, 
        setEstimatedValue, 
        setGender, 
        setSku,
        currentSneaker,
        modalStep
    } = useModalStore();
    
    const isEditMode = modalStep === 'editFormImages';
    
    const currentSneakerSize = useMemo(() => {
        return currentSneaker ? getSizeForCurrentUnit(currentSneaker).toString() : '';
    }, [currentSneaker, getSizeForCurrentUnit]);
    
    const handleSneakerToAddUpdate = useCallback((newData: SneakerFormData) => {
        const currentState = useModalStore.getState().sneakerToAdd;
        if (JSON.stringify(currentState) !== JSON.stringify(newData)) {
            setSneakerToAdd(newData);
        }
    }, [setSneakerToAdd]);
    
    const {
        control,
        reset,
        watch,
        displayedError,
        getFieldErrorWrapper,
    } = useFormController<SneakerFormData>({
        schema: createSneakerSchema(),
        fieldNames: ['images'],
        authErrorMsg: errorMsg,
        defaultValues: {
            model: sneakerToAdd?.model || currentSneaker?.model || '',
            brand: sneakerToAdd?.brand || currentSneaker?.brand || SneakerBrand.Nike,
            status: sneakerToAdd?.status || currentSneaker?.status || SneakerStatus.Stocking,
            size: sneakerToAdd?.size || currentSneakerSize,
            condition: sneakerToAdd?.condition || (currentSneaker?.condition?.toString()) || '',
            price_paid: sneakerToAdd?.price_paid || (currentSneaker?.price_paid?.toString()) || '',
            description: sneakerToAdd?.description || currentSneaker?.description || '',
            og_box: sneakerToAdd?.og_box || currentSneaker?.og_box || false,
            ds: sneakerToAdd?.ds || currentSneaker?.ds || false,
            is_women: sneakerToAdd?.is_women || (currentSneaker?.gender === 'women') || false,
            images: sneakerToAdd?.images || currentSneaker?.images || [],
        },
        onSubmit: async (data) => {
            setSneakerToAdd(data);
        },
    });

    useEffect(() => {
        if (fetchedSneaker) {
            const imageData: Photo[] = fetchedSneaker.image?.uri ? [{
                id: '',
                uri: fetchedSneaker.image.uri,
                alt: `${fetchedSneaker.model} from SKU search`
            }] : [];
            
            const formData = {
                model: fetchedSneaker.model || '',
                brand: fetchedSneaker.brand,
                status: SneakerStatus.Stocking,
                size: '',
                condition: '',
                price_paid: '',
                description: fetchedSneaker.description || '',
                og_box: false,
                ds: false,
                images: imageData,
            };
            
            reset(formData);
            handleSneakerToAddUpdate(formData);
            setEstimatedValue(fetchedSneaker.estimated_value);
            setGender(fetchedSneaker.gender || null);
            setSku(fetchedSneaker.sku);
            
            setFetchedSneaker(null);
        }
    }, [fetchedSneaker, reset, handleSneakerToAddUpdate, setEstimatedValue, setGender, setSku, setFetchedSneaker]);

    useEffect(() => {
        if (currentSneaker && !fetchedSneaker && isEditMode && !sneakerToAdd) {
            const currentData = {
                model: currentSneaker.model || '',
                brand: currentSneaker.brand || SneakerBrand.Nike,
                status: currentSneaker.status || SneakerStatus.Stocking,
                size: currentSneakerSize,
                condition: currentSneaker.condition?.toString() || '',
                price_paid: currentSneaker.price_paid?.toString() || '',
                description: currentSneaker.description || '',
                og_box: currentSneaker.og_box || false,
                ds: currentSneaker.ds || false,
                images: currentSneaker.images || [],
            };
            
            reset({
                ...currentData,
                images: currentSneaker.images || [],
            });
            
            handleSneakerToAddUpdate(currentData);
        }
    }, [currentSneaker, fetchedSneaker, isEditMode, sneakerToAdd, currentSneakerSize, reset, handleSneakerToAddUpdate]);

    useEffect(() => {
        const subscription = watch((value) => {
            if (value.images) {
                const currentSneakerToAdd = useModalStore.getState().sneakerToAdd;
                const currentData = currentSneakerToAdd || {
                    model: currentSneaker?.model || '',
                    brand: currentSneaker?.brand || SneakerBrand.Nike,
                    status: currentSneaker?.status || SneakerStatus.Stocking,
                    size: currentSneakerSize,
                    condition: currentSneaker?.condition?.toString() || '',
                    price_paid: currentSneaker?.price_paid?.toString() || '',
                    description: currentSneaker?.description || '',
                    og_box: currentSneaker?.og_box || false,
                    ds: currentSneaker?.ds || false,
                    images: [],
                };
                
                handleSneakerToAddUpdate({
                    ...currentData,
                    images: (value.images || []).filter((img): img is Photo => img != null && img.uri != null)
                });
            }
        });
        
        return () => subscription.unsubscribe();
    }, [watch, handleSneakerToAddUpdate, currentSneaker, currentSneakerSize]);

    useEffect(() => {
        const currentSneakerToAdd = useModalStore.getState().sneakerToAdd;
        if (currentSneakerToAdd && currentSneakerToAdd.images && currentSneakerToAdd.images.length > 0) {
            const formData = {
                model: currentSneakerToAdd.model || currentSneaker?.model || '',
                brand: currentSneakerToAdd.brand || currentSneaker?.brand || SneakerBrand.Nike,
                status: currentSneakerToAdd.status || currentSneaker?.status || SneakerStatus.Stocking,
                size: currentSneakerToAdd.size || currentSneakerSize,
                condition: currentSneakerToAdd.condition || currentSneaker?.condition?.toString() || '',
                price_paid: currentSneakerToAdd.price_paid || currentSneaker?.price_paid?.toString() || '',
                description: currentSneakerToAdd.description || currentSneaker?.description || '',
                og_box: currentSneakerToAdd.og_box || currentSneaker?.og_box || false,
                ds: currentSneakerToAdd.ds || currentSneaker?.ds || false,
                is_women: currentSneakerToAdd.is_women || (currentSneaker?.gender === 'women') || false,
                images: currentSneakerToAdd.images,
            };
            
            reset(formData);
        }
    }, [reset, currentSneaker, currentSneakerSize]);

    const imageError = getFieldErrorWrapper('images');

    return (
        <View className="flex-1 p-4">
            <View className="mb-6">
                <Text className="font-open-sans-bold text-xl text-center mb-2">
                    {currentSneaker ? t('collection.modal.titles.editImages') : t('collection.modal.titles.addImages')}
                </Text>
                <Text className="font-open-sans text-center text-gray-600">
                    {currentSneaker ? t('collection.modal.descriptions.editImages') : t('collection.modal.descriptions.addImages')}
                </Text>
            </View>

            <View className="flex-1 justify-center">
                <Controller
                    name="images"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <PhotoCarousel
                            photos={value || []}
                            height={190}
                            mode="edit"
                            onPhotosChange={onChange}
                            maxImages={3}
                        />
                    )}
                />

                {(imageError || displayedError) && (
                    <View className="mt-4">
                        <ErrorMsg 
                            content={imageError || displayedError} 
                            display={true} 
                        />
                    </View>
                )}
            </View>
        </View>
    );
}; 