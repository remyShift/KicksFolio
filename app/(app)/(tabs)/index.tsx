import { ScrollView, View, Button } from 'react-native';
import { useSession } from '@/context/authContext';
import { useEffect } from 'react';
import Title from '@/components/ui/text/Title';
import CollectionCard from '@/components/ui/cards/CollectionCard';
import MainButton from '@/components/ui/buttons/MainButton';
import { useModalStore } from '@/store/useModalStore';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

export default function Index() {
    const { t } = useTranslation();
    const { user, userSneakers } = useSession();
    const { setModalStep, setIsVisible } = useModalStore();
    const { showInfoToast } = useToast();

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
                        <Title content={t('collection.pages.titles.collection')} />
                        <View className="flex-1 px-4">
                            <CollectionCard userSneakers={userSneakers} />
                        </View>
                    </View>
                    <View className="flex-1 gap-4">
                        <View className="flex-1 gap-4 items-center justify-center">
                            <Title content={t('social.friends.addFriends')} isTextCenter={true} />
                            <MainButton content={t('ui.buttons.browse')} backgroundColor="bg-primary" onPressAction={() => {
                                showInfoToast('Feature in development ...', 'We are working on it ! 💪🏼');
                            }} />
                        </View>
                    </View>
                </View>
        </ScrollView>
    );
}
