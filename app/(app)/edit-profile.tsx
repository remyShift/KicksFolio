import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, TextInput, Alert } from 'react-native'
import { useState, useRef } from 'react'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'

import PageTitle from '@/components/text/PageTitle'
import MainButton from '@/components/buttons/MainButton'
import ErrorMsg from '@/components/text/ErrorMsg'
import { useSession } from '@/context/authContext'

export default function EditProfile() {
    const { user } = useSession()
    const [errorMsg, setErrorMsg] = useState('')
    const [profileData, setProfileData] = useState({
        newUsername: user?.username || '',
        newFirstName: user?.first_name || '',
        newLastName: user?.last_name || '',
        newSneakerSize: user?.sneaker_size || '',
        newProfilePicture: user?.profile_picture || '',
        newEmail: user?.email || '',
    })

    // États pour le focus et les erreurs
    const [isUsernameFocused, setIsUsernameFocused] = useState(false)
    const [isUsernameError, setIsUsernameError] = useState(false)
    const [isFirstNameFocused, setIsFirstNameFocused] = useState(false)
    const [isFirstNameError, setIsFirstNameError] = useState(false)
    const [isLastNameFocused, setIsLastNameFocused] = useState(false)
    const [isLastNameError, setIsLastNameError] = useState(false)
    const [isSneakerSizeFocused, setIsSneakerSizeFocused] = useState(false)
    const [isSneakerSizeError, setIsSneakerSizeError] = useState(false)

    // Références pour les inputs
    const usernameInputRef = useRef<TextInput>(null)
    const firstNameInputRef = useRef<TextInput>(null)
    const lastNameInputRef = useRef<TextInput>(null)
    const sneakerSizeInputRef = useRef<TextInput>(null)

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            setErrorMsg('Désolé, nous avons besoin des permissions pour accéder à vos photos !')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        })

        if (!result.canceled) {
            setProfileData({ ...profileData, newProfilePicture: result.assets[0].uri })
        }
    }

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
            setErrorMsg('Désolé, nous avons besoin des permissions pour accéder à votre caméra !')
            return
        }

        const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
        })

        if (!result.canceled) {
        setProfileData({ ...profileData, newProfilePicture: result.assets[0].uri })
        }
    }

    const handleSubmit = () => {
        // Logique de mise à jour du profil
    }

    const handleInputFocus = (inputType: 'username' | 'firstName' | 'lastName' | 'sneakerSize') => {
        switch(inputType) {
            case 'username':
                setIsUsernameFocused(true);
                break;
            case 'firstName':
                setIsFirstNameFocused(true);
                break;
            case 'lastName':
                setIsLastNameFocused(true);
                break;
            case 'sneakerSize':
                setIsSneakerSizeFocused(true);
                break;
        }
        setErrorMsg('');
        setIsUsernameError(false);
        setIsFirstNameError(false);
        setIsLastNameError(false);
        setIsSneakerSizeError(false);
    };

    const handleInputBlur = (inputType: 'username' | 'firstName' | 'lastName' | 'sneakerSize', value: string) => {
        switch(inputType) {
            case 'username':
                setIsUsernameFocused(false);
                if (!value.trim()) {
                    setErrorMsg('Veuillez entrer un nom d\'utilisateur');
                    setIsUsernameError(true);
                }
                break;
            case 'firstName':
                setIsFirstNameFocused(false);
                if (!value.trim()) {
                    setErrorMsg('Veuillez entrer votre prénom');
                    setIsFirstNameError(true);
                }
                break;
            case 'lastName':
                setIsLastNameFocused(false);
                if (!value.trim()) {
                    setErrorMsg('Veuillez entrer votre nom');
                    setIsLastNameError(true);
                }
                break;
            case 'sneakerSize':
                setIsSneakerSizeFocused(false);
                if (!value || isNaN(Number(value))) {
                    setErrorMsg('Veuillez entrer une taille valide');
                    setIsSneakerSizeError(true);
                }
                break;
        }
    };

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-background" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView className="flex-1">
            <View className="flex-1 p-4 gap-8">
                <Pressable onPress={() => router.back()} className='absolute right-5 top-14'>
                    <Ionicons name="close-outline" size={32} color="#666" />
                </Pressable>
                <View className="flex-row justify-center items-center">
                    <PageTitle content="Edit profile" />
                </View>

                <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                    <ErrorMsg content={errorMsg} display={errorMsg !== ''} />
                </View>

                    <View className="items-center gap-4">
                        {profileData.newProfilePicture ? (
                            <View className="w-32 h-32 rounded-full">
                                <Image 
                                source={{ uri: profileData.newProfilePicture }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 100
                                }}
                                contentFit="cover"
                                contentPosition="center"
                                cachePolicy="memory-disk"
                                />
                            </View>
                            ) : (
                            <Pressable onPress={() => {
                                Alert.alert('Choose an image',
                                    'Select an image from your gallery or take a photo with your camera to update your profile picture.', [
                                    { 
                                        text: 'Pick from gallery',
                                        onPress: pickImage,
                                    },
                                    {   
                                        text: 'Take a photo',
                                        onPress: takePhoto,
                                    },
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    }
                                ])
                            }} className="w-32 h-32 bg-primary rounded-full flex-row items-center justify-center">
                                <Text className="text-white font-actonia text-6xl">
                                    {profileData.newUsername.charAt(0)}
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    <View className="flex flex-col gap-4 w-full justify-center items-center">
                        <View className="flex flex-col gap-2 w-full justify-center items-center">
                            <Text className='font-spacemono-bold text-lg'>Username</Text>
                            <TextInput
                                placeholder="Username"
                                ref={usernameInputRef}
                                value={profileData.newUsername}
                                inputMode='text'
                                textContentType='username'
                                autoComplete='username'
                                clearButtonMode='while-editing'
                                autoCorrect={false}
                                onFocus={() => handleInputFocus('username')}
                                onBlur={() => handleInputBlur('username', profileData.newUsername)}
                                returnKeyType='next'
                                enablesReturnKeyAutomatically={true}
                                onSubmitEditing={() => firstNameInputRef.current?.focus()}
                                placeholderTextColor='gray'
                                onChangeText={(text) => {
                                    setProfileData({...profileData, newUsername: text});
                                    setErrorMsg('');
                                }}
                                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                    isUsernameError ? 'border-2 border-red-500' : ''
                                } ${isUsernameFocused ? 'border-2 border-primary' : ''}`}
                            />
                        </View>

                        <View className="flex flex-col gap-2 w-full justify-center items-center">
                            <Text className='font-spacemono-bold text-lg'>First name</Text>
                            <TextInput
                                placeholder="first name"
                                ref={firstNameInputRef}
                                value={profileData.newFirstName}
                                inputMode='text'
                                textContentType='givenName'
                                autoComplete='given-name'
                                clearButtonMode='while-editing'
                                autoCorrect={false}
                                onFocus={() => handleInputFocus('firstName')}
                                onBlur={() => handleInputBlur('firstName', profileData.newFirstName)}
                                returnKeyType='next'
                                enablesReturnKeyAutomatically={true}
                                onSubmitEditing={() => lastNameInputRef.current?.focus()}
                                placeholderTextColor='gray'
                                onChangeText={(text) => {
                                    setProfileData({...profileData, newFirstName: text});
                                    setErrorMsg('');
                                }}
                                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                    isFirstNameError ? 'border-2 border-red-500' : ''
                                } ${isFirstNameFocused ? 'border-2 border-primary' : ''}`}
                            />
                        </View>

                        <View className="flex flex-col gap-2 w-full justify-center items-center">
                            <Text className='font-spacemono-bold text-lg'>Last name</Text>
                            <TextInput
                                placeholder="last name"
                                ref={lastNameInputRef}
                                value={profileData.newLastName}
                                inputMode='text'
                                textContentType='familyName'
                                autoComplete='family-name'
                                clearButtonMode='while-editing'
                                autoCorrect={false}
                                onFocus={() => handleInputFocus('lastName')}
                                onBlur={() => handleInputBlur('lastName', profileData.newLastName)}
                                returnKeyType='next'
                                enablesReturnKeyAutomatically={true}
                                onSubmitEditing={() => sneakerSizeInputRef.current?.focus()}
                                placeholderTextColor='gray'
                                onChangeText={(text) => {
                                    setProfileData({...profileData, newLastName: text});
                                    setErrorMsg('');
                                }}
                                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                    isLastNameError ? 'border-2 border-red-500' : ''
                                } ${isLastNameFocused ? 'border-2 border-primary' : ''}`}
                            />
                        </View>

                        <View className="flex flex-col gap-2 w-full justify-center items-center">
                            <Text className='font-spacemono-bold text-lg'>Sneaker size</Text>
                            <TextInput
                                placeholder="sneaker size"
                                ref={sneakerSizeInputRef}
                                value={profileData.newSneakerSize.toString()}
                                inputMode='numeric'
                                keyboardType="numeric"
                                clearButtonMode='while-editing'
                                autoCorrect={false}
                                onFocus={() => handleInputFocus('sneakerSize')}
                                onBlur={() => handleInputBlur('sneakerSize', profileData.newSneakerSize.toString())}
                                returnKeyType='done'
                                enablesReturnKeyAutomatically={true}
                                onSubmitEditing={() => handleSubmit()}
                                placeholderTextColor='gray'
                                onChangeText={(text) => {
                                    setProfileData({...profileData, newSneakerSize: text});
                                    setErrorMsg('');
                                }}
                                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                    isSneakerSizeError ? 'border-2 border-red-500' : ''
                                } ${isSneakerSizeFocused ? 'border-2 border-primary' : ''}`}
                            />
                        </View>
                    </View>
                    <View className='flex w-full justify-center items-center'>
                        <MainButton 
                            content="Save"
                            onPressAction={handleSubmit}
                            backgroundColor="bg-primary"
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
