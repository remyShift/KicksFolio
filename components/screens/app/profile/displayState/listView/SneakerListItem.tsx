import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Sneaker } from '@/types/Sneaker';

interface SneakerListItemProps {
  sneaker: Sneaker;
  onPress: (sneaker: Sneaker) => void;
}

export default function SneakerListItem({ sneaker, onPress }: SneakerListItemProps) {
  return (
    <View className="px-4">
      <TouchableOpacity
        className="bg-white p-2 mb-2 rounded-md shadow-sm border border-gray-100"
        onPress={() => onPress(sneaker)}
      >
        <View className="flex-row justify-between items-start gap-2">
            <Image source={{ uri: sneaker.images[0].url }} className="w-16 h-16 bg-gray-100 rounded-lg" />
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{sneaker.model}</Text>
            <Text className="text-sm text-gray-600 mt-1">{sneaker.brand}</Text>
            <View className="flex-row items-center mt-2 gap-4">
              <Text className="text-sm text-gray-500">Size: {sneaker.size}US</Text>
              <Text className="text-sm text-gray-500">Condition: {sneaker.condition}/10</Text>
              {sneaker.price_paid && <Text className="text-sm font-medium text-green-600">{sneaker.price_paid}€</Text>}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
} 