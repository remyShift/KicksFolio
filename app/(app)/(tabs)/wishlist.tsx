import MainButton from '@/components/ui/buttons/MainButton';
import PageTitle from '@/components/ui/text/PageTitle';
import Title from '@/components/ui/text/Title';
import { Text, View } from 'react-native';

export default function Wishlist() {
  return (
    <View className="flex-1 gap-4 items-center justify-center">
      <Title content="No favorites yet" isTextCenter={true} />
      <View className="flex gap-2 items-center justify-center px-4">
        <Text className="font-spacemono text-base text-center">
          On this page you can see your wishlisted sneakers,
          go to a sneaker and add it to your wishlist by clicking the heart icon.
        </Text>
      </View>
      <MainButton content="Browse" backgroundColor="bg-primary" onPressAction={() => {
        alert('Feature in development ...');
      }} />
    </View>
  );
}
