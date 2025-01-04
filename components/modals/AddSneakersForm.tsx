import { Text, View, Pressable, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import BackButton from '@/components/buttons/BackButton';
import NextButton from '@/components/buttons/NextButton';
import MainButton from '@/components/buttons/MainButton';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TextInput } from 'react-native-gesture-handler';
import { useState, useRef } from 'react';
import DropdownInput from '../inputs/DropDownInput';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { handleAddSneaker } from '@/scripts/handleSneakers';
import { useSession } from '@/context/authContext';
import { checkSneakerName, checkSneakerSize, checkSneakerCondition, checkSneakerBrand, checkSneakerStatus, validateAllFields, checkPricePaid } from '@/scripts/validatesSneakersForm';
import ErrorMsg from '@/components/text/ErrorMsg';
import { Sneaker } from '@/types/Models';
import ShareButton from '../buttons/ShareButton';
import { ConditionBar } from '../ConditionBar';
import EditButton from '../buttons/EditButton';

type AddSneakersModalProps = {
    modalStep: 'index' | 'box' | 'noBox' | 'sneakerInfo';
    setModalStep: (step: 'index' | 'box' | 'noBox' | 'sneakerInfo') => void;
    closeModal: () => void;
    sneaker: Sneaker | null | undefined;
    setSneaker: (sneaker: Sneaker | null) => void;
}

type InputTypeProps = 'name' | 'size' | 'condition' | 'status' | 'pricePaid' | 'brand';

const BRANDS = ['NIKE', 'ADIDAS', 'JORDAN', 'NEW BALANCE', 'ASICS', 'PUMA', 'REEBOK', 'CONVERSE', 'VANS', ];
const STATUS = ['STOCKING', 'SELLING', 'ROCKING'];

export const renderModalContent = ({ modalStep, setModalStep, closeModal, sneaker, setSneaker }: AddSneakersModalProps) => {
    const [sneakerName, setSneakerName] = useState('');
    const [isSneakerNameError, setIsSneakerNameError] = useState(false);
    const [isSneakerNameFocused, setIsSneakerNameFocused] = useState(false);
    const [sneakerBrand, setSneakerBrand] = useState('');
    const [isSneakerBrandError, setIsSneakerBrandError] = useState(false);
    const [isSneakerBrandFocused, setIsSneakerBrandFocused] = useState(false);
    const [sneakerStatus, setSneakerStatus] = useState('');
    const [isSneakerStatusError, setIsSneakerStatusError] = useState(false);
    const [isSneakerStatusFocused, setIsSneakerStatusFocused] = useState(false);
    const [sneakerSize, setSneakerSize] = useState('');
    const [isSneakerSizeError, setIsSneakerSizeError] = useState(false);
    const [isSneakerSizeFocused, setIsSneakerSizeFocused] = useState(false);
    const [sneakerCondition, setSneakerCondition] = useState('');
    const [isSneakerConditionFocused, setIsSneakerConditionFocused] = useState(false);
    const [isSneakerConditionError, setIsSneakerConditionError] = useState(false);
    const [sneakerImage, setSneakerImage] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isPricePaidError, setIsPricePaidError] = useState(false);
    const [isPricePaidFocused, setIsPricePaidFocused] = useState(false);
    const [sneakerPricePaid, setSneakerPricePaid] = useState('');

    const { user, userSneakers, sessionToken, getUserSneakers } = useSession();
    const userId = user?.id;

    const currentSneakerId = userSneakers ? userSneakers.findIndex(s => s.id === sneaker?.id) : -1;

    const scrollViewRef = useRef<ScrollView>(null);

    const indexTitle = userSneakers?.length === 0 ? 'Add your first sneaker' : 'Add a new sneaker';

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ 
                    animated: true
                });
            }
        }, 100);
    };

    const handleInputFocus = (inputType: InputTypeProps) => {
        switch(inputType) {
            case 'name':
                setIsSneakerNameFocused(true);
                break;
            case 'brand':
                setIsSneakerBrandFocused(true);
                break;
            case 'size':
                setIsSneakerSizeFocused(true);
                break;
            case 'condition':
                setIsSneakerConditionFocused(true);
                break;
            case 'status':
                setIsSneakerStatusFocused(true);
                break;
            case 'pricePaid':
                setIsPricePaidFocused(true);
                break;
        }
        setIsSneakerNameError(false);
        setIsSneakerBrandError(false);
        setIsSneakerSizeError(false);
        setIsSneakerConditionError(false);
        setIsSneakerStatusError(false);
        setIsPricePaidError(false);
        setErrorMsg('');
        scrollToBottom();
    };

    const handleInputBlur = (inputType: InputTypeProps, value: string) => {
        setIsSneakerNameError(false);
        setIsSneakerBrandError(false);
        setIsSneakerSizeError(false);
        setIsSneakerConditionError(false);
        setIsSneakerStatusError(false);
        setIsPricePaidError(false);

        switch(inputType) {
            case 'name':
                setIsSneakerNameFocused(false);
                checkSneakerName(value, setErrorMsg, setIsSneakerNameError);
                break;
            case 'brand':
                setIsSneakerBrandFocused(false);
                checkSneakerBrand(value, setErrorMsg, setIsSneakerBrandError);
                break;
            case 'size':
                setIsSneakerSizeFocused(false);
                checkSneakerSize(value, setErrorMsg, setIsSneakerSizeError);
                break;
            case 'condition':
                setIsSneakerConditionFocused(false);
                checkSneakerCondition(value, setErrorMsg, setIsSneakerConditionError);
                break;
            case 'status':
                setIsSneakerStatusFocused(false);
                checkSneakerStatus(value, setErrorMsg, setIsSneakerStatusError);
                break;
            case 'pricePaid':
                setIsPricePaidFocused(false);
                checkPricePaid(value, setErrorMsg, setIsPricePaidError);
                break;
        }
    };

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
        }
    };

    const resetFields = () => {
        setSneakerName('');
        setSneakerBrand('');
        setSneakerStatus('');
        setSneakerSize('');
        setSneakerCondition('');
        setSneakerImage(null);
        setSneakerPricePaid('');
        setErrorMsg('');
        
        setIsSneakerNameError(false);
        setIsSneakerBrandError(false);
        setIsSneakerStatusError(false);
        setIsSneakerSizeError(false);
        setIsSneakerConditionError(false);
        setIsPricePaidError(false);
        
        setIsSneakerNameFocused(false);
        setIsSneakerBrandFocused(false);
        setIsSneakerStatusFocused(false);
        setIsSneakerSizeFocused(false);
        setIsSneakerConditionFocused(false);
        setIsPricePaidFocused(false);

        setModalStep('index');
    };

    switch (modalStep) {
        case 'index':
            return (
                <>
                    <View className="flex-1 justify-center items-center gap-8">
                        <Text className="font-actonia text-primary text-4xl text-center">{indexTitle}</Text>
                        <Text className="font-spacemono-bold text-xl text-center">Do you have the box ?</Text>
                        <View className="flex justify-center items-center gap-4">
                            <MainButton
                                content="Yes" 
                                backgroundColor="bg-primary" 
                                onPressAction={() => setModalStep('box')} 
                            />
                            <MainButton 
                                content="No" 
                                backgroundColor="bg-gray-400" 
                                onPressAction={() => setModalStep('noBox')} 
                            />
                        </View>
                    </View>
                </>
            );
        case 'box':
            return (
                <>
                    <Text className="font-actonia text-primary text-4xl text-center">Scan your sneaker box</Text>
                    <View className="flex-1 justify-center items-center gap-8">
                        <Text className="font-spacemono-bold text-2xl text-center">Feature incoming 🚀</Text>
                        <MainButton 
                            content="Back" 
                            backgroundColor="bg-gray-400" 
                            onPressAction={() => setModalStep('index')} 
                        />
                    </View>
                </>
            );
        case 'noBox':
            return (
                <KeyboardAvoidingView 
                    className="flex-1" 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}>
                    <ScrollView 
                        ref={scrollViewRef}
                        className='flex-1'
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        contentContainerStyle={{ minHeight: '100%' }}
                    >
                        <View className="flex-1 h-full p-2 gap-8">
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
                                className="bg-gray-400 rounded-md h-48 w-full flex items-center justify-center"
                            >
                                {sneakerImage ? (
                                    <Image
                                        source={{ uri: sneakerImage }} 
                                        style={{
                                            width: '100%',
                                            height: 150,
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

                            <View className="flex flex-col gap-8">
                                <View className="flex flex-col gap-4">
                                    <View className='flex flex-col gap-2 w-full justify-center'>
                                        <ErrorMsg content={errorMsg} display={errorMsg !== ''}/>
                                        <TextInput 
                                            className={`bg-white rounded-md p-2 w-3/5 font-spacemono-bold ${
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
                                                className={`bg-white rounded-md p-2 w-full font-spacemono-bold text-center relative ${
                                                    isSneakerSizeError ? 'border-2 border-red-500' : ''
                                                } ${isSneakerSizeFocused ? 'border-2 border-primary' : ''}`} 
                                                placeholder="9.5"
                                                placeholderTextColor='gray'
                                                value={sneakerSize}
                                                onChangeText={setSneakerSize}
                                                onFocus={() => handleInputFocus('size')}
                                                onBlur={() => handleInputBlur('size', sneakerSize)}
                                            />
                                        </View>
                                    </View>

                                    <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                                        <Text className='font-spacemono text-center'>Price Paid</Text>
                                        <View className="w-4/5">
                                            <TextInput
                                                className={`bg-white rounded-md p-2 w-full font-spacemono-bold text-center relative ${
                                                    isPricePaidError ? 'border-2 border-red-500' : ''
                                                } ${isPricePaidFocused ? 'border-2 border-primary' : ''}`} 
                                                placeholder="150"
                                                keyboardType="numeric"
                                                placeholderTextColor='gray'
                                                value={sneakerPricePaid}
                                                onChangeText={setSneakerPricePaid}
                                                onFocus={() => handleInputFocus('pricePaid')}
                                                onBlur={() => handleInputBlur('pricePaid', sneakerPricePaid)}
                                            />
                                        </View>
                                    </View>

                                    <View className='flex-col items-center p-2 gap-1 w-1/3'>
                                        <Text className='font-spacemono text-center'>Condition</Text>
                                        <View className="w-4/5">
                                            <TextInput
                                                className={`bg-white rounded-md p-2 w-full font-spacemono-bold text-center relative ${
                                                    isSneakerConditionError ? 'border-2 border-red-500' : ''
                                                } ${isSneakerConditionFocused ? 'border-2 border-primary' : ''}`} 
                                                placeholder="0 - 10" 
                                                keyboardType="numeric"
                                                placeholderTextColor='gray'
                                                value={sneakerCondition}
                                                onChangeText={setSneakerCondition}
                                                onFocus={() => handleInputFocus('condition')}
                                                onBlur={() => handleInputBlur('condition', sneakerCondition)}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-1 justify-end pb-4">
                                <View className="flex-row justify-between w-full">
                                    <BackButton 
                                        onPressAction={() => setModalStep('index')} 
                                    />
                                    <NextButton
                                        content="Add"
                                        onPressAction={async () => {
                                            const isValid = validateAllFields(
                                                sneakerName, 
                                                sneakerBrand, 
                                                sneakerSize, 
                                                sneakerCondition, 
                                                sneakerStatus, 
                                                setErrorMsg, 
                                                setIsSneakerNameError, 
                                                setIsSneakerBrandError, 
                                                setIsSneakerSizeError, 
                                                setIsSneakerConditionError, 
                                                setIsSneakerStatusError
                                            );
                                            if (!isValid) {
                                                return;
                                            }
                                            await handleAddSneaker({
                                                image: sneakerImage || '',
                                                name: sneakerName,
                                                brand: sneakerBrand,
                                                size: Number(sneakerSize),
                                                condition: Number(sneakerCondition),
                                                status: sneakerStatus,
                                                userId: userId || '',
                                                price_paid: Number(sneakerPricePaid),
                                                purchase_date: '',
                                                description: '',
                                                estimated_value: 0,
                                            }, sessionToken || null)
                                            .then(async data => {
                                                resetFields();
                                                await getUserSneakers();
                                                closeModal();
                                            })
                                            .catch(error => {
                                                console.error('Error adding sneaker:', error);
                                            });
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            );
        case 'sneakerInfo':
            return (
                <View className="flex-1 gap-4">
                    <Image 
                        source={{ uri: sneaker?.images?.[0]?.url }} 
                        style={{
                            width: '100%',
                            height: 150,
                            borderRadius: 3
                        }}
                        contentFit="cover"
                        contentPosition="center"
                        cachePolicy="memory-disk"
                    />

                    <View className="flex-row justify-between items-center px-2">
                        <View className="flex gap-0">
                            <Text className="font-spacemono-bold text-lg">{sneaker?.model}</Text>
                            <Text className="font-spacemono-bold-italic text-base">{sneaker?.brand}</Text>
                        </View>
                        <ShareButton />
                    </View>

                    <View className='flex gap-8'>
                        <View className="flex-row items-center w-full border-t-2 border-gray-300">
                            <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                                <Text className='font-spacemono text-center text-sm'>Size</Text>
                                <View className="w-4/5">
                                    <Text className="font-spacemono-bold text-xl text-center">{sneaker?.size}US</Text>
                                </View>
                            </View>

                            <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                                <Text className='font-spacemono text-center text-sm'>Status</Text>
                                <View className="w-4/5">
                                    <Text className="font-spacemono-bold text-xl text-center">{sneaker?.status.toUpperCase()}</Text>
                                </View>
                            </View>

                            <View className='flex-col items-center p-2 gap-1 w-1/3'>
                                <Text className='font-spacemono text-center text-sm'>Price Paid</Text>
                                <View className="w-4/5">
                                    <Text className="font-spacemono-bold text-xl text-center">{sneaker?.price_paid ? sneaker?.price_paid + '$' : 'N/A'}</Text>
                                </View>
                            </View>
                        </View>

                        <ConditionBar condition={sneaker?.condition || 0} />

                        <View className="flex justify-center w-full px-2 gap-2">
                            <Text className='font-spacemono-bold'>Description :</Text>
                            <Text className='font-spacemono text-sm'>{sneaker?.description || 'No description yet'}</Text>
                        </View>
                    </View>

                    <View className="flex-1 justify-end pb-5 px-2">
                        <View className="flex-row justify-between w-full">
                            <View className="flex flex-row gap-3">
                                <BackButton 
                                    onPressAction={() => {
                                        setModalStep('index');
                                        closeModal();
                                    }}
                                />
                                <EditButton 
                                    onPressAction={() => alert('Feature coming soon')}
                                />
                            </View>

                            <NextButton 
                                content="Next" 
                                onPressAction={() => {
                                    if (!userSneakers || currentSneakerId === -1) return;
                                    
                                    if (currentSneakerId < userSneakers.length - 1) {
                                        const nextSneaker = userSneakers[currentSneakerId + 1];
                                        setSneaker(nextSneaker);
                                        setModalStep('sneakerInfo');
                                    } else {
                                        const firstSneaker = userSneakers[0];
                                        setSneaker(firstSneaker);
                                        setModalStep('sneakerInfo');
                                    }
                                }}
                            />
                        </View>
                    </View>
                </View>
            );
    }
};