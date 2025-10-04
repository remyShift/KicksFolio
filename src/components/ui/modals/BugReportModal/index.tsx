import React, { useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Ionicons } from '@expo/vector-icons';

import BackButton from '@/components/ui/buttons/BackButton';
import MainButton from '@/components/ui/buttons/MainButton';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useFormController } from '@/hooks/form/useFormController';
import {
	BugReportFormData,
	useBugReportStore,
} from '@/store/useBugReportStore';
import { createBugReportSchema } from '@/validation/schemas';

import useBugReport from './hooks/useBugReport';

export const BugReportModal: React.FC = () => {
	const scrollViewRef = useRef<ScrollView>(null);
	const titleInputRef = useRef<TextInput>(null);
	const descriptionInputRef = useRef<TextInput>(null);

	const { t } = useTranslation();
	const { handleReportBugSubmit } = useBugReport();
	const { isVisible, isLoading, errorMsg, resetStore, updateFormData } =
		useBugReportStore();

	const formController = useFormController<BugReportFormData>({
		schema: createBugReportSchema(),
		fieldNames: ['title', 'description'],
		authErrorMsg: errorMsg,
		defaultValues: {
			title: '',
			description: '',
			deviceInfo: '',
			priority: 'medium',
		},
	});

	const {
		control,
		handleFieldFocus,
		validateFieldOnBlur,
		watch,
		displayedError,
		getFieldErrorWrapper,
	} = formController;

	useEffect(() => {
		const subscription = watch((value) => {
			updateFormData(value as BugReportFormData);
		});
		return () => subscription.unsubscribe();
	}, [watch, updateFormData]);

	const handleClose = () => {
		Alert.alert(
			t('alert.titles.bugReport'),
			t('alert.descriptions.bugReport'),
			[
				{
					text: t('alert.choices.cancel'),
					style: 'cancel',
				},
				{
					text: t('alert.choices.leave'),
					style: 'destructive',
					onPress: () => resetStore(),
				},
			]
		);
	};

	if (!isVisible) return null;

	return (
		<Modal
			visible={isVisible}
			animationType="slide"
			transparent={true}
			onRequestClose={handleClose}
		>
			<View style={styles.modalOverlay}>
				<View
					style={styles.modalContent}
					className="bg-background overflow-hidden"
				>
					<View className="flex-row items-center justify-center p-5 pl-12 border-b bg-white border-gray-200">
						<View className="absolute left-4">
							<BackButton
								onPressAction={handleClose}
								border={false}
							/>
						</View>
						<Text className="text-xl font-bold text-gray-900 text-center">
							{t('settings.bugReport.modal.title')}
						</Text>
						<View className="w-8" />
					</View>

					<View className="bg-blue-50 p-4 rounded-b-lg border border-blue-200">
						<View className="flex-row items-start">
							<Ionicons
								name="information-circle"
								size={20}
								color="#3B82F6"
							/>
							<Text className="ml-2 text-sm text-blue-700 flex-1">
								{t('settings.bugReport.modal.infoText')}
							</Text>
						</View>
					</View>

					<KeyboardAwareScrollView
						ref={scrollViewRef}
						className="flex-1"
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{
							flexGrow: 1,
							padding: 8,
						}}
						bottomOffset={10}
					>
						<View className="flex flex-col gap-6 px-4">
							<ErrorMsg
								content={displayedError}
								display={displayedError ? true : false}
							/>

							<FormTextInput
								ref={titleInputRef}
								name="title"
								control={control}
								label={t(
									'settings.bugReport.fields.title.label'
								)}
								placeholder={t(
									'settings.bugReport.fields.title.placeholder'
								)}
								onFocus={() => handleFieldFocus('title')}
								onBlur={async (value) => {
									await validateFieldOnBlur('title', value);
								}}
								error={getFieldErrorWrapper('title')}
								getFieldError={getFieldErrorWrapper}
								nextInputRef={descriptionInputRef}
								maxLength={100}
								testID="bug-title"
							/>

							<FormTextInput
								ref={descriptionInputRef}
								name="description"
								control={control}
								label={t(
									'settings.bugReport.fields.description.label'
								)}
								placeholder={t(
									'settings.bugReport.fields.description.placeholder'
								)}
								onFocus={() => handleFieldFocus('description')}
								onBlur={async (value) => {
									await validateFieldOnBlur(
										'description',
										value
									);
								}}
								error={getFieldErrorWrapper('description')}
								getFieldError={getFieldErrorWrapper}
								maxLength={1000}
								multiline
								numberOfLines={12}
								testID="bug-description"
							/>

							<View className="flex flex-row justify-center mb-6">
								<MainButton
									content={t(
										'settings.bugReport.modal.submitButton'
									)}
									onPressAction={handleReportBugSubmit}
									isDisabled={isLoading}
									backgroundColor="bg-primary"
								/>
							</View>
						</View>
					</KeyboardAwareScrollView>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContent: {
		height: '75%',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
});
