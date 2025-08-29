import React, { useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import {
	Alert,
	Modal,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
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
	const stepsInputRef = useRef<TextInput>(null);
	const expectedInputRef = useRef<TextInput>(null);
	const actualInputRef = useRef<TextInput>(null);

	const { t } = useTranslation();
	const { handleReportBugSubmit, priorityOptions, colorConfig } =
		useBugReport();
	const { isVisible, isLoading, errorMsg, resetStore, updateFormData } =
		useBugReportStore();

	const formController = useFormController<BugReportFormData>({
		schema: createBugReportSchema(),
		fieldNames: [
			'title',
			'description',
			'stepsToReproduce',
			'expectedBehavior',
			'actualBehavior',
			'priority',
		],
		authErrorMsg: errorMsg,
		defaultValues: {
			title: '',
			description: '',
			stepsToReproduce: '',
			expectedBehavior: '',
			actualBehavior: '',
			deviceInfo: '',
			priority: 'medium',
		},
	});

	const {
		control,
		handleFieldFocus,
		validateFieldOnBlur,
		getFieldError,
		reset,
		trigger,
		watch,
		displayedError,
		getFieldErrorWrapper,
		setValue,
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
			presentationStyle="pageSheet"
			onRequestClose={handleClose}
		>
			<View className="flex-1 bg-background">
				<View className="flex-row items-center justify-center p-5 pl-12 border-b bg-white border-gray-200">
					<View className="absolute left-4">
						<BackButton onPressAction={handleClose} />
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
							label={t('settings.bugReport.fields.title.label')}
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
								await validateFieldOnBlur('description', value);
							}}
							error={getFieldErrorWrapper('description')}
							getFieldError={getFieldErrorWrapper}
							nextInputRef={stepsInputRef}
							maxLength={500}
							multiline
							testID="bug-description"
						/>

						<FormTextInput
							ref={stepsInputRef}
							name="stepsToReproduce"
							control={control}
							label={t(
								'settings.bugReport.fields.stepsToReproduce.label'
							)}
							placeholder={t(
								'settings.bugReport.fields.stepsToReproduce.placeholder'
							)}
							onFocus={() => handleFieldFocus('stepsToReproduce')}
							onBlur={async (value) => {
								await validateFieldOnBlur(
									'stepsToReproduce',
									value
								);
							}}
							error={getFieldErrorWrapper('stepsToReproduce')}
							getFieldError={getFieldErrorWrapper}
							nextInputRef={expectedInputRef}
							maxLength={500}
							multiline
							testID="bug-steps"
						/>

						<FormTextInput
							ref={expectedInputRef}
							name="expectedBehavior"
							control={control}
							label={t(
								'settings.bugReport.fields.expectedBehavior.label'
							)}
							placeholder={t(
								'settings.bugReport.fields.expectedBehavior.placeholder'
							)}
							onFocus={() => handleFieldFocus('expectedBehavior')}
							onBlur={async (value) => {
								await validateFieldOnBlur(
									'expectedBehavior',
									value
								);
							}}
							error={getFieldErrorWrapper('expectedBehavior')}
							getFieldError={getFieldErrorWrapper}
							nextInputRef={actualInputRef}
							maxLength={300}
							multiline
							testID="bug-expected"
						/>

						<FormTextInput
							ref={actualInputRef}
							name="actualBehavior"
							control={control}
							label={t(
								'settings.bugReport.fields.actualBehavior.label'
							)}
							placeholder={t(
								'settings.bugReport.fields.actualBehavior.placeholder'
							)}
							onFocus={() => handleFieldFocus('actualBehavior')}
							onBlur={async (value) => {
								await validateFieldOnBlur(
									'actualBehavior',
									value
								);
							}}
							error={getFieldErrorWrapper('actualBehavior')}
							getFieldError={getFieldErrorWrapper}
							maxLength={300}
							multiline
							testID="bug-actual"
						/>

						<View className="mb-4">
							<Text className="text-lg font-semibold mb-2 text-gray-800">
								{t('settings.bugReport.fields.priority.label')}
							</Text>
							<View className="flex-row gap-4">
								{priorityOptions.map((option) => {
									const isSelected =
										watch('priority') === option.value;
									const colors =
										colorConfig[
											option.value as keyof typeof colorConfig
										];

									const buttonClasses = isSelected
										? `${colors.bg} ${colors.border}`
										: 'bg-white border-gray-200';

									const textClasses = isSelected
										? colors.text
										: 'text-gray-700';

									return (
										<TouchableOpacity
											key={option.value}
											onPress={() =>
												setValue(
													'priority',
													option.value as
														| 'low'
														| 'medium'
														| 'high'
												)
											}
											className={`px-4 py-2 rounded-md border ${buttonClasses}`}
											testID={`priority-${option.value}`}
										>
											<Text
												className={`text-base ${textClasses}`}
											>
												{option.label}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>

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
		</Modal>
	);
};
