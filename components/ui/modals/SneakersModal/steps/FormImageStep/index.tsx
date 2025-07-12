import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/useFormController';
import { createSneakerSchema, SneakerFormData } from '@/validation/schemas';
import { Controller } from 'react-hook-form';
import { Photo } from '@/types/Sneaker';
import { SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import { useTranslation } from 'react-i18next';
import { PhotoCarousel } from '@/components/ui/images/photoCaroussel/PhotoCarousel';
import ErrorMsg from '@/components/ui/text/ErrorMsg';

export const FormImageStep = () => {
    const { t } = useTranslation();
    
    const { 
        fetchedSneaker, 
        setFetchedSneaker, 
        sneakerToAdd, 
        setSneakerToAdd, 
        errorMsg, 
        setEstimatedValue, 
        setGender, 
        setSku 
    } = useModalStore();
    
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
            
            const formData: SneakerFormData = {
                model: fetchedSneaker.model || '',
                brand: fetchedSneaker.brand as SneakerBrand,
                status: SneakerStatus.null,
                size: '',
                condition: '',
                price_paid: '',
                description: fetchedSneaker.description || '',
                images: imageData,
            };
            
            reset(formData);
            setSneakerToAdd(formData);
            setEstimatedValue(fetchedSneaker.estimated_value);
            setGender(fetchedSneaker.gender || null);
            setSku(fetchedSneaker.sku);
            
            setFetchedSneaker(null);
        }
    }, [fetchedSneaker]);

    useEffect(() => {
        const subscription = watch((value) => {
            if (value.images) {
                const currentSneakerToAdd = useModalStore.getState().sneakerToAdd;
                const currentData = currentSneakerToAdd || {
                    model: '',
                    brand: SneakerBrand.null,
                    status: SneakerStatus.null,
                    size: '',
                    condition: '',
                    price_paid: '',
                    description: '',
                    images: [],
                };
                
                setSneakerToAdd({
                    ...currentData,
                    images: value.images
                });
            }
        });
        
        return () => subscription.unsubscribe();
    }, [watch, setSneakerToAdd]);

    // Initialiser le formulaire avec les images existantes quand on revient à cette étape
    useEffect(() => {
        const currentSneakerToAdd = useModalStore.getState().sneakerToAdd;
        if (currentSneakerToAdd && currentSneakerToAdd.images) {
            reset({
                model: currentSneakerToAdd.model || '',
                brand: currentSneakerToAdd.brand || SneakerBrand.null,
                status: currentSneakerToAdd.status || SneakerStatus.null,
                size: currentSneakerToAdd.size || '',
                condition: currentSneakerToAdd.condition || '',
                price_paid: currentSneakerToAdd.price_paid || '',
                description: currentSneakerToAdd.description || '',
                images: currentSneakerToAdd.images,
            });
        }
    }, [reset]);

    const imageError = getFieldErrorWrapper('images');

    return (
        <View className="flex-1 p-4">
            <View className="mb-6">
                <Text className="font-spacemono-bold text-xl text-center mb-2">
                    {t('collection.modal.titles.addImages')}
                </Text>
                <Text className="font-spacemono text-center text-gray-600">
                    {t('collection.modal.descriptions.addImages')}
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