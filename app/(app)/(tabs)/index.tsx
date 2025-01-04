import CollectionCard from '@/components/cards/CollectionCard';
import FriendTitle from '@/components/text/FriendTitle';
import PageTitle from '@/components/text/PageTitle';
import Title from '@/components/text/Title';
import MainButton from '@/components/buttons/MainButton';
import { ScrollView, View, Modal, Pressable, Image } from 'react-native';
import { useSession } from '@/context/authContext';
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from 'react';
import { renderModalContent } from '@/components/modals/AddSneakersForm';
import { Sneaker } from '@/types/Models';

export default function Index() {
    const params = useLocalSearchParams();
    const isNewUser = params.newUser === 'true';
    const { userCollection, userSneakers } = useSession();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalStep, setModalStep] = useState<'index' | 'box' | 'noBox' | 'sneakerInfo'>('index');
    const [currentSneaker, setCurrentSneaker] = useState<Sneaker | null>(null);

    const preloadImages = async (imageUris: string[]) => {
        const prefetchTasks = imageUris.map(uri => Image.prefetch(uri));
        await Promise.all(prefetchTasks);
    };

    useEffect(() => {
        if (isNewUser || (userSneakers && userSneakers.length === 0)) {
            setModalVisible(true);
        } else {
            setModalVisible(false);
        }
    }, [isNewUser, userSneakers]);

    useEffect(() => {
        if (userSneakers) {
            const sneakerImages = userSneakers.map(sneaker => sneaker.images[0]);
            const imageUris = sneakerImages.map(image => image.url);
            preloadImages(imageUris);
        }
    }, []);

    return (
        <View className="flex-1">
            <ScrollView className="flex-1">
                <View className="flex-1 gap-10">
                    <PageTitle content="KicksFolio" />

                    <View className='flex-1 gap-32'>
                        <View className="flex-1 gap-4">
                            <Title content="My collection" />
                            <View className="flex-1 px-4">
                                <CollectionCard userCollection={userCollection} userSneakers={userSneakers} />
                            </View>
                        </View>
                        <View className="flex-1 gap-4">
                            <View className="flex-1 gap-4 items-center justify-center">
                                <Title content="Add some friends" isTextCenter={true} />
                                <MainButton content="Browse" backgroundColor="bg-primary" onPressAction={() => {
                                    alert('Feature in development ...');
                                }} />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable 
                    className="flex-1 bg-black/50" 
                    onPress={() => setModalVisible(false)}
                >
                    <View className="flex-1 justify-end">
                        <Pressable 
                            className="h-[80%] bg-background rounded-t-3xl p-4"
                            onPress={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            {renderModalContent({ 
                                modalStep,
                                sneaker: currentSneaker,
                                setSneaker: setCurrentSneaker,
                                setModalStep,
                                closeModal: () => {
                                    setModalVisible(false);
                                    router.replace('/(app)/(tabs)');
                                }
                            })}
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}
