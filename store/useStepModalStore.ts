import { create } from 'zustand';
import { ModalStep } from '@/components/modals/SneakersModal/types';

interface StepModalStore {
	modalStep: ModalStep;
	setModalStep: (step: ModalStep) => void;
}

export const useStepModalStore = create<StepModalStore>((set) => ({
	modalStep: 'index',
	setModalStep: (step) => set({ modalStep: step }),
}));
