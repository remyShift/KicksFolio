import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import MainButton from "@/components/ui/buttons/MainButton";
import { useState, useRef } from "react";
import PageTitle from "@/components/ui/text/PageTitle";
import ErrorMsg from "@/components/ui/text/ErrorMsg";
import { router } from "expo-router";
import { useSession } from "@/context/authContext";
import { createCollection } from "@/scripts/handleCollection";

export default function Collection() {
    const [isCollectionNameFocused, setIsCollectionNameFocused] = useState(false);
    const [isCollectionNameError, setIsCollectionNameError] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const { user, sessionToken, getUserCollection } = useSession();

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-background" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView 
                ref={scrollViewRef}
                className='flex-1'
                keyboardShouldPersistTaps="handled"
                scrollEnabled={isCollectionNameFocused}>
                <View className="flex-1 items-center gap-12 p-4 bg-background">
                    <PageTitle content='Welcome to KicksFolio !' />
                    <View className='flex justify-center items-center gap-8 w-full mt-32'>
                        <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                            <ErrorMsg content={errorMsg} display={errorMsg !== ''} />
                        </View>
                        <Text className="text-lg font-spacemono-bold">Please give a name to your collection :</Text>
                        <TextInput
                            placeholder="Collection name"
                            value={collectionName}
                            onChangeText={setCollectionName}
                            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                isCollectionNameError ? 'border-2 border-red-500' : ''
                            } ${isCollectionNameFocused ? 'border-2 border-primary' : ''}`}
                        />
                        <MainButton 
                            content='Create' 
                            backgroundColor='bg-primary' 
                            onPressAction={async () => {
                                if (collectionName.length === 0) {
                                    setIsCollectionNameError(true);
                                    setErrorMsg('Please put a name to your collection.');
                                } else {
                                    setIsCollectionNameFocused(false);
                                    setIsCollectionNameError(false);
                                    setErrorMsg('');
                                    if (user && sessionToken) {
                                        createCollection(collectionName, user.id, sessionToken).then(() => {
                                            getUserCollection().then(() => {
                                                router.replace('/(app)/(tabs)?newUser=true');
                                            }).catch(error => {
                                                setErrorMsg('Something went wrong when getting user collection, please try again.');
                                            });
                                        }).catch(error => {
                                            setErrorMsg('Something went wrong when creating collection, please try again.');
                                        });
                                    } else {
                                        setErrorMsg('Something went wrong, please try again.');
                                    }
                                }
                            }} 
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}