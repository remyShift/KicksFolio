import { View, Text, TextInput, KeyboardAvoidingView, ScrollView, Platform, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { ModalStep } from '../../types';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import DeleteButton from '@/components/ui/buttons/DeleteButton';
import DropdownInput from '@/components/ui/inputs/DropDownInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useSneakerForm } from '../../hooks/useSneakerForm';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useSneakerValidation } from '../../hooks/useSneakerValidation';
import { useSession } from '@/context/authContext';
import { BRANDS, STATUS } from '../../constants';
import { Sneaker } from '@/types/Sneaker';

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

    const { validateAllFields } = useSneakerValidation();
    const { handleSneakerSubmit, handleSneakerDelete, isLoading } = useSneakerAPI(sessionToken || null);

    const currentSneakerId = userSneakers ? userSneakers.find((s: Sneaker) => s.id === sneaker?.id)?.id : null;
    const isNewSneaker = !currentSneakerId;

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need permissions to access your photos!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setSneakerImage(result.assets[0].uri);
        } else {
            setSneakerImage('');
            setIsSneakerImageError(true);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need permissions to access your camera!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSneakerImage(result.assets[0].uri);
        } else {
            setSneakerImage('');
            setIsSneakerImageError(true);
        }
    };

    const handleSubmit = async () => {
        const isValid = validateAllFields(
            sneakerName, 
            sneakerBrand, 
            sneakerSize,
            sneakerCondition,
            sneakerStatus, 
            sneakerImage,
            setErrorMsg, 
            setIsSneakerNameError, 
            setIsSneakerBrandError, 
            setIsSneakerSizeError, 
            setIsSneakerConditionError, 
            setIsSneakerStatusError,
            setIsSneakerImageError
        );

        if (!isValid) return;

        try {
            const formData = {
                image: sneakerImage,
                model: sneakerName,
                brand: sneakerBrand,
                size: Number(sneakerSize),
                condition: Number(sneakerCondition),
                status: sneakerStatus,
                userId: user?.id || '',
                price_paid: Number(sneakerPricePaid),
                purchase_date: '',
                description: sneakerDescription,
                estimated_value: 0,
            };

            await handleSneakerSubmit(formData, currentSneakerId || null);
            await getUserSneakers();
            resetForm();
            closeModal();
        } catch (error) {
            setErrorMsg('Something went wrong when submitting the sneaker, please try again.');
        }
    };

    const handleDelete = async () => {
        if (!currentSneakerId || !user?.id) return;

        Alert.alert('Delete sneaker', 'Are you sure you want to delete this sneaker ?', [
            {
                text: 'Cancel',
                style: 'cancel'
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await handleSneakerDelete(currentSneakerId, user.id);
                        const updatedSneakers = userSneakers ? userSneakers.filter(s => s.id !== currentSneakerId) : [];
                        setUserSneakers(updatedSneakers);
                        resetForm();
                        closeModal();
                    } catch (error) {
                        setErrorMsg(`Une erreur est survenue lors de la suppression: ${error}`);
                    }
                }
            }
        ]);
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
                    <Pressable
                        onPress={() => {
                            Alert.alert(
                                'Add a photo',
                                'Make sure the sneaker is in the center of the image.',
                                [
                                    {
                                        text: 'Take a photo',
                                        onPress: takePhoto
                                    },
                                    {
                                        text: 'Choose from gallery',
                                        onPress: pickImage
                                    },
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    }
                                ]
                            );
                        }}
                        className={`bg-gray-400 rounded-md h-48 w-full flex items-center justify-center ${
                            isSneakerImageError ? 'border-2 border-red-500' : ''
                        } ${isSneakerImageFocused ? 'border-2 border-primary' : ''}`}
                    >
                        {sneakerImage ? (
                            <Image
                                source={{ uri: sneakerImage }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 3
                                }}
                                contentFit="cover"
                                contentPosition="center"
                                cachePolicy="memory-disk"
                            />
                        ) : (
                            <MaterialIcons name="add-a-photo" size={30} color="white" />
                        )}
                    </Pressable>

                    <View className="flex flex-col gap-6 mt-2">
                        <View className="flex flex-col gap-4 w-4/5">
                            <View className='flex flex-col gap-2 w-full justify-center'>
                                <ErrorMsg content={errorMsg} display={errorMsg !== ''}/>
                                <TextInput 
                                    className={`bg-white rounded-md p-2 w-full font-spacemono-bold ${
                                        isSneakerNameError ? 'border-2 border-red-500' : ''
                                    } ${isSneakerNameFocused ? 'border-2 border-primary' : ''}`} 
                                    placeholder="Air Max 1"
                                    placeholderTextColor='gray'
                                    value={sneakerName}
                                    onChangeText={setSneakerName}
                                    onFocus={() => handleInputFocus('name')}
                                    onBlur={() => handleInputBlur('name', sneakerName)}
                                />
                            </View>

                            <DropdownInput
                                value={sneakerBrand}
                                onSelect={(value) => {
                                    setSneakerBrand(value);
                                    handleInputBlur('brand', value);
                                }}
                                options={BRANDS}
                                placeholder="Select a brand"
                                isError={isSneakerBrandError}
                                onOpen={() => handleInputFocus('brand')}
                            />

                            <DropdownInput
                                value={sneakerStatus}
                                onSelect={(value) => {
                                    setSneakerStatus(value);
                                    handleInputBlur('status', value);
                                }}
                                options={STATUS}
                                placeholder="Select a status"
                                isError={isSneakerStatusError}
                                onOpen={() => handleInputFocus('status')}
                            />
                        </View>

                        <View className="flex-row items-center w-full border-t-2 border-gray-300">
                            <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                                <Text className='font-spacemono text-center'>Size (US)</Text>
                                <View className="w-4/5">
                                    <TextInput
                                        className={`bg-white rounded-md p-2 w-full font-spacemono-bold relative ${
                                            isSneakerSizeError ? 'border-2 border-red-500' : ''
                                        } ${isSneakerSizeFocused ? 'border-2 border-primary' : ''}`} 
                                        placeholder="9.5"
                                        inputMode='decimal'
                                        keyboardType='decimal-pad'
                                        maxLength={4}
                                        autoComplete='off'
                                        placeholderTextColor='gray'
                                        value={sneakerSize ? String(sneakerSize) : ''}
                                        onChangeText={(text) => {
                                            const formattedText = text.replace(',', '.');
                                            if (formattedText === '' || !isNaN(Number(formattedText))) {
                                                setSneakerSize(formattedText);
                                            }
                                        }}
                                        onFocus={() => handleInputFocus('size')}
                                        onBlur={() => handleInputBlur('size', String(sneakerSize))}
                                    />
                                </View>
                            </View>

                            <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                                <Text className='font-spacemono text-center'>Price Paid</Text>
                                <View className="w-4/5">
                                    <TextInput
                                        className={`bg-white rounded-md p-2 w-full font-spacemono-bold relative ${
                                            isPricePaidError ? 'border-2 border-red-500' : ''
                                        } ${isPricePaidFocused ? 'border-2 border-primary' : ''}`} 
                                        placeholder="150"
                                        inputMode='decimal'
                                        keyboardType='decimal-pad'
                                        autoComplete='off'
                                        placeholderTextColor='gray'
                                        value={sneakerPricePaid ? String(sneakerPricePaid) : ''}
                                        onChangeText={(text) => {
                                            const formattedText = text.replace(',', '.');
                                            if (formattedText === '' || !isNaN(Number(formattedText))) {
                                                setSneakerPricePaid(formattedText);
                                            }
                                        }}
                                        onFocus={() => handleInputFocus('pricePaid')}
                                        onBlur={() => handleInputBlur('pricePaid', String(sneakerPricePaid))}
                                    />
                                </View>
                            </View>

                            <View className='flex-col items-center p-2 gap-1 w-1/3'>
                                <Text className='font-spacemono text-center'>Condition</Text>
                                <View className="w-4/5">
                                    <TextInput
                                        className={`bg-white rounded-md p-2 w-full font-spacemono-bold relative ${
                                            isSneakerConditionError ? 'border-2 border-red-500' : ''
                                        } ${isSneakerConditionFocused ? 'border-2 border-primary' : ''}`} 
                                        placeholder="0 - 10"
                                        inputMode='decimal'
                                        keyboardType='decimal-pad'
                                        maxLength={3}
                                        autoComplete='off'
                                        placeholderTextColor='gray'
                                        value={sneakerCondition ? String(sneakerCondition) : ''}
                                        onChangeText={(text) => {
                                            const formattedText = text.replace(',', '.');
                                            if (formattedText === '' || !isNaN(Number(formattedText))) {
                                                setSneakerCondition(formattedText);
                                            }
                                        }}
                                        onFocus={() => handleInputFocus('condition')}
                                        onBlur={() => handleInputBlur('condition', String(sneakerCondition))}
                                    />
                                </View>
                            </View>
                        </View>

                        <View className="flex-1 items-center w-full">
                            <View className="relative w-full">
                                <TextInput
                                    className={`bg-white rounded-md p-2 w-full font-spacemono-bold pr-10`}
                                    value={sneakerDescription}
                                    onChangeText={setSneakerDescription}
                                    placeholder="Description"
                                    placeholderTextColor='gray'
                                    multiline={true}
                                    textAlignVertical="top"
                                    style={{
                                        minHeight: 60,
                                        maxHeight: 80
                                    }}
                                />
                                <Pressable 
                                    className="absolute right-2 top-2"
                                    onPress={() => setSneakerDescription('')}
                                >
                                    <MaterialIcons name="delete" size={24} color="gray" />
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <View className="flex-1 justify-end pb-4">
                        <View className="flex-row justify-between w-full">
                            <View className="flex-row gap-3">
                                <BackButton 
                                    onPressAction={() => {
                                        if (!isNewSneaker) {
                                            resetForm();
                                            closeModal();
                                        }
                                        setModalStep('index');
                                    }} 
                                />

                                {!isNewSneaker && (
                                    <DeleteButton 
                                        onPressAction={handleDelete}
                                    />
                                )}
                            </View>
                            <NextButton
                                content="Add"
                                onPressAction={handleSubmit}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
