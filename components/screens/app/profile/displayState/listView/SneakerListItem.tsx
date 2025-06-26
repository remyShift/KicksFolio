import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Sneaker } from '@/types/Sneaker';

interface SneakerListItemProps {
  sneaker: Sneaker;
  onPress: (sneaker: Sneaker) => void;
}

export default function SneakerListItem({ sneaker, onPress }: SneakerListItemProps) {  
  return (
    <TouchableOpacity
      className="bg-white p-4 border border-gray-100 mb-1"
      onPress={() => onPress(sneaker)}
    >
      <View className="flex-row justify-between items-center gap-3">
        <Image 
          source={{ uri: sneaker.images[0]?.uri }} 
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            backgroundColor: '#f3f4f6'
          }}
          contentFit="contain"
          cachePolicy="memory-disk"
          testID="sneaker-image"
        />
        <View className="flex-1">
          <Text className="text-sm text-gray-600 mt-1">{sneaker.brand || ''}</Text>
          <Text 
            className="text-lg font-semibold text-gray-900" 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {sneaker.model || ''}
          </Text>
          <View className="flex-row items-center mt-2 gap-4">
            <Text className="text-sm text-gray-500">Size: {sneaker.size ? `${sneaker.size}US` : 'N/A'}</Text>
            <Text className="text-sm text-gray-500">Condition: {sneaker.condition ? `${sneaker.condition}/10` : 'N/A'}</Text>
            {sneaker.price_paid > 0 && (
              <Text className="text-sm font-medium text-green-600">
                {sneaker.price_paid}€
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
} 