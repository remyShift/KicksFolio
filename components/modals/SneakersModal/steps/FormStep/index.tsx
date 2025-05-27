import { View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { ModalStep } from '../../types';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useSneakerValidation } from '../../hooks/useSneakerValidation';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/Sneaker';
import { ImageUploader } from './components/ImageUploader';
import { FormFields } from './components/FormFields';
import { ActionButtons } from './components/ActionButtons';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useState, useRef } from 'react';

interface FormStepProps {
    setModalStep: (step: ModalStep) => void;
    closeModal: () => void;
    sneaker: Sneaker | null;
    setSneaker: (sneaker: Sneaker | null) => void;
    userSneakers: Sneaker[] | null;
    setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export const FormStep = ({ 
    setModalStep, 
    closeModal, 
    sneaker, 
    userSneakers
}: FormStepProps) => {
    const { user, sessionToken } = useSession();
    const scrollViewRef = useRef<ScrollView>(null);
    
    const [sneakerName, setSneakerName] = useState(sneaker?.model || '');
    const [sneakerBrand, setSneakerBrand] = useState(sneaker?.brand || '');
    const [sneakerStatus, setSneakerStatus] = useState(sneaker?.status || '');
    const [sneakerSize, setSneakerSize] = useState(sneaker?.size?.toString() || '');
    const [sneakerCondition, setSneakerCondition] = useState(sneaker?.condition?.toString() || '');
    const [sneakerImage, setSneakerImage] = useState(sneaker?.images?.[0]?.url || '');
    const [sneakerPricePaid, setSneakerPricePaid] = useState(sneaker?.price_paid?.toString() || '');
    const [sneakerDescription, setSneakerDescription] = useState(sneaker?.description || '');
    const [errorMsg, setErrorMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

    const { validateSneakerForm } = useSneakerValidation();
    const { handleSneakerSubmit } = useSneakerAPI(sessionToken || null);

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
        setErrorMsg('');
        setFieldErrors({});
    };

    const handleFieldError = (field: string, error: string) => {
        setFieldErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    const handleSubmit = () => {
        const isValid = validateSneakerForm({
            model: sneakerName,
            brand: sneakerBrand,
            size: Number(sneakerSize),
            condition: Number(sneakerCondition),
            status: sneakerStatus,
            image: sneakerImage,
            userId: user?.id || '',
            price_paid: Number(sneakerPricePaid),
            purchase_date: '',
            description: sneakerDescription,
            estimated_value: 0,
        });

        if (!isValid) return;

        const formData = {
            id: currentSneakerId || '',
            model: sneakerName,
            brand: sneakerBrand,
            size: Number(sneakerSize),
            condition: Number(sneakerCondition),
            status: sneakerStatus,
            image: sneakerImage,
            collection_id: user?.collection?.id || '',
            price_paid: Number(sneakerPricePaid),
            purchase_date: '',
            description: sneakerDescription,
            estimated_value: 0,
            release_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            images: [{
                id: '',
                url: sneakerImage
            }]
        };

        handleSneakerSubmit(formData, currentSneakerId || null, user?.id || '')
            .then(() => {
                resetForm();
                closeModal();
            })
            .catch(() => {
                setErrorMsg('An error occurred while submitting the sneaker, please try again.');
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
                                closeModal();
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