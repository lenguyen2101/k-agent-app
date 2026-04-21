import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Plus,
  Search,
  Sparkles,
  Square,
} from 'lucide-react-native';
import { BottomSheetModal } from '@/components/BottomSheetModal';
import { Text } from '@/components/ui/Text';
import { VoicePromptSheet } from '@/components/VoicePromptSheet';
import { palette, semantic, typography } from '@/theme';

type MsgRole = 'user' | 'ai';

type Citation = {
  id: string;
  title: string;
  source: string;     // vd "NOXH-2023.pdf · tr. 14"
};

type ChatMessage = {
  id: string;
  role: MsgRole;
  content: string;
  citations?: Citation[];
  streaming?: boolean;
};

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: 'm1',
      role: 'user',
      content: 'Sky Garden Q9 còn căn 2PN nào dưới 2 tỷ?',
    },
    {
      id: 'm2',
      role: 'ai',
      content:
        'Theo rổ hàng hiện tại, NOXH Sky Garden Q9 còn 3 căn 2PN dưới 2 tỷ:\n\n• Tòa S1.02, tầng 12, 68m² — 1,890 tỷ (view nội khu)\n• Tòa S3.01, tầng 22, 72m² — 2,150 tỷ (gần ngưỡng, có smart home)\n• Tòa S1.05, tầng 8, 65m² — 1,750 tỷ (căn góc)\n\nỞ phân khúc dưới 2 tỷ, căn S1.02 có tỉ lệ hoa hồng tốt nhất (30%).',
      citations: [
        { id: 'cite1', title: 'Sky Garden Q9 — Rổ hàng Q2/2026', source: 'listings-skygarden-q2.pdf · tr. 14' },
        { id: 'cite2', title: 'Bảng tính hoa hồng NOXH 2026', source: 'commission-noxh-2026.xlsx · sheet 2' },
      ],
    },
  ],
};

// Mock AI reply library. Simulate streaming by emitting chunks.
function mockReplyFor(prompt: string): { text: string; citations: Citation[] } {
  const p = prompt.toLowerCase();
  if (p.includes('đặt cọc') || p.includes('thanh toán')) {
    return {
      text:
        'Quy trình đặt cọc NOXH K-CITY theo Luật Nhà ở 2023:\n\n1. Khách đủ điều kiện eKYC noxh.net (CCCD + thu nhập < 11tr/tháng hoặc công nhân KCN).\n2. Đặt cọc 50 triệu (có thể gia hạn 7 ngày nếu thiếu giấy tờ).\n3. Ký hợp đồng mua bán trong 30 ngày.\n4. Thanh toán 30% khi ký HĐMB, 40% theo tiến độ, 30% khi nhận nhà.\n\nSale cần lưu: tất cả hồ sơ phải đẩy lên noxh.net trước 24h sau đặt cọc.',
      citations: [
        { id: 'c1', title: 'Quy trình giao dịch NOXH', source: 'noxh-process-2026.pdf · tr. 3-5' },
        { id: 'c2', title: 'Luật Nhà ở 2023', source: 'law-housing-2023.pdf · điều 77' },
      ],
    };
  }
  if (p.includes('điều kiện') || p.includes('mua noxh')) {
    return {
      text:
        'Điều kiện mua NOXH theo Luật Nhà ở 2023 (hiệu lực 01/08/2024):\n\n• Chưa sở hữu nhà ở tại tỉnh/TP đăng ký mua.\n• Thu nhập hộ gia đình không vượt mức chịu thuế TNCN (thu nhập tính thuế <= 11tr/tháng/người).\n• Có hộ khẩu / đăng ký tạm trú 1 năm tại TP.\n• Chưa được hỗ trợ NOXH trước đây.\n\nLưu ý: quy định mới bỏ yêu cầu cư trú đối với công nhân KCN.',
      citations: [
        { id: 'c3', title: 'Luật Nhà ở 2023 - điều kiện NOXH', source: 'law-housing-2023.pdf · điều 76' },
      ],
    };
  }
  if (p.includes('tân bình') || p.includes('chính sách')) {
    return {
      text:
        'Tân Bình Garden đang áp chính sách thanh toán:\n\n• Đặt cọc 50 triệu — giữ chỗ 14 ngày.\n• Thanh toán sớm 95% hưởng chiết khấu 3%.\n• Thanh toán theo tiến độ 8 đợt, mỗi đợt 10-15%.\n• Có hỗ trợ vay Vietcombank / BIDV lãi ưu đãi 6.8%/năm 5 năm đầu.',
      citations: [
        { id: 'c4', title: 'Chính sách bán hàng Tân Bình Garden', source: 'tanbinh-policy-2026.pdf' },
      ],
    };
  }
  return {
    text:
      'Mình ghi nhận câu hỏi. Hiện tại mình đang tra cứu dữ liệu từ knowledge base K-CITY. Thông tin tham khảo:\n\n• Rổ hàng hiện có ~8 căn đa dạng 4 dự án.\n• Mạng lưới 4 cấp của bạn có 166 MG, 80 active QA.\n\nBạn có thể hỏi cụ thể hơn về: dự án, điều kiện NOXH, chính sách thanh toán, quy trình đặt cọc, hoặc tỉ lệ hoa hồng.',
    citations: [],
  };
}

function streamText(
  fullText: string,
  onChunk: (partial: string) => void,
  onDone: () => void,
  chunkSize = 4,
  intervalMs = 25,
) {
  let i = 0;
  const t = setInterval(() => {
    i = Math.min(i + chunkSize, fullText.length);
    onChunk(fullText.slice(0, i));
    if (i >= fullText.length) {
      clearInterval(t);
      onDone();
    }
  }, intervalMs);
  return () => clearInterval(t);
}

export default function ChatConversation() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>(
    INITIAL_MESSAGES[conversationId ?? ''] ?? []
  );
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    return () => cancelRef.current?.();
  }, []);

  const sendMessage = (rawText: string) => {
    const text = rawText.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: text,
    };
    const aiId = `m-${Date.now()}-ai`;
    const { text: replyText, citations } = mockReplyFor(text);

    setMessages((ms) => [
      ...ms,
      userMsg,
      { id: aiId, role: 'ai', content: '', citations: [], streaming: true },
    ]);
    setInput('');
    setIsStreaming(true);

    cancelRef.current = streamText(
      replyText,
      (partial) => {
        setMessages((ms) =>
          ms.map((m) => (m.id === aiId ? { ...m, content: partial } : m))
        );
      },
      () => {
        setMessages((ms) =>
          ms.map((m) =>
            m.id === aiId
              ? { ...m, streaming: false, citations: citations.length ? citations : undefined }
              : m
          )
        );
        setIsStreaming(false);
        cancelRef.current = null;
      }
    );
  };

  const handleSend = () => sendMessage(input);

  // Voice transcript → auto send ngay (user yêu cầu "hỏi luôn cho nhanh")
  const handleVoiceTranscript = (text: string) => {
    sendMessage(text);
  };

  const handleStop = () => {
    cancelRef.current?.();
    cancelRef.current = null;
    setMessages((ms) =>
      ms.map((m) => (m.streaming ? { ...m, streaming: false } : m))
    );
    setIsStreaming(false);
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View
        className="bg-white border-b border-border-light flex-row items-center px-2"
        style={{ paddingTop: insets.top + 4, paddingBottom: 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
          hitSlop={8}
        >
          <ArrowLeft size={22} color={semantic.text.primary} />
        </Pressable>
        <View className="flex-1 items-center">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            K-Agent AI
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: palette.emerald[500] }}
            />
            <Text variant="caption" className="text-text-secondary">
              RAG · Knowledge base K-CITY
            </Text>
          </View>
        </View>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 14 }}
          keyboardDismissMode="on-drag"
        >
          {messages.length === 0 && <EmptyHero />}
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}
        </ScrollView>

        {/* Input bar — Claude-style: container rounded lớn, text trên, actions dưới */}
        <View
          className="px-3 pt-2 bg-white"
          style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }}
        >
          <View
            className="rounded-3xl"
            style={{
              backgroundColor: semantic.surface.alt,
              borderWidth: 1,
              borderColor: semantic.border.light,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Hỏi K-Agent AI..."
              placeholderTextColor={semantic.text.tertiary}
              multiline
              editable={!isStreaming}
              style={[
                typography.body,
                {
                  color: semantic.text.primary,
                  padding: 0,
                  minHeight: 24,
                  maxHeight: 140,
                },
              ]}
            />

            <View className="flex-row items-center justify-between mt-3">
              <Pressable
                onPress={() => setActionsOpen(true)}
                hitSlop={8}
                className="w-9 h-9 items-center justify-center"
              >
                <Plus size={22} color={semantic.text.secondary} strokeWidth={2.2} />
              </Pressable>

              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setVoiceOpen(true)}
                  disabled={isStreaming}
                  hitSlop={8}
                  className="w-9 h-9 items-center justify-center"
                  style={{ opacity: isStreaming ? 0.4 : 1 }}
                >
                  <Mic size={20} color={semantic.text.secondary} strokeWidth={2.2} />
                </Pressable>

                {isStreaming ? (
                  <Pressable
                    onPress={handleStop}
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: semantic.text.primary }}
                    hitSlop={4}
                  >
                    <Square size={13} color={palette.white} fill={palette.white} />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleSend}
                    disabled={!input.trim()}
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: input.trim() ? semantic.action.primary : semantic.border.default,
                    }}
                    hitSlop={4}
                  >
                    <ArrowUp size={18} color={palette.white} strokeWidth={2.8} />
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <VoicePromptSheet
        visible={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onTranscript={handleVoiceTranscript}
        title="Hỏi K-Agent AI bằng giọng"
        hint="Nói tự nhiên, AI sẽ chuyển văn bản và gửi ngay"
      />

      <BottomSheetModal visible={actionsOpen} onClose={() => setActionsOpen(false)}>
        <View className="px-5 pt-1 pb-8">
          <Text variant="h3" className="text-text-primary">
            Tùy chọn thêm
          </Text>
          <Text variant="caption" className="text-text-secondary mt-1">
            Sẽ bổ sung ở phase tiếp
          </Text>

          <View className="mt-4 gap-2">
            <ComingSoonRow
              icon={<Paperclip size={18} color={semantic.text.tertiary} />}
              label="Đính kèm tài liệu"
              subtitle="PDF hợp đồng, báo giá, brief khách"
            />
            <ComingSoonRow
              icon={<ImageIcon size={18} color={semantic.text.tertiary} />}
              label="Đính kèm ảnh"
              subtitle="Ảnh CCCD, sổ đỏ, nhà mẫu"
            />
            <ComingSoonRow
              icon={<Search size={18} color={semantic.text.tertiary} />}
              label="Tra cứu từ rổ hàng"
              subtitle="Ghim 1 sản phẩm để hỏi AI"
            />
            <ComingSoonRow
              icon={<Sparkles size={18} color={semantic.text.tertiary} />}
              label="Prompt templates"
              subtitle="Câu hỏi có sẵn theo tình huống"
            />
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === 'user') {
    return (
      <View className="items-end">
        <LinearGradient
          colors={[...semantic.gradient.cta]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            maxWidth: '82%',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 18,
            borderBottomRightRadius: 6,
          }}
        >
          <Text
            variant="body"
            style={{ color: palette.white, fontFamily: 'BeVietnamPro_500Medium' }}
          >
            {msg.content}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // AI
  return (
    <View className="flex-row gap-2" style={{ maxWidth: '92%' }}>
      <View
        className="w-8 h-8 rounded-full items-center justify-center"
        style={{
          backgroundColor: semantic.action.primarySoft,
          borderWidth: 1,
          borderColor: palette.sienna[100],
        }}
      >
        <Sparkles size={14} color={semantic.action.primary} strokeWidth={2.4} />
      </View>
      <View className="flex-1">
        <View
          className="px-4 py-3 rounded-2xl"
          style={{
            backgroundColor: palette.white,
            borderWidth: 1,
            borderColor: semantic.border.light,
            borderTopLeftRadius: 6,
            shadowColor: palette.obsidian[900],
            shadowOpacity: 0.04,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1,
          }}
        >
          <Text variant="body" className="text-text-primary">
            {msg.content}
            {msg.streaming && (
              <Text
                variant="body"
                style={{ color: semantic.action.primary, fontFamily: 'BeVietnamPro_700Bold' }}
              >
                {' '}▊
              </Text>
            )}
          </Text>
        </View>

        {msg.citations && msg.citations.length > 0 && (
          <View className="mt-2 gap-1.5">
            <Text
              variant="caption"
              style={{
                color: semantic.text.tertiary,
                fontFamily: 'BeVietnamPro_600SemiBold',
                letterSpacing: 0.5,
                fontSize: 10,
              }}
            >
              NGUỒN THAM KHẢO
            </Text>
            {msg.citations.map((c) => (
              <Pressable
                key={c.id}
                className="flex-row items-center gap-2 p-2.5 rounded-xl"
                style={{
                  backgroundColor: palette.white,
                  borderWidth: 1,
                  borderColor: semantic.border.light,
                }}
              >
                <View
                  className="w-7 h-7 rounded-lg items-center justify-center"
                  style={{ backgroundColor: semantic.action.primarySoft }}
                >
                  <FileText size={13} color={semantic.action.primaryDeep} strokeWidth={2.2} />
                </View>
                <View className="flex-1">
                  <Text
                    variant="caption"
                    style={{
                      color: semantic.text.primary,
                      fontFamily: 'BeVietnamPro_600SemiBold',
                      fontSize: 12,
                    }}
                    numberOfLines={1}
                  >
                    {c.title}
                  </Text>
                  <Text variant="caption" className="text-text-tertiary" numberOfLines={1}>
                    {c.source}
                  </Text>
                </View>
                <ExternalLink size={13} color={semantic.text.tertiary} />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function ComingSoonRow({
  icon,
  label,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
}) {
  return (
    <View
      className="p-3 rounded-2xl flex-row items-center gap-3"
      style={{
        backgroundColor: semantic.surface.alt,
        borderWidth: 1,
        borderColor: semantic.border.light,
        opacity: 0.7,
      }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: palette.white }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          variant="body"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
        >
          {label}
        </Text>
        <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View
        className="px-2 py-0.5 rounded-full"
        style={{ backgroundColor: palette.sienna[100] }}
      >
        <Text
          variant="caption"
          style={{
            color: palette.sienna[700],
            fontFamily: 'BeVietnamPro_700Bold',
            fontSize: 10,
            letterSpacing: 0.3,
          }}
        >
          SẮP RA MẮT
        </Text>
      </View>
    </View>
  );
}

function EmptyHero() {
  return (
    <View className="items-center py-8">
      <View
        className="w-16 h-16 rounded-3xl items-center justify-center mb-3"
        style={{
          backgroundColor: semantic.action.primarySoft,
          borderWidth: 1,
          borderColor: palette.sienna[100],
        }}
      >
        <Sparkles size={28} color={semantic.action.primary} strokeWidth={2.2} />
      </View>
      <Text variant="h2" className="text-text-title">
        K-Agent AI
      </Text>
      <Text variant="body" className="text-text-secondary text-center mt-1 px-6">
        Hỏi về rổ hàng, NOXH, chính sách giá{'\n'}hoặc tra cứu luật nhà ở 2023.
      </Text>
    </View>
  );
}
