import { ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useEffect } from 'react';
import Title from '@/components/ui/text/Title';
import CollectionCard from '@/components/ui/cards/CollectionCard';
import MainButton from '@/components/ui/buttons/MainButton';
import { useModalStore } from '@/store/useModalStore';
import useToast from '@/hooks/useToast';

export default function Index() {
    const { user, userSneakers } = useSession();
    const { setModalStep, setIsVisible } = useModalStore();
    const { showInfoToast } = useToast();

    // Afficher automatiquement la modale pour les nouveaux utilisateurs
    useEffect(() => {
        if (user && (!userSneakers || userSneakers.length === 0)) {
            setTimeout(() => {
                setModalStep('index');
                setIsVisible(true);
            }, 1000);
        }
    }, [user, userSneakers, setModalStep, setIsVisible]);

    return (
        <ScrollView className="flex-1 pt-32">
                <View className='flex-1 gap-32'>
                    <View className="flex-1 gap-4">
                        <Title content="My collection" />
                        <View className="flex-1 px-4">
                            <CollectionCard userSneakers={userSneakers} />
                        </View>
                    </View>
                    <View className="flex-1 gap-4">
                        <View className="flex-1 gap-4 items-center justify-center">
                            <Title content="Add some friends" isTextCenter={true} />
                            <MainButton content="Browse" backgroundColor="bg-primary" onPressAction={() => {
                                showInfoToast('Feature in development ...', 'We are working on it ! 💪🏼');
                            }} />
                        </View>
                    </View>
                </View>
        </ScrollView>
    );
}
