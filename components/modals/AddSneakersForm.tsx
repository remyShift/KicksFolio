import { Text, View, Pressable, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import { Image } from 'expo-image';
import BackButton from '@/components/buttons/BackButton';
import NextButton from '@/components/buttons/NextButton';
import MainButton from '@/components/buttons/MainButton';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useRef, useEffect } from 'react';
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
import { CameraView } from 'expo-camera';

type AddSneakersModalProps = {
    modalStep: 'index' | 'box' | 'noBox' | 'sneakerInfo';
    setModalStep: (step: 'index' | 'box' | 'noBox' | 'sneakerInfo') => void;
    closeModal: () => void;
    sneaker: Sneaker | null | undefined;
    setSneaker: (sneaker: Sneaker | null) => void;
}

type InputTypeProps = 'name' | 'size' | 'condition' | 'status' | 'pricePaid' | 'brand' | 'description';

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
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);
    const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
    const [sneakerDescription, setSneakerDescription] = useState('');
    const [isSneakerDescriptionFocused, setIsSneakerDescriptionFocused] = useState(false);
    const [isSneakerDescriptionError, setIsSneakerDescriptionError] = useState(false);
    const { user, userSneakers, sessionToken, getUserSneakers } = useSession();
    const [isSneakerImageFocused, setIsSneakerImageFocused] = useState(false);
    const [isSneakerImageError, setIsSneakerImageError] = useState(false);

    const userId = user?.id;

    const currentSneakerId = userSneakers ? userSneakers.findIndex((s: Sneaker) => s.id === sneaker?.id) : -1;

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
            case 'description':
                setIsSneakerDescriptionFocused(true);
                break;
        }
        setIsSneakerNameError(false);
        setIsSneakerBrandError(false);
        setIsSneakerDescriptionError(false);
        setIsSneakerSizeError(false);
        setIsSneakerConditionError(false);
        setIsSneakerStatusError(false);
        setIsPricePaidError(false);
        setIsSneakerImageError(false);
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
        setIsSneakerImageError(false);

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
            case 'description':
                setIsSneakerDescriptionFocused(false);
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
        setSneakerDescription('');

        setIsSneakerNameError(false);
        setIsSneakerBrandError(false);
        setIsSneakerStatusError(false);
        setIsSneakerSizeError(false);
        setIsSneakerConditionError(false);
        setIsPricePaidError(false);
        setIsSneakerDescriptionError(false);
        setIsSneakerNameFocused(false);
        setIsSneakerBrandFocused(false);
        setIsSneakerStatusFocused(false);
        setIsSneakerSizeFocused(false);
        setIsSneakerConditionFocused(false);
        setIsPricePaidFocused(false);
        setIsSneakerDescriptionFocused(false);
        setIsSneakerImageFocused(false);
        setIsSneakerImageError(false);

        setIsScanning(false);
        setLastScannedCode(null);
        setModalStep('index');
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (isScanning || timeoutRef || lastScannedCode === data) {
            return;
        }        
        setIsScanning(true);
        setIsCameraActive(false);
        setLastScannedCode(data);
        
        const timeout = setTimeout(() => {
            fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/upc_lookup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ barcode: data })
            })
            .then(response => response.json())
            .then(data => {
                setSneakerImage(data.products[0].images[0]);

                const brandName = data.products[0].manufacturer;
                setSneakerBrand(brandName.toUpperCase());

                const cleanTitle = data.products[0].title
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\b(US|EU|UK|CM)\b/gi, '')
                    .replace(/\d+\.?\d*/g, '')
                    .trim()
                    .split(' ')
                    .filter((word: string) => word.length > 0 && word.trim() !== '')
                    .join(' ');

                setSneakerName(cleanTitle.replace(brandName, '').trim());

                setSneakerDescription(data.products[0].description);

                setModalStep('noBox');

                const sizeString = data.products[0].size || '';
                let usSize = '';

                const usMatch = sizeString.match(/US\s*(\d+\.?\d*)/i);
                if (usMatch) {
                    usSize = usMatch[1];
                }
                else if (sizeString.includes('US')) {
                    const sizes = sizeString.split(' ');
                    const usIndex = sizes.findIndex((s: string) => s.toUpperCase() === 'US');
                    if (usIndex !== -1 && usIndex + 1 < sizes.length) {
                        usSize = sizes[usIndex + 1];
                    }
                }

                setSneakerSize(usSize);
                setSneakerDescription(data.products[0].description);

                setErrorMsg('Please check the data fetched from the barcode and edit it if needed.');
                setIsSneakerNameError(true);
                setIsSneakerImageError(true);
                setIsSneakerBrandError(true);
                setIsSneakerSizeError(true);
                setIsSneakerDescriptionError(true);

                setModalStep('noBox');

                setTimeoutRef(null);
                setIsScanning(false);
                setIsCameraActive(true);
                setLastScannedCode(null);
            })
            .catch(error => {
                setErrorMsg('Error when fetching UPC data, please try again or complete the form manually.');
                setIsScanning(false);
                setIsCameraActive(true);
                setTimeoutRef(null);
                setLastScannedCode(null);
                setModalStep('noBox');
            });
        }, 2500);

        setTimeoutRef(timeout);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef) {
                clearTimeout(timeoutRef);
            }
        };
    }, [timeoutRef]);

    switch (modalStep) {
        case 'index':
            return (
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
            );
        case 'box':
            return (
                <View className="flex-1 justify-between items-center gap-8">
                    <View className="flex-1 w-full justify-center items-center gap-8">
                        {isCameraActive ? (
                            <View className="flex-1 w-full justify-center items-center gap-8">
                                <View className="flex-col justify-center items-center gap-1">
                                    <Text className="font-spacemono-bold text-lg text-center px-6">Scan your sneaker box barcode</Text>
                                    <Text className="font-spacemono-bold text-base text-center px-6">Make sure the barcode is in the center of the image.</Text>
                                </View>
                                <View className="w-4/5 h-1/4 border-2 border-primary">
                                    <CameraView
                                        active={isCameraActive && !isScanning}
                                        onBarcodeScanned={(data) => {
                                            console.log('-------------------------', {isScanning, isCameraActive, timeoutRef, lastScannedCode});
                                            handleBarCodeScanned(data);
                                        }}
                                        animateShutter={isScanning}
                                        autofocus='on'
                                        enableTorch={true}
                                        
                                        zoom={0.4}
                                        flash='auto'
                                        barcodeScannerSettings={{
                                            barcodeTypes: ['ean13', 'ean8', 'upc_e', 'upc_a'],
                                        }}
                                        style={{ flex: 1 }}
                                    />
                                    </View>
                                </View>
                            ) : (
                                <Text className="font-spacemono-bold text-lg text-center px-6">Fetching data...</Text>
                            )}
                    </View>
                    <View className="justify-end items-start w-full pb-5">
                        <BackButton 
                            onPressAction={() => {
                                setIsCameraActive(true);
                                setModalStep('index');
                            }} 
                        />
                    </View>
                </View>
            );
        case 'noBox':
            return (
                <KeyboardAvoidingView 
                    className="flex-1" 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}>
                    <ScrollView 
                        ref={scrollViewRef}
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
                                className="bg-gray-400 rounded-md h-48 w-full flex items-center justify-center"
                            >
                                {sneakerImage ? (
                                    <Image
                                        source={{ uri: sneakerImage }} 
                                        className={`w-full h-full border-2 ${isSneakerImageError ? 'border-red-500' : ''} ${isSneakerImageFocused ? 'border-primary' : ''} rounded-md`}
                                        contentFit="cover"
                                        contentPosition="center"
                                        cachePolicy="memory-disk"
                                    />
                                ) : (
                                    <MaterialIcons name="add-a-photo" size={30} color="white" />
                                )}
                            </Pressable>

                            <View className="flex flex-col gap-6 mt-2">
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

                                <View className="flex-1 items-center w-full">
                                    <View className="relative w-full">
                                        <TextInput
                                            className="bg-white rounded-md p-2 w-full font-spacemono-bold pr-10"
                                            value={sneakerDescription}
                                            onChangeText={(text) => {
                                                setSneakerDescription(text);
                                                scrollToBottom();
                                            }}
                                            placeholder="Description"
                                            placeholderTextColor='gray'
                                            multiline={true}
                                            textAlignVertical="top"
                                            style={{
                                                minHeight: 60,
                                                maxHeight: 80
                                            }}
                                            onFocus={() => handleInputFocus('description')}
                                            onBlur={() => handleInputBlur('description', sneakerDescription)}
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
                                    <BackButton 
                                        onPressAction={() => {
                                            resetFields();
                                            setModalStep('index');
                                        }} 
                                    />
                                    <NextButton
                                        content="Add"
                                        onPressAction={async () => {
                                            const isValid = validateAllFields(
                                                sneakerName, 
                                                sneakerBrand, 
                                                sneakerSize,
                                                sneakerCondition || '',
                                                sneakerStatus, 
                                                sneakerImage || '',
                                                setErrorMsg, 
                                                setIsSneakerNameError, 
                                                setIsSneakerBrandError, 
                                                setIsSneakerSizeError, 
                                                setIsSneakerConditionError, 
                                                setIsSneakerStatusError,
                                                setIsSneakerImageError
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
                                                description: sneakerDescription,
                                                estimated_value: 0,
                                            }, sessionToken || null)
                                            .then(async data => {
                                                resetFields();
                                                await getUserSneakers();
                                                closeModal();
                                            })
                                            .catch(error => {
                                                setErrorMsg('Something went wrong when adding the sneaker, please try again.');
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