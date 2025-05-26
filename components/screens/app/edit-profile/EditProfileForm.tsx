import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, TextInput, Alert } from 'react-native'
import { useState, useRef } from 'react'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import PageTitle from '@/components/ui/text/PageTitle'
import MainButton from '@/components/ui/buttons/MainButton'
import ErrorMsg from '@/components/ui/text/ErrorMsg'
import { useSession } from '@/context/authContext'
import { UserData } from '@/types/Auth'
import UsernameInput from '@/components/ui/inputs/UsernameInput'
import FirstNameInput from '@/components/ui/inputs/FirstNameInput'
import LastNameInput from '@/components/ui/inputs/LastNameInput'
import SizeInput from '@/components/ui/inputs/SizeInput'
import { ScrollView as RNScrollView } from 'react-native'
import { useImagePicker } from '@/hooks/useImagePicker'
import { useAuth } from '@/hooks/useAuth'

export default function EditProfileForm() {
    const { user, sessionToken } = useSession()
    const { updateUser } = useAuth()
    const [profileData, setProfileData] = useState<UserData>({
        username: user?.username || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        sneaker_size: user?.sneaker_size || 0,
        profile_picture: user?.profile_picture?.url || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
    })

    const [usernameErrorMsg, setUsernameErrorMsg] = useState('')
    const [firstNameErrorMsg, setFirstNameErrorMsg] = useState('')
    const [lastNameErrorMsg, setLastNameErrorMsg] = useState('')
    const [sizeErrorMsg, setSizeErrorMsg] = useState('')
    const [username, setUsername] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [size, setSize] = useState('')

    const usernameInputRef = useRef<TextInput>(null)
    const firstNameInputRef = useRef<TextInput>(null)
    const lastNameInputRef = useRef<TextInput>(null)
    const sneakerSizeInputRef = useRef<TextInput>(null)
    const scrollViewRef = useRef<RNScrollView>(null)

    const mergedErrorMsg = usernameErrorMsg || firstNameErrorMsg || lastNameErrorMsg || sizeErrorMsg;

    const { handleImageSelection } = useImagePicker();

    const handleSubmit = async () => {
        if (!user || !sessionToken) return;
        await updateUser(user.id, profileData, sessionToken);
    }

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-background" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView className="flex-1" ref={scrollViewRef}>
            <View className="flex-1 p-4 gap-8">
                <Pressable onPress={() => router.back()} className='absolute right-5 top-14'>
                    <Ionicons name="close-outline" size={32} color="#666" />
                </Pressable>
                <View className="flex-row justify-center items-center">
                    <PageTitle content="Edit profile" />
                </View>

                <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                    <ErrorMsg content={mergedErrorMsg} display={!!mergedErrorMsg} />
                </View>

                <View className="items-center gap-4">
                    {profileData.profile_picture ? (
                        <View className="w-32 h-32 rounded-full">
                            <Image 
                            source={{ uri: profileData.profile_picture }}
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
                                    onPress: () => handleImageSelection('gallery').then(uri => {
                                        if (!uri) {
                                            Alert.alert('Sorry, we need permission to access your photos!');
                                            return;
                                        }
                                        setProfileData({ ...profileData, profile_picture: uri });
                                    }),
                                },
                                {   
                                    text: 'Take a photo',
                                    onPress: () => handleImageSelection('camera').then(uri => {
                                        if (!uri) {
                                            Alert.alert('Sorry, we need permission to access your camera!');
                                            return;
                                        }
                                        setProfileData({ ...profileData, profile_picture: uri });
                                    }),
                                },
                                {
                                    text: 'Cancel',
                                    style: 'cancel'
                                }
                            ])
                        }} className="w-32 h-32 bg-primary rounded-full flex-row items-center justify-center">
                            <Text className="text-white font-actonia text-6xl">
                                {profileData.username.charAt(0)}
                            </Text>
                        </Pressable>
                    )}
                </View>

                <View className="flex flex-col gap-4 w-full justify-center items-center">
                    <UsernameInput
                        inputRef={usernameInputRef}
                        signUpProps={profileData}
                        setSignUpProps={setProfileData}
                        scrollViewRef={scrollViewRef}
                        onErrorChange={setUsernameErrorMsg}
                        onValueChange={setUsername}
                    />
                    <FirstNameInput
                        inputRef={firstNameInputRef}
                        signUpProps={profileData}
                        setSignUpProps={setProfileData}
                        scrollViewRef={scrollViewRef}
                        onErrorChange={setFirstNameErrorMsg}
                        onValueChange={setFirstName}
                    />
                    <LastNameInput
                        inputRef={lastNameInputRef}
                        signUpProps={profileData}
                        setSignUpProps={setProfileData}
                        scrollViewRef={scrollViewRef}
                        onErrorChange={setLastNameErrorMsg}
                        onValueChange={setLastName}
                    />
                    <SizeInput
                        inputRef={sneakerSizeInputRef}
                        signUpProps={profileData}
                        setSignUpProps={setProfileData}
                        scrollViewRef={scrollViewRef}
                        onErrorChange={setSizeErrorMsg}
                        onValueChange={setSize}
                    />
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