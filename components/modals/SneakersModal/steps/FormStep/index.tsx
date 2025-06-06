import { View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useSneakerValidation } from '../../hooks/useSneakerValidation';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/Sneaker';
import { ImageUploader } from './components/ImageUploader';
import { FormFields } from './components/FormFields';
import { ActionButtons } from './components/ActionButtons';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useState, useRef } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { SneakerFormData } from '../../types';

interface FormStepProps {
    sneaker: Sneaker | null;
    setSneaker: (sneaker: Sneaker | null) => void;
    userSneakers: Sneaker[] | null;
    setUserSneakers: (sneakers: Sneaker[] | null) => void;
    errorMsg: string;
}

export const FormStep = ({ 
    sneaker, 
    setSneaker,
    userSneakers,
    setUserSneakers,
    errorMsg
}: FormStepProps) => {
    const { user, sessionToken } = useSession();
    const { setModalStep, setIsVisible } = useModalStore();
    const scrollViewRef = useRef<ScrollView>(null);
    
    const [sneakerName, setSneakerName] = useState(sneaker?.model || '');
    const [sneakerBrand, setSneakerBrand] = useState(sneaker?.brand || '');
    const [sneakerStatus, setSneakerStatus] = useState(sneaker?.status || '');
    const [sneakerSize, setSneakerSize] = useState(sneaker?.size?.toString() || '');
    const [sneakerCondition, setSneakerCondition] = useState(sneaker?.condition?.toString() || '');
    const [sneakerImage, setSneakerImage] = useState(sneaker?.images?.[0]?.url || '');
    const [sneakerPricePaid, setSneakerPricePaid] = useState(sneaker?.price_paid?.toString() || '');
    const [sneakerDescription, setSneakerDescription] = useState(sneaker?.description || '');
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

    const { validateSneakerForm } = useSneakerValidation();
    const { handleSneakerSubmit } = useSneakerAPI(sessionToken || null, user?.collection?.id);

    const currentSneakerId = userSneakers ? userSneakers.find((s: Sneaker) => s.id === sneaker?.id)?.id : null;
    const isNewSneaker = !currentSneakerId;

    const resetForm = () => {
        setSneakerName('');
        setSneakerBrand('');
        setSneakerStatus('');
        setSneakerSize('');
        setSneakerCondition('');
        setSneakerImage('');
        setSneakerPricePaid('');
        setSneakerDescription('');
        setFieldErrors({});
    };

    const handleFieldError = (field: string, error: string) => {
        setFieldErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    const handleSubmit = () => {
        const formData: SneakerFormData = {
            model: sneakerName,
            brand: sneakerBrand,
            status: sneakerStatus,
            size: sneakerSize,
            condition: sneakerCondition,
            images: sneakerImage ? [{ url: sneakerImage }] : [],
            price_paid: sneakerPricePaid,
            description: sneakerDescription
        };

        const validation = validateSneakerForm(formData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            return;
        }

        const sneakerData: Partial<Sneaker> = {
            id: currentSneakerId || undefined,
            model: formData.model,
            brand: formData.brand,
            status: formData.status,
            size: Number(formData.size),
            condition: Number(formData.condition),
            images: formData.images.map(img => ({ id: '', url: img.url })),
            price_paid: Number(formData.price_paid),
            description: formData.description,
            collection_id: user?.collection?.id || '',
            purchase_date: new Date().toISOString(),
            estimated_value: 0,
            release_date: null
        };

        handleSneakerSubmit(sneakerData, user?.id!)
            .then((response) => {
                if (response) {
                    const updatedSneakers = userSneakers ? [...userSneakers, response] : [response];
                    setUserSneakers(updatedSneakers);
                    setSneaker(response);
                    setModalStep('view');
                }
            })
            .catch((error) => {
                setFieldErrors({ submit: error.message });
            });
    };

    return (
        <KeyboardAvoidingView 
            className="flex-1" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
        >
            <ScrollView 
                ref={scrollViewRef}
                className='flex-1'
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                contentContainerStyle={{ minHeight: '100%' }}
            >
                <View className="flex-1 h-full p-2 gap-2">
                    <ErrorMsg content={errorMsg} display={errorMsg !== ''}/>
                    
                    <ImageUploader
                        image={sneakerImage}
                        setImage={setSneakerImage}
                        isError={false}
                        isFocused={false}
                        setIsError={() => {}}
                    />

                    <FormFields
                        scrollViewRef={scrollViewRef}
                        onSneakerNameChange={setSneakerName}
                        onSneakerBrandChange={setSneakerBrand}
                        onSneakerStatusChange={setSneakerStatus}
                        onSneakerSizeChange={setSneakerSize}
                        onSneakerPricePaidChange={setSneakerPricePaid}
                        onSneakerConditionChange={setSneakerCondition}
                        onSneakerDescriptionChange={setSneakerDescription}
                        onErrorChange={handleFieldError}
                        initialValues={{
                            sneakerName,
                            sneakerBrand,
                            sneakerStatus,
                            sneakerSize,
                            sneakerPricePaid,
                            sneakerCondition,
                            sneakerDescription
                        }}
                    />

                    <ActionButtons
                        isNewSneaker={isNewSneaker}
                        onBack={() => {
                            if (!isNewSneaker) {
                                resetForm();
                                setIsVisible(false);
                            }
                            setModalStep('index');
                        }}
                        onSubmit={handleSubmit}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};