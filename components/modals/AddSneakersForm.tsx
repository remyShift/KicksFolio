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
import { fetchSkuSneakerData, handleSneakerDelete, handleSneakerSubmit } from '@/scripts/handleSneakers';
import { useSession } from '@/context/authContext';
import { checkSneakerName, checkSneakerSize, checkSneakerCondition, checkSneakerBrand, checkSneakerStatus, validateAllFields, checkPricePaid } from '@/scripts/validatesSneakersForm';
import ErrorMsg from '@/components/text/ErrorMsg';
import { Sneaker } from '@/types/Models';
import ShareButton from '../buttons/ShareButton';
import { ConditionBar } from '../ConditionBar';
import EditButton from '../buttons/EditButton';
import { CameraView } from 'expo-camera';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Link, Redirect, router } from 'expo-router';
import DeleteButton from '../buttons/DeleteButton';
import { Loader } from '@/components/Loader';

type AddSneakersModalProps = {
    modalStep: 'index' | 'box' | 'noBox' | 'sku' | 'sneakerInfo';
    setModalStep: (step: 'index' | 'box' | 'noBox' | 'sku' | 'sneakerInfo') => void;
    closeModal: () => void;
    sneaker: Sneaker | null | undefined;
    setSneaker: (sneaker: Sneaker | null) => void;
}

type InputTypeProps = 'name' | 'size' | 'condition' | 'status' | 'pricePaid' | 'brand' | 'description' | 'sku';

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
    const [sneakerImage, setSneakerImage] = useState('');
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
    const { user, userSneakers, sessionToken, getUserSneakers, setUserSneakers } = useSession();
    const [isSneakerImageFocused, setIsSneakerImageFocused] = useState(false);
    const [isSneakerImageError, setIsSneakerImageError] = useState(false);
    const [sneakerSKU, setSneakerSKU] = useState('');
    const [isSneakerSKUError, setIsSneakerSKUError] = useState(false);
    const [isSneakerSKUFocused, setIsSneakerSKUFocused] = useState(false);
    const [isNewSneaker, setIsNewSneaker] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const userId = user?.id;

    const currentSneakerId = userSneakers ? userSneakers.find((s: Sneaker) => s.id === sneaker?.id)?.id : null;

    const scrollViewRef = useRef<ScrollView>(null);

    const indexTitle = userSneakers?.length === 0 ? 'Add your first sneaker' : 'Add a new sneaker';

    if (!sessionToken) {
        router.push('/login');
    };

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
            case 'sku':
                setIsSneakerSKUFocused(true);
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
        setIsSneakerSKUError(false);
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
        setIsSneakerSKUError(false);
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
            case 'sku':
                setIsSneakerSKUFocused(false);
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

    const resetFields = () => {
        setSneakerName('');
        setSneakerBrand('');
        setSneakerStatus('');
        setSneakerSize('');
        setSneakerCondition('');
        setSneakerImage('');
        setSneakerPricePaid('');
        setErrorMsg('');
        setSneakerDescription('');
        setSneakerSKU('');

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
        setIsSneakerSKUFocused(false);
        setIsSneakerSKUError(false);

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

    return (
        <>
            {isLoading && (
                <View className="absolute inset-0 z-50">
                    <Loader />
                </View>
            )}
            {modalStep === 'index' && (
                <>
                    <View className="flex-1 justify-center items-center gap-8">
                        <Text className="font-actonia text-primary text-4xl text-center">{indexTitle}</Text>
                        <Text className="font-spacemono-bold text-xl text-center">How do you want to proceed ?</Text>
                        <View className="flex justify-center items-center gap-12">
                            <View className="flex-col justify-center items-center gap-1 px-6">
                                <Pressable
                                    onPress={() => setModalStep('box')}
                                >
                                    <Text className="font-spacemono-bold text-lg text-center text-primary">Scan your sneaker box barcode</Text>
                                </Pressable>
                                <Text className="font-spacemono-bold text-sm text-center">Can make mistakes and not always accurate.</Text>
                            </View>
                            <View className="flex-col justify-center items-center gap-1 px-6">
                                <Pressable
                                    onPress={() => setModalStep('sku')}
                                >
                                    <Text className="font-spacemono-bold text-lg text-center text-primary">By sneakers SKU</Text>
                                </Pressable>
                                    <Text className="font-spacemono-bold text-sm text-center">You can find the SKU on the sneaker box or on the sneaker itself.</Text>
                            </View>
                            <View className="flex-col justify-center items-center gap-1 px-6">
                                <Pressable
                                    onPress={() => setModalStep('noBox')}
                                >
                                    <Text className="font-spacemono-bold text-lg text-center text-primary">Add manually</Text>
                                </Pressable>
                                    <Text className="font-spacemono-bold text-sm text-center">You do it by yourself.</Text>
                            </View>
                        </View>
                    </View>
                </>
            )}
            {modalStep === 'box' && (
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
            )}
            {modalStep === 'sku' && (
                <View className="flex-1 justify-between items-center gap-8">
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
                        className="flex-1 w-full"
                    >
                        <ScrollView 
                            ref={scrollViewRef}
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
                                        className="bg-white rounded-md p-2 w-3/5 font-spacemono-bold"
                                        placeholder="SKU"
                                        onFocus={() => {
                                            handleInputFocus('sku');
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollToEnd({ animated: true });
                                            }, 100);
                                        }}
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
                                onPressAction={() => {
                                    fetchSkuSneakerData(sneakerSKU, sessionToken)
                                        .then(data => {
                                            if (data.results && data.results.length > 0) {
                                                const sneakerData = data.results[0];
                                                setSneakerImage(sneakerData.image.original);
                                                const sneakerName = sneakerData.name
                                                                .replace(sneakerData.brand, '').trim()
                                                                .replace(/\b(US|EU|UK|CM)\b/gi, '')
                                                                .replace(/\s+/g, ' ')
                                                                .trim()
                                                                .split(' ')
                                                                .filter((word: string) => word.length > 0 && word.trim() !== '')
                                                                .join(' ');
                                                setSneakerName(sneakerName);
                                                setSneakerBrand(sneakerData.brand.toUpperCase());
                                                setSneakerDescription(sneakerData.story || '');

                                                setIsSneakerImageError(true);
                                                setIsSneakerNameError(true);
                                                setIsSneakerBrandError(true);
                                                setIsSneakerDescriptionError(true);
                                                setErrorMsg('Please check the data fetched from the SKU and edit it if needed.');
                                                setModalStep('noBox');
                                            } else {
                                                setErrorMsg('No data found for this SKU, check the SKU or add it manually.');
                                            }
                                        })
                                        .catch(error => {
                                            setErrorMsg('Impossible to find the informations for this SKU. Please check the SKU or add it manually.');
                                            console.error('Error when fetching SKU data:', error);
                                        });
                                }}
                            />
                        </View>
                    </View>
                </View>
            )}
            {modalStep === 'noBox' && (
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
                                className={`bg-gray-400 rounded-md h-48 w-full flex items-center justify-center ${isSneakerImageError ? 'border-2 border-red-500' : ''} ${isSneakerImageFocused ? 'border-2 border-primary' : ''}`}
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
                                            className={`bg-white rounded-md p-2 w-full font-spacemono-bold pr-10 ${
                                                isSneakerDescriptionError ? 'border-2 border-red-500' : ''
                                            } ${isSneakerDescriptionFocused ? 'border-2 border-primary' : ''}`}
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
                                    <View className="flex-row gap-3">
                                        <BackButton 
                                            onPressAction={() => {
                                                if (!isNewSneaker) {
                                                    setIsNewSneaker(true);
                                                    closeModal();
                                                }
                                                resetFields();
                                                setModalStep('index');
                                            }} 
                                        />

                                        {!isNewSneaker && (
                                            <DeleteButton 
                                                onPressAction={async () => {
                                                    Alert.alert('Delete sneaker', 'Are you sure you want to delete this sneaker ?', [
                                                        {
                                                            text: 'Cancel',
                                                            style: 'cancel'
                                                        },
                                                        {
                                                            text: 'Delete',
                                                            style: 'destructive',
                                                            onPress: async () => {
                                                                if (!currentSneakerId || !userId || !sessionToken) return;
                                                                setIsLoading(true);
                                                                setIsNewSneaker(true);
                                                                resetFields();
                                                                handleSneakerDelete(currentSneakerId, userId, sessionToken)
                                                                    .then(() => {
                                                                        setUserSneakers((prevSneakers: Sneaker[] | null) => 
                                                                            prevSneakers ? prevSneakers.filter(s => s.id !== currentSneakerId) : []
                                                                        );
                                                                        setIsLoading(false);
                                                                        closeModal();
                                                                    })
                                                                    .catch(error => {
                                                                        setErrorMsg(`Une erreur est survenue lors de la suppression: ${error}`);
                                                                    })
                                                                    .finally(() => {
                                                                        setIsLoading(false);
                                                                    });
                                                            }
                                                        }
                                                    ]);
                                                }}
                                            />
                                        )}
                                    </View>
                                    <NextButton
                                        content="Add"
                                        onPressAction={async () => {
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
                                            
                                            setIsLoading(true);
                                            
                                            if (isNewSneaker) {
                                                setIsNewSneaker(false);
                                                handleSneakerSubmit({
                                                    image: sneakerImage,
                                                    model: sneakerName,
                                                    brand: sneakerBrand,
                                                    size: Number(sneakerSize),
                                                    condition: Number(sneakerCondition),
                                                    status: sneakerStatus,
                                                    userId: userId || '',
                                                    price_paid: Number(sneakerPricePaid),
                                                    purchase_date: '',
                                                    description: sneakerDescription,
                                                    estimated_value: 0,
                                                }, null, sessionToken || null)
                                                .then(async data => {
                                                    resetFields();
                                                    await getUserSneakers();
                                                    setIsLoading(false);
                                                    closeModal();
                                                })
                                                .catch(error => {
                                                    setErrorMsg('Something went wrong when adding the sneaker, please try again.');
                                                })
                                                .finally(() => {
                                                    setIsLoading(false);
                                                });
                                            } else {
                                                const sneakerId = currentSneakerId;
                                                if (!sneakerId) {
                                                    setErrorMsg('Something went wrong when adding the sneaker, please try again.');
                                                    return;
                                                }
                                                setIsNewSneaker(true);
                                                await handleSneakerSubmit({
                                                    image: sneakerImage,
                                                    model: sneakerName,
                                                    brand: sneakerBrand,
                                                    size: Number(sneakerSize),
                                                    condition: Number(sneakerCondition),
                                                    status: sneakerStatus,
                                                    price_paid: Number(sneakerPricePaid),
                                                    purchase_date: '',
                                                    description: sneakerDescription,
                                                    estimated_value: 0,
                                                    userId: userId || '',
                                                }, sneakerId, sessionToken || null)
                                                .then(async data => {
                                                    resetFields();
                                                    const userSneakers = await getUserSneakers();
                                                    console.log('userSneakers', userSneakers);
                                                    setIsLoading(false);
                                                    closeModal();
                                                })
                                                .catch(error => {
                                                    setErrorMsg('Something went wrong when updating the sneaker, please try again.');
                                                })
                                                .finally(() => {
                                                    setIsLoading(false);
                                                });
                                            }
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
            {modalStep === 'sneakerInfo' && (
                sneaker && userSneakers?.find(s => s.id === sneaker.id) && (
                    <View className="flex-1 gap-4">
                        <Image 
                            source={{ uri: sneaker?.images?.[0]?.url }} 
                            style={{
                                width: '100%',
                                height: 170,
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

                            <View className="flex-1 items-center w-full">
                            <ScrollView 
                                className="bg-white/60 rounded-md p-2 w-full"
                                showsVerticalScrollIndicator={true}
                                indicatorStyle="black"
                                persistentScrollbar={true}
                                style={{
                                    minHeight: 180,
                                    maxHeight: 180
                                }}
                            >
                                        <Text className='font-spacemono-bold'>Description :</Text>
                                        <Text className='font-spacemono text-sm'>
                                            {sneaker?.description || 'No description available'}
                                        </Text>
                                    </ScrollView>
                            </View>
                        </View>

                        <View className="flex-1 justify-end pb-5 px-2">
                            <View className="flex-row justify-between w-full">
                                <View className="flex flex-row gap-3">
                                    <BackButton 
                                        onPressAction={() => {
                                            setModalStep('index');
                                            setIsLoading(false);
                                            closeModal();
                                        }}
                                    />
                                    <EditButton 
                                        onPressAction={() => {
                                            setIsNewSneaker(false);
                                            setSneakerBrand(sneaker.brand);
                                            setSneakerName(sneaker.model);
                                            setSneakerImage(sneaker.images[0].url);
                                            setSneakerSize(sneaker.size.toString());
                                            setSneakerCondition(sneaker.condition.toString());
                                            setSneakerStatus(sneaker.status);
                                            setSneakerPricePaid(sneaker.price_paid.toString());
                                            setSneakerDescription(sneaker.description);
                                            setModalStep('noBox');
                                        }}
                                    />
                                </View>

                                <NextButton 
                                    content="Next" 
                                    onPressAction={() => {
                                        if (!userSneakers || !currentSneakerId) return;
                                        const currentIndex = userSneakers.findIndex((s: Sneaker) => s.id === currentSneakerId);
                                        const nextId = currentIndex < userSneakers.length - 1 
                                            ? userSneakers[currentIndex + 1].id 
                                            : userSneakers[0].id;
                                        const nextSneaker = userSneakers.find((s: Sneaker) => s.id === nextId);
                                        if (!nextSneaker) return;
                                        setSneaker(nextSneaker);
                                        setModalStep('sneakerInfo');
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                )
            )}
        </>
    );
};