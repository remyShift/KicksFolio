import { Sneaker } from '@/types/Sneaker';

export type ModalStep = 'index' | 'sku' | 'noBox' | 'view' | 'box';

export type InputType = 'name' | 'brand' | 'size' | 'condition' | 'status' | 'pricePaid' | 'sku';

export interface InitialStepProps {
    setModalStep: (step: ModalStep) => void;
    closeModal: () => void;
}

export interface SkuStepProps {
    setModalStep: (step: ModalStep) => void;
    closeModal: () => void;
    setSneaker: (sneaker: Sneaker | null) => void;
}

export interface FormStepProps {
    setModalStep: (step: ModalStep) => void;
    closeModal: () => void;
    sneaker: Sneaker | null;
    setSneaker: (sneaker: Sneaker | null) => void;
    userSneakers: Sneaker[] | null;
    setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export interface ViewStepProps {
    setModalStep: (step: ModalStep) => void;
    closeModal: () => void;
    sneaker: Sneaker;
    setSneaker: (sneaker: Sneaker | null) => void;
    userSneakers: Sneaker[] | null;
}

export interface ValidationErrors {
    sneakerName?: string;
    sneakerBrand?: string;
    sneakerStatus?: string;
    sneakerSize?: string;
    sneakerCondition?: string;
    sneakerImage?: string;
    sneakerPricePaid?: string;
    sneakerDescription?: string;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface SneakerFormData {
    image: string;
    model: string;
    brand: string;
    size: number;
    condition: number;
    status: string;
    userId: string;
    price_paid: number;
    purchase_date: string;
    description: string;
    estimated_value: number;
}
