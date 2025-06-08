import React from 'react';
import { View, ScrollView } from 'react-native';
import BrandTitle from '@/components/ui/text/BrandTitle';
import SneakerCard from '@/components/ui/cards/SneakerCard';
import { Sneaker } from '@/types/Sneaker';
import { useModalStore } from '@/store/useModalStore';

const brandLogos: Record<string, any> = {
    nike: require('@/assets/images/brands/nike.png'),
    adidas: require('@/assets/images/brands/adidas.png'),
    jordan: require('@/assets/images/brands/jordan.png'),
    newbalance: require('@/assets/images/brands/newbalance.png'),
    asics: require('@/assets/images/brands/asics.png'),
    puma: require('@/assets/images/brands/puma.png'),
    reebok: require('@/assets/images/brands/reebok.png'),
    converse: require('@/assets/images/brands/converse.png'),
    vans: require('@/assets/images/brands/vans.png'),
};

interface SneakersByBrandProps {
    sneakersByBrand: Record<string, Sneaker[]>;
    onSneakerPress: (sneaker: Sneaker) => void;
}

export default function SneakersByBrand({ 
    sneakersByBrand, 
    onSneakerPress
}: SneakersByBrandProps) {
    const { setModalStep } = useModalStore();

    return (
        <View className="flex-1 gap-4">
            {Object.entries(sneakersByBrand).map(([normalizedBrand, sneakers]) => {
                // Récupérer le nom original de la marque depuis le premier sneaker
                const originalBrandName = sneakers[0]?.brand || normalizedBrand;
                
                return (
                    <View key={normalizedBrand} className="flex-1">
                        <BrandTitle
                            content={originalBrandName} 
                            brandLogo={
                                normalizedBrand === 'new balance' ? 
                                    require('@/assets/images/brands/newbalance.png') : 
                                    brandLogos[normalizedBrand]
                            } 
                        />
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        >
                            {sneakers.map((sneaker) => (
                                <View key={sneaker.id} className="w-96 p-4">
                                    <SneakerCard
                                        setModalVisible={() => onSneakerPress(sneaker)}
                                        sneaker={sneaker}
                                        setSneaker={(s) => onSneakerPress(s)}
                                        setModalStep={setModalStep}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                );
            })}
        </View>
    );
} 