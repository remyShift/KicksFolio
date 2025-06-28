import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Sneaker } from '@/types/Sneaker';

interface SneakerListItemProps {
  sneaker: Sneaker;
  onPress: (sneaker: Sneaker) => void;
  showOwnerInfo?: boolean;
}

export default function SneakerListItem({ sneaker, onPress, showOwnerInfo = false }: SneakerListItemProps) {  
  return (
    <TouchableOpacity
      className="bg-white p-4 border border-gray-100 mb-1"
      onPress={() => onPress(sneaker)}
    >
      <View className="flex-row justify-between items-center gap-3">
        {sneaker.images?.[0]?.uri ? (
          <Image 
            source={{ uri: sneaker.images[0].uri }} 
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
        ) : (
          <View className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
            <MaterialCommunityIcons name="shoe-sneaker" size={32} color="#9CA3AF" />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-sm text-gray-600 mt-1">{sneaker.brand || ''}</Text>
          <Text 
            className="text-lg font-semibold text-gray-900" 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {sneaker.model || ''}
          </Text>
          
          {/* Informations du propriétaire si applicable */}
          {showOwnerInfo && sneaker.owner && (
            <View className="bg-gray-50 p-2 rounded-lg mt-2 mb-2">
              <Text className="font-spacemono text-xs text-gray-600 uppercase">
                Owned by
              </Text>
              <Text className="font-spacemono text-sm text-primary">
                @{sneaker.owner.username}
              </Text>
            </View>
          )}
          
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