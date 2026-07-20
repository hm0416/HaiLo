import { useState } from 'react';
import { GestureResponderEvent, Linking, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getVideoBasedOnScoreController } from '@/api/controllers/recoveryController';
import { QuestionKey } from '@/api/types';

const questions: Array<{ key: QuestionKey; label: string }> = [
    { key: 'stress', label: 'How is your stress?' },
    { key: 'anxiety', label: 'How has your anxiety been?' },
    { key: 'depression', label: 'How has your depression been?' },
];

export default function MoodCheckerScreen() {

    const [responses, setResponses] = useState<Record<QuestionKey, number | null>>({
        stress: null,
        anxiety: null,
        depression: null,
    });
    const allAnswered = Object.values(responses).every((value) => value !== null);

    const selectOption = (key: QuestionKey, value: number) => {
        setResponses((current) => ({ ...current, [key]: value }));
    };

    async function handleSubmit(event: GestureResponderEvent): Promise<void> {
        if (!allAnswered) {
            return;
        }
        // call API to get suggested video based on score
        const video = await getVideoBasedOnScoreController(responses);
        if (video?.source) {
            Linking.openURL(video.source);
        }
    }

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ThemedText type="subtitle" style={styles.title}>
                    How are you feeling today on a scale of 1-5?
                </ThemedText>

                {questions.map((question) => {
                    const selectedValue = responses[question.key];

                    return (
                        <ThemedView key={question.key} style={styles.bubble}>
                            <ThemedText type="default" style={styles.question}>
                                {question.label}
                            </ThemedText>
                            <ThemedView style={styles.optionsRow}>
                                {[1, 2, 3, 4, 5].map((value) => {
                                    const isSelected = selectedValue === value;

                                    return (
                                        <Pressable
                                            key={value}
                                            onPress={() => selectOption(question.key, value)}
                                            style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                                        >
                                            <ThemedText
                                                type="smallBold"
                                                style={[styles.optionText, isSelected && styles.optionTextSelected]}
                                            >
                                                {value}
                                            </ThemedText>
                                        </Pressable>
                                    );
                                })}
                            </ThemedView>
                        </ThemedView>
                    );
                })}
                <Pressable
                    onPress={handleSubmit}
                    // disabled={!allAnswered}
                    style={[styles.submitButton, !allAnswered && styles.submitButtonDisabled]}
                >
                    <ThemedText
                        type="smallBold"
                        style={[styles.submitButtonText, !allAnswered && styles.submitButtonTextDisabled]}
                    >
                        Get Suggested Video
                    </ThemedText>
                </Pressable>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        padding: Spacing.four,
        gap: Spacing.two,
    },
    title: {
        textAlign: 'center',
        marginBottom: Spacing.one,
        fontSize: 25,
    },
    bubble: {
        width: '100%',
        maxWidth: 360,
        alignSelf: 'center',
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.three,
        borderRadius: 20,
        shadowColor: '#000000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    question: {
        marginBottom: Spacing.two,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.one,
    },
    optionButton: {
        flex: 1,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#C7C9D1',
        borderRadius: 999,
        paddingHorizontal: Spacing.one,
    },
    optionButtonSelected: {
        backgroundColor: '#3c87f7',
        borderColor: '#3c87f7',
    },
    optionText: {
        color: '#3c87f7',
    },
    optionTextSelected: {
        color: '#ffffff',
    },
    submitButton: {
        marginTop: Spacing.two,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#3c87f7',
        paddingVertical: Spacing.two,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#C7C9D1',
    },
    submitButtonText: {
        color: '#ffffff',
    },
    submitButtonTextDisabled: {
        color: '#666666',
    },
});