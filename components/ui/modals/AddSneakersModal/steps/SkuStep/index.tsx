import { View, Text, TextInput, KeyboardAvoidingView, ScrollView, Platform, Pressable } from 'react-native';
import { Link } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { ModalStep } from '../../types';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import { useSneakerForm } from '../../hooks/useSneakerForm';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/Sneaker';

interface SkuStepProps {
    setModalStep: (step: ModalStep) => void;
    closeModal: () => void;
    setSneaker: (sneaker: Sneaker | null) => void;
}

export const SkuStep = ({ setModalStep, closeModal, setSneaker }: SkuStepProps) => {
    const { sessionToken } = useSession();
    const { 
        sneakerSKU, 
        setSneakerSKU,
        errorMsg,
        setErrorMsg,
        isSneakerSKUError,
        isSneakerSKUFocused,
        handleInputFocus,
        handleInputBlur,
    } = useSneakerForm();

    const { fetchSkuSneakerData } = useSneakerAPI(sessionToken || null);

    const handleNext = async () => {
        try {
            const data = await fetchSkuSneakerData(sneakerSKU);
            if (data.results && data.results.length > 0) {
                const sneakerData = data.results[0];
                // TODO: Set form data with fetched sneaker data
                setModalStep('noBox');
            } else {
                setErrorMsg('No data found for this SKU, check the SKU or add it manually.');
            }
        } catch (error) {
            setErrorMsg('Impossible to find the informations for this SKU. Please check the SKU or add it manually.');
            console.error('Error when fetching SKU data:', error);
        }
    };

    return (
        <View className="flex-1 justify-between items-center gap-8">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
                className="flex-1 w-full"
            >
                <ScrollView 
                    className="flex-1"
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 w-full justify-center items-center gap-12 pt-10">
                        <View className="flex-row items-center">
                            <Text className="font-spacemono-bold text-xl text-center px-6">
                                Put you sneakers SKU below
                            </Text>
                            <Link href="https://www.wikihow.com/Find-Model-Numbers-on-Nike-Shoes" 
                                className="flex-row justify-center items-center gap-2">
                                <FontAwesome6 name="lightbulb" size={20} color="#F27329" />
                            </Link>
                        </View>
                        <Text className="font-spacemono-bold text-sm text-center px-6">
                            NB : For Nike sneakers dont forget the "-" and the 3 numbers following it or it will not work.
                        </Text>
                        <View className="flex items-center w-full gap-2">
                            <TextInput
                                className={`bg-white rounded-md p-2 w-3/5 font-spacemono-bold ${
                                    isSneakerSKUError ? 'border-2 border-red-500' : ''
                                } ${isSneakerSKUFocused ? 'border-2 border-primary' : ''}`}
                                placeholder="SKU"
                                onFocus={() => handleInputFocus('sku')}
                                onBlur={() => handleInputBlur('sku', sneakerSKU)}
                                placeholderTextColor="gray"
                                value={sneakerSKU}
                                onChangeText={setSneakerSKU}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <View className="justify-end items-start w-full pb-5">
                <View className="flex-row justify-between w-full">
                    <BackButton 
                        onPressAction={() => setModalStep('index')} 
                    />
                    <NextButton
                        content="Next"
                        onPressAction={handleNext}
                    />
                </View>
            </View>
        </View>
    );
};
