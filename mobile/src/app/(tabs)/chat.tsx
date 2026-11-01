import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Badge } from '../../components/common';
import { Colors } from '../../theme/colors';
import { chatService } from '../../api/services';
import { ChatMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';

const QUICK_PROMPTS = [
  { label: 'తెలుగు: ఖర్చులు', text: 'ఈరోజు నా ఖర్చులు ఎంత అయ్యాయో చూపించు' },
  { label: 'Tanglish: Health', text: 'eeroju naaku alasata ga undi mood baaledhu' },
  { label: 'Astrology (T1)', text: 'Can you show my birth chart and planetary positions?' },
  { label: 'Astrologers', text: 'Show me the list of available astrologers' },
  { label: 'Habits (T1)', text: 'What is my current habit streak?' },
];

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Initial welcome message from assistant
    setMessages([
      {
        id: -1,
        conversation_id: 0,
        sender: 'assistant',
        text:
          user?.preferred_language === 'te'
            ? 'నమస్కారం! నేను AVARA AI సహాయకుడిని. మీరు తెలుగు, English, లేదా Tanglish లో అడగవచ్చు. మీ ఖర్చులు, ఆరోగ్యం, లేదా జ్యోతిష్య సేవల గురించి ఏమైనా సందేహాలు ఉంటే అడగండి.'
            : 'Namaskaram! I am your AVARA AI companion. I speak Telugu script, English, and Tanglish. Feel free to ask about your expenses, daily wellness, or consultation booking.',
        detected_language: user?.preferred_language === 'te' ? 'telugu' : 'english',
        safety_status: 'safe',
        clarification_needed: false,
        created_at: new Date().toISOString(),
      },
    ]);
  }, [user]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() || loading) return;

    const optimisticId = Date.now();
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      conversation_id: conversationId || 0,
      sender: 'user',
      text: textToSend.trim(),
      safety_status: 'safe',
      clarification_needed: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    if (!overrideText) setInputText('');
    setLoading(true);

    try {
      const resp = await chatService.sendMessage(textToSend.trim(), conversationId);
      if (resp.conversation_id && !conversationId) {
        setConversationId(resp.conversation_id);
      }
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticId),
        resp.user_message,
        resp.assistant_message,
      ]);
    } catch (err: any) {
      Alert.alert('Chat Error', err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    const isCrisis = item.safety_status === 'crisis';
    const isAdvisory = item.safety_status === 'advisory';

    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAsst]}>
        {!isUser ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAsst,
            isCrisis && styles.bubbleCrisis,
            isAdvisory && styles.bubbleAdvisory,
          ]}
        >
          {/* Metadata badges for Language and Intent Routing */}
          <View style={styles.badgeRow}>
            {item.detected_language ? (
              <Badge
                label={item.detected_language.toUpperCase()}
                bgColor={
                  item.detected_language === 'telugu'
                    ? Colors.tagTelugu
                    : item.detected_language === 'tanglish'
                    ? Colors.tagTanglish
                    : Colors.tagEnglish
                }
                color="#FFF"
                size="sm"
              />
            ) : null}

            {item.route_target ? (
              <Badge
                label={`→ ${item.route_target}`}
                bgColor={Colors.elevated}
                color={Colors.secondary}
                size="sm"
              />
            ) : null}

            {isCrisis ? (
              <Badge label="EMERGENCY ALERT" bgColor={Colors.danger} color="#FFF" size="sm" />
            ) : null}
          </View>

          <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{item.text}</Text>

          {isCrisis ? (
            <View style={styles.crisisBox}>
              <Text style={styles.crisisTitle}>🚨 Need Immediate Support?</Text>
              <Text style={styles.crisisText}>Tele-MANAS: 14416 (Toll-Free 24x7)</Text>
              <Text style={styles.crisisText}>National Emergency: 112</Text>
            </View>
          ) : null}

          <Text style={styles.msgTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScreenHeader
        title="AVARA AI"
        subtitle="Telugu • English • Tanglish NLP Assistant"
        rightAction={
          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() => {
              setConversationId(undefined);
              setMessages([]);
            }}
          >
            <Ionicons name="refresh" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      {/* Quick Prompts Bar */}
      <View style={styles.promptsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_PROMPTS}
          keyExtractor={(item, i) => String(i)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.promptChip}
              onPress={() => handleSend(item.text)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptChipText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Composer */}
      <View style={styles.composerBar}>
        <TextInput
          style={styles.composerInput}
          placeholder="Type in Telugu script, Tanglish, or English..."
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  newChatBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  promptsContainer: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  promptChip: {
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '86%',
  },
  msgRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  msgRowAsst: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bubble: {
    borderRadius: 16,
    padding: 14,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAsst: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleCrisis: {
    backgroundColor: '#38161D',
    borderColor: Colors.danger,
    borderWidth: 1.5,
  },
  bubbleAdvisory: {
    backgroundColor: '#332314',
    borderColor: Colors.warning,
    borderWidth: 1.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  msgText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  msgTextUser: {
    color: '#FFF',
  },
  crisisBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: Colors.dangerBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  crisisTitle: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  crisisText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  msgTime: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.card,
  },
  composerInput: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
