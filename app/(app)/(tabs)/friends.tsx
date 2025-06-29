import { View } from 'react-native';
import Title from '@/components/ui/text/Title';
import MainButton from '@/components/ui/buttons/MainButton';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

export default function Friends() {
    const { t } = useTranslation();
    const { showInfoToast } = useToast();

    return (
      <View className="flex-1 gap-4 items-center justify-center">
        <Title content={t('common.titles.noFriends')} isTextCenter={true} />
        <MainButton content={t('common.buttons.add')} backgroundColor="bg-primary" onPressAction={() => {
          showInfoToast('Feature in development ...', 'We are working on it ! 💪🏼');
        }} />
      </View>
  );
}
