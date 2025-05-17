import { View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { ModalStep } from '../../types';
import { useSneakerForm } from '../../hooks/useSneakerForm';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useSneakerValidation } from '../../hooks/useSneakerValidation';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/Sneaker';
import { ImageUploader } from './components/ImageUploader';
import { FormFields } from './components/FormFields';
import { ActionButtons } from './components/ActionButtons';
import ErrorMsg from '@/components/ui/text/ErrorMsg';

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
    setSneaker,
    userSneakers,
    setUserSneakers
}: FormStepProps) => {
    const { user, sessionToken, getUserSneakers } = useSession();
    const { 
        sneakerName, setSneakerName,
        sneakerBrand, setSneakerBrand,
        sneakerStatus, setSneakerStatus,
        sneakerSize, setSneakerSize,
        sneakerCondition, setSneakerCondition,
        sneakerImage, setSneakerImage,
        sneakerPricePaid, setSneakerPricePaid,
        sneakerDescription, setSneakerDescription,
        errorMsg, setErrorMsg,
        isSneakerNameError, setIsSneakerNameError,
        isSneakerBrandError, setIsSneakerBrandError,
        isSneakerStatusError, setIsSneakerStatusError,
        isSneakerSizeError, setIsSneakerSizeError,
        isSneakerConditionError, setIsSneakerConditionError,
        isPricePaidError, setIsPricePaidError,
        isSneakerImageError, setIsSneakerImageError,
        isSneakerNameFocused, setIsSneakerNameFocused,
        isSneakerBrandFocused, setIsSneakerBrandFocused,
        isSneakerStatusFocused, setIsSneakerStatusFocused,
        isSneakerSizeFocused, setIsSneakerSizeFocused,
        isSneakerConditionFocused, setIsSneakerConditionFocused,
        isPricePaidFocused, setIsPricePaidFocused,
        isSneakerImageFocused, setIsSneakerImageFocused,
        handleInputFocus,
        handleInputBlur,
        resetForm,
    } = useSneakerForm();

    const { validateSneakerForm } = useSneakerValidation();
    const { handleSneakerSubmit } = useSneakerAPI(sessionToken || null);

    const currentSneakerId = userSneakers ? userSneakers.find((s: Sneaker) => s.id === sneaker?.id)?.id : null;
    const isNewSneaker = !currentSneakerId;

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

        handleSneakerSubmit(formData, currentSneakerId || null)
            .then(() => getUserSneakers())
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
                        isError={isSneakerImageError}
                        isFocused={isSneakerImageFocused}
                        setIsError={setIsSneakerImageError}
                    />

                    <FormFields
                        sneakerName={sneakerName}
                        setSneakerName={setSneakerName}
                        sneakerBrand={sneakerBrand}
                        setSneakerBrand={setSneakerBrand}
                        sneakerStatus={sneakerStatus}
                        setSneakerStatus={setSneakerStatus}
                        sneakerSize={sneakerSize}
                        setSneakerSize={setSneakerSize}
                        sneakerCondition={sneakerCondition}
                        setSneakerCondition={setSneakerCondition}
                        sneakerPricePaid={sneakerPricePaid}
                        setSneakerPricePaid={setSneakerPricePaid}
                        sneakerDescription={sneakerDescription}
                        setSneakerDescription={setSneakerDescription}
                        isSneakerNameError={isSneakerNameError}
                        setIsSneakerNameError={setIsSneakerNameError}
                        isSneakerBrandError={isSneakerBrandError}
                        setIsSneakerBrandError={setIsSneakerBrandError}
                        isSneakerStatusError={isSneakerStatusError}
                        setIsSneakerStatusError={setIsSneakerStatusError}
                        isSneakerSizeError={isSneakerSizeError}
                        setIsSneakerSizeError={setIsSneakerSizeError}
                        isSneakerConditionError={isSneakerConditionError}
                        setIsSneakerConditionError={setIsSneakerConditionError}
                        isPricePaidError={isPricePaidError}
                        setIsPricePaidError={setIsPricePaidError}
                        isSneakerNameFocused={isSneakerNameFocused}
                        setIsSneakerNameFocused={setIsSneakerNameFocused}
                        isSneakerBrandFocused={isSneakerBrandFocused}
                        setIsSneakerBrandFocused={setIsSneakerBrandFocused}
                        isSneakerStatusFocused={isSneakerStatusFocused}
                        setIsSneakerStatusFocused={setIsSneakerStatusFocused}
                        isSneakerSizeFocused={isSneakerSizeFocused}
                        setIsSneakerSizeFocused={setIsSneakerSizeFocused}
                        isSneakerConditionFocused={isSneakerConditionFocused}
                        setIsSneakerConditionFocused={setIsSneakerConditionFocused}
                        isPricePaidFocused={isPricePaidFocused}
                        setIsPricePaidFocused={setIsPricePaidFocused}
                        isSneakerImageFocused={isSneakerImageFocused}
                        setIsSneakerImageFocused={setIsSneakerImageFocused}
                        handleInputFocus={handleInputFocus}
                        handleInputBlur={handleInputBlur}
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