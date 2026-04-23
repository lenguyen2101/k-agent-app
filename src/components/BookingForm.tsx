import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cdnImage, IMG_SIZE } from '@/lib/img';
import {
  ArrowLeft,
  Banknote,
  Bath,
  Bed,
  Check,
  ChevronRight,
  CircleCheck,
  Link2,
  Phone,
  Ruler,
  ScanLine,
  ShieldCheck,
  User,
  UserSearch,
  Wallet,
  X,
} from 'lucide-react-native';
import { BottomSheetModal } from './BottomSheetModal';
import { StatusBadge } from './StatusBadge';
import { Text } from './ui/Text';
import { formatPhone, formatPricePerM2, formatVND } from '@/lib/format';
import { primaryProjects } from '@/mock/primaryProjects';
import { useBookings } from '@/store/bookings';
import { useLeads } from '@/store/leads';
import { palette, semantic } from '@/theme';
import { statusToGroup, type Lead } from '@/types/lead';

type PaymentMethod = 'TRANSFER' | 'CASH';

const DEPOSIT_PRESETS = [
  { value: 10_000_000, label: '10 triệu' },
  { value: 20_000_000, label: '20 triệu' },
  { value: 30_000_000, label: '30 triệu' },
  { value: 50_000_000, label: '50 triệu' },
];

export type BookingFormProps = {
  initialProjectId?: string;
  initialTowerId?: string;
  initialUnitId?: string;
  initialUnitCode?: string;
  initialLeadId?: string;
  /** Khi link từ lead detail, không cho unlink/pick lead khác — đảm bảo booking chắc chắn gắn với lead. */
  lockLead?: boolean;
  /** Được gọi khi sale submit thành công hoặc back. */
  onClose: () => void;
  onSuccess?: (bookingId: string) => void;
};

export function BookingForm({
  initialProjectId,
  initialTowerId,
  initialUnitId,
  initialUnitCode,
  initialLeadId,
  lockLead = false,
  onClose,
  onSuccess,
}: BookingFormProps) {
  const createBooking = useBookings((s) => s.createBooking);
  const addActivity = useLeads((s) => s.addActivity);
  const setLeadStatus = useLeads((s) => s.setStatus);
  const leads = useLeads((s) => s.leads);
  const insets = useSafeAreaInsets();

  // Lead link
  const [linkedLeadId, setLinkedLeadId] = useState<string | undefined>(initialLeadId);
  const linkedLead = useMemo(
    () => leads.find((l) => l.id === linkedLeadId),
    [leads, linkedLeadId]
  );
  const [leadPickerOpen, setLeadPickerOpen] = useState(false);

  // Customer info (autofill khi có linkedLead)
  const [fullName, setFullName] = useState(linkedLead?.fullName ?? '');
  const [phone, setPhone] = useState(linkedLead?.phone ?? '');
  const [email, setEmail] = useState('');
  const [cccd, setCccd] = useState('');

  useEffect(() => {
    if (linkedLead) {
      setFullName(linkedLead.fullName);
      setPhone(linkedLead.phone);
    }
  }, [linkedLead]);

  // Wizard 2-step — Bước 1: chọn project · Bước 2: tower/unit/khách/cọc/ghi chú.
  // Nếu đã có initialProjectId (mở form từ project/unit detail) → skip sang details.
  const [step, setStep] = useState<'project' | 'details'>(
    initialProjectId ? 'details' : 'project'
  );

  // Product selection: Project → Tower (optional) → Unit Type
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(initialProjectId);
  const [selectedTowerId, setSelectedTowerId] = useState<string | undefined>(initialTowerId);
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(initialUnitId);
  const [selectedUnitCode] = useState<string | undefined>(initialUnitCode);

  const selectedProject = useMemo(
    () => primaryProjects.find((p) => p.id === selectedProjectId),
    [selectedProjectId]
  );
  const selectedTower = useMemo(
    () => selectedProject?.towers.find((t) => t.id === selectedTowerId),
    [selectedProject, selectedTowerId]
  );
  // Nếu đã chọn tower → chỉ hiển thị unit type thuộc tower đó
  const availableUnitTypes = useMemo(() => {
    if (!selectedProject) return [];
    if (!selectedTower?.unitTypeIds) return selectedProject.unitTypes;
    return selectedProject.unitTypes.filter((u) =>
      selectedTower.unitTypeIds!.includes(u.id)
    );
  }, [selectedProject, selectedTower]);
  const selectedUnit = useMemo(
    () => availableUnitTypes.find((u) => u.id === selectedUnitId),
    [availableUnitTypes, selectedUnitId]
  );

  // Reset tower + unit khi đổi project
  useEffect(() => {
    if (selectedProjectId !== initialProjectId) {
      setSelectedTowerId(undefined);
      setSelectedUnitId(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  // Reset unit khi đổi tower (nếu unit hiện tại không thuộc tower mới)
  useEffect(() => {
    if (selectedUnitId && !availableUnitTypes.some((u) => u.id === selectedUnitId)) {
      setSelectedUnitId(undefined);
    }
  }, [availableUnitTypes, selectedUnitId]);

  // Deposit + payment + notes
  const [depositAmount, setDepositAmount] = useState(20_000_000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFER');
  const [notes, setNotes] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Submit-triggered validation — chỉ hiện lỗi sau khi user bấm Submit
  // (tránh hiển thị đỏ ngay khi user mới mở form, chưa kịp điền).
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fieldErrors = {
    fullName: fullName.trim().length === 0 ? 'Vui lòng nhập họ tên khách' : undefined,
    phone:
      phone.trim().length === 0
        ? 'Vui lòng nhập số điện thoại'
        : phone.trim().length < 9
        ? 'Số điện thoại không hợp lệ'
        : undefined,
  };

  const canSubmit =
    !!selectedProject &&
    !!selectedUnit &&
    !fieldErrors.fullName &&
    !fieldErrors.phone &&
    depositAmount > 0 &&
    agreed;

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!canSubmit || !selectedProject || !selectedUnit) return;

    const booking = createBooking({
      leadId: linkedLeadId,
      projectId: selectedProject.id,
      projectName: selectedProject.shortName,
      unitTypeId: selectedUnit.id,
      unitTypeName: selectedUnit.name,
      unitCode: selectedUnitCode,
      customerName: fullName.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || undefined,
      customerCccd: cccd.trim() || undefined,
      depositVnd: depositAmount,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    if (linkedLeadId && linkedLead) {
      const unitRef = selectedUnitCode
        ? `${selectedUnit.name} · căn ${selectedUnitCode}`
        : selectedUnit.name;
      addActivity({
        leadId: linkedLeadId,
        type: 'BOOKING_CREATED',
        content: `Booking ${unitRef} tại ${selectedProject.shortName} · cọc ${formatVND(depositAmount)}`,
      });
      const shouldBump =
        linkedLead.status !== 'CONTRACTED' &&
        linkedLead.status !== 'CLOSED_WON' &&
        linkedLead.status !== 'CLOSED_LOST';
      if (shouldBump) setLeadStatus(linkedLeadId, 'DEPOSITED');
    }

    onSuccess?.(booking.id);

    const linkNote = linkedLead
      ? `\n\nĐã liên kết với lead ${linkedLead.fullName} — lead tự động chuyển sang "Đã cọc".`
      : '';

    Alert.alert(
      'Gửi booking thành công',
      `Đã gửi yêu cầu booking ${selectedUnit.name}${
        selectedUnitCode ? ` · căn ${selectedUnitCode}` : ''
      } tới CĐT ${selectedProject.developer}.\n\nMã booking: ${booking.id}${linkNote}`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  // Step 1 — chỉ hiển thị project picker (rich card) + progress indicator.
  // Không render phần còn lại → scroll nhẹ, chọn 1 tap → auto-advance step 2.
  if (step === 'project') {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <StepProgress current={1} total={2} label="Chọn dự án" />

          <View className="px-4 pt-2 pb-3">
            <Text
              variant="h3"
              style={{ color: semantic.text.primary }}
            >
              Chọn dự án muốn đặt chỗ
            </Text>
          </View>

          <View className="px-4 gap-2.5">
            {primaryProjects.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => {
                  setSelectedProjectId(p.id);
                  setStep('details');
                }}
                className="rounded-2xl overflow-hidden flex-row items-center gap-3 p-3"
                style={{
                  backgroundColor: palette.white,
                  borderWidth: 1,
                  borderColor: semantic.border.light,
                }}
              >
                <Image
                  source={{ uri: cdnImage(p.gallery[0], IMG_SIZE.rowThumb) }}
                  style={{ width: 64, height: 64, borderRadius: 12 }}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="memory-disk"
                />
                <View className="flex-1">
                  <Text
                    variant="body"
                    style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
                    numberOfLines={1}
                  >
                    {p.shortName}
                  </Text>
                  <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
                    {p.district} · {p.province}
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: palette.emerald[700],
                      fontFamily: 'BeVietnamPro_700Bold',
                      marginTop: 4,
                    }}
                  >
                    {formatPricePerM2(p.pricePerM2Min).replace('~', '')} -{' '}
                    {formatPricePerM2(p.pricePerM2Max).replace('~', '')}
                  </Text>
                </View>
                <ChevronRight size={18} color={semantic.text.tertiary} strokeWidth={2.2} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  const content = (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StepProgress current={2} total={2} label="Hoàn tất booking" />

        {/* Selected project banner + Đổi back to step 1 */}
        {selectedProject && (
          <View className="bg-white px-4 py-3 border-b border-border-light">
            <Pressable
              onPress={() => setStep('project')}
              className="flex-row items-center gap-2 mb-2"
              hitSlop={4}
            >
              <ArrowLeft size={14} color={semantic.action.primaryDeep} strokeWidth={2.4} />
              <Text
                variant="badge"
                style={{ color: semantic.action.primaryDeep }}
              >
                Đổi dự án
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: cdnImage(selectedProject.gallery[0], IMG_SIZE.avatar) }}
                style={{ width: 44, height: 44, borderRadius: 10 }}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
              />
              <View className="flex-1">
                <Text
                  variant="body"
                  style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
                  numberOfLines={1}
                >
                  {selectedProject.shortName}
                </Text>
                <Text variant="caption" className="text-text-secondary" numberOfLines={1}>
                  {selectedProject.district} · {selectedProject.province}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Section: Tòa + Loại căn (chỉ show khi có project) */}
        {selectedProject && (
          <View className="bg-white mt-3 px-4 py-5">
            <SectionTitle step="1" title="Tòa & loại căn" />

            {/* Tòa picker (optional) */}
            <Text
              variant="label"
              style={{
                color: semantic.text.secondary,
                marginTop: 14,
                marginBottom: 8,
              }}
            >
              Tòa (tùy chọn)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <ChipOption
                label="Tất cả"
                active={!selectedTowerId}
                onPress={() => setSelectedTowerId(undefined)}
              />
              {selectedProject.towers.map((t) => (
                <ChipOption
                  key={t.id}
                  label={t.name.replace('Tòa ', '')}
                  active={selectedTowerId === t.id}
                  onPress={() => setSelectedTowerId(t.id)}
                />
              ))}
            </View>

            {/* Unit type cards */}
            <Text
              variant="label"
              style={{
                color: semantic.text.secondary,
                marginTop: 18,
                marginBottom: 8,
              }}
            >
              Loại căn <Text style={{ color: palette.red[500] }}>*</Text>
            </Text>
            <View className="gap-2">
              {availableUnitTypes.map((u) => {
                const active = selectedUnitId === u.id;
                return (
                  <Pressable
                    key={u.id}
                    onPress={() => setSelectedUnitId(u.id)}
                    className="p-3 rounded-2xl flex-row items-center gap-3"
                    style={{
                      backgroundColor: active ? semantic.action.primarySoft : palette.white,
                      borderWidth: 1,
                      borderColor: active ? semantic.action.primary : semantic.border.light,
                    }}
                  >
                    <Image
                      source={{ uri: cdnImage(u.floorplanImage, IMG_SIZE.rowThumb) }}
                      style={{ width: 56, height: 56, borderRadius: 10 }}
                      contentFit="cover"
                      transition={150}
                      cachePolicy="memory-disk"
                    />
                    <View className="flex-1">
                      <Text
                        variant="subtitle"
                        style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
                      >
                        {u.name} · {u.areaMin}-{u.areaMax}m²
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        {u.bedrooms > 0 && (
                          <View className="flex-row items-center gap-0.5">
                            <Bed size={11} color={semantic.text.tertiary} />
                            <Text variant="caption" className="text-text-secondary">
                              {u.bedrooms}PN
                            </Text>
                          </View>
                        )}
                        <View className="flex-row items-center gap-0.5">
                          <Bath size={11} color={semantic.text.tertiary} />
                          <Text variant="caption" className="text-text-secondary">
                            {u.bathrooms}WC
                          </Text>
                        </View>
                        <Text variant="caption" className="text-text-tertiary">·</Text>
                        <Text
                          variant="caption"
                          style={{
                            color: palette.emerald[700],
                            fontFamily: 'BeVietnamPro_700Bold',
                          }}
                        >
                          {formatPricePerM2(u.pricePerM2Min).replace('~', '')}
                        </Text>
                      </View>
                    </View>
                    {active && (
                      <CircleCheck size={18} color={semantic.action.primary} strokeWidth={2.4} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {selectedUnitCode && (
              <View
                className="mt-3 px-3 py-2 rounded-xl flex-row items-center gap-1.5 self-start"
                style={{ backgroundColor: palette.emerald[50] }}
              >
                <Ruler size={12} color={palette.emerald[700]} strokeWidth={2.4} />
                <Text
                  variant="caption"
                  style={{ color: palette.emerald[700], fontFamily: 'BeVietnamPro_700Bold' }}
                >
                  Căn {selectedUnitCode}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Section: Thông tin khách */}
        <View className="bg-white mt-3 px-4 py-5">
          <SectionTitle step="2" title="Thông tin khách hàng" />

          {linkedLead ? (
            <View
              className="mt-4 p-3 rounded-2xl flex-row items-center gap-3"
              style={{
                backgroundColor: palette.emerald[50],
                borderWidth: 1,
                borderColor: palette.emerald[100],
              }}
            >
              <View
                className="w-9 h-9 rounded-xl items-center justify-center"
                style={{ backgroundColor: palette.white }}
              >
                <Link2 size={16} color={palette.emerald[700]} strokeWidth={2.4} />
              </View>
              <View className="flex-1">
                <Text variant="badge" style={{ color: palette.emerald[700] }}>
                  Đang booking cho lead
                </Text>
                <Text
                  variant="subtitle"
                  style={{
                    color: semantic.text.primary,
                    fontFamily: 'BeVietnamPro_700Bold',
                    marginTop: 1,
                  }}
                  numberOfLines={1}
                >
                  {linkedLead.fullName} · {formatPhone(linkedLead.phone)}
                </Text>
              </View>
              {!lockLead && (
                <Pressable
                  onPress={() => setLinkedLeadId(undefined)}
                  hitSlop={8}
                  className="w-8 h-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.white }}
                >
                  <X size={14} color={semantic.text.secondary} strokeWidth={2.4} />
                </Pressable>
              )}
            </View>
          ) : (
            !lockLead && (
              <Pressable
                onPress={() => setLeadPickerOpen(true)}
                className="mt-4 p-3 rounded-2xl flex-row items-center gap-3"
                style={{
                  backgroundColor: semantic.action.primarySoft,
                  borderWidth: 1,
                  borderColor: palette.sienna[100],
                  borderStyle: 'dashed',
                }}
              >
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center"
                  style={{ backgroundColor: palette.white }}
                >
                  <UserSearch size={16} color={semantic.action.primaryDeep} strokeWidth={2.4} />
                </View>
                <View className="flex-1">
                  <Text
                    variant="subtitle"
                    style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_700Bold' }}
                  >
                    Chọn từ lead
                  </Text>
                  <Text variant="caption" className="text-text-secondary mt-0.5">
                    Tự động điền tên, SĐT và liên kết booking
                  </Text>
                </View>
              </Pressable>
            )
          )}

          <View className="mt-4 gap-3">
            <Field
              icon={<User size={15} color={semantic.text.tertiary} />}
              label="Họ và tên"
              required
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nguyễn Văn A"
              error={submitAttempted ? fieldErrors.fullName : undefined}
            />
            <Field
              icon={<Phone size={15} color={semantic.text.tertiary} />}
              label="Số điện thoại"
              required
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="0901 234 567"
              error={submitAttempted ? fieldErrors.phone : undefined}
            />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="email@example.com"
            />
            <Field
              icon={<ScanLine size={15} color={semantic.text.tertiary} />}
              label="Số CCCD"
              value={cccd}
              onChangeText={setCccd}
              keyboardType="number-pad"
              placeholder="079xxxxxxxxx"
              rightSlot={
                <Pressable
                  onPress={() => router.push('/(modal)/scanner')}
                  className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg"
                  style={{ backgroundColor: semantic.action.primarySoft }}
                >
                  <ScanLine size={12} color={semantic.action.primaryDeep} strokeWidth={2.4} />
                  <Text
                    variant="caption"
                    style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_700Bold' }}
                  >
                    Quét
                  </Text>
                </Pressable>
              }
            />
          </View>
        </View>

        {/* Section: Cọc */}
        <View className="bg-white mt-3 px-4 py-5">
          <SectionTitle step="3" title="Tiền đặt cọc giữ chỗ" />
          <View className="flex-row flex-wrap gap-2 mt-4">
            {DEPOSIT_PRESETS.map((p) => {
              const active = depositAmount === p.value;
              return (
                <Pressable
                  key={p.value}
                  onPress={() => setDepositAmount(p.value)}
                  className="px-4 h-11 rounded-xl items-center justify-center border flex-1"
                  style={{
                    minWidth: 90,
                    backgroundColor: active ? semantic.action.primarySoft : palette.white,
                    borderColor: active ? semantic.action.primary : semantic.border.default,
                  }}
                >
                  <Text
                    variant="subtitle"
                    style={{
                      color: active ? semantic.action.primaryDeep : semantic.text.primary,
                      fontFamily: 'BeVietnamPro_700Bold',
                    }}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text variant="caption" className="text-text-tertiary mt-3">
            Đặt cọc được hoàn 100% nếu khách huỷ booking trong vòng 7 ngày.
          </Text>

          <View className="mt-5">
            <Text
              variant="label"
              style={{ color: semantic.text.secondary, marginBottom: 8 }}
            >
              Phương thức thanh toán
            </Text>
            <View className="flex-row gap-2">
              <PaymentOption
                active={paymentMethod === 'TRANSFER'}
                onPress={() => setPaymentMethod('TRANSFER')}
                icon={
                  <Banknote
                    size={16}
                    color={
                      paymentMethod === 'TRANSFER'
                        ? semantic.action.primaryDeep
                        : semantic.text.secondary
                    }
                    strokeWidth={2.2}
                  />
                }
                label="Chuyển khoản"
              />
              <PaymentOption
                active={paymentMethod === 'CASH'}
                onPress={() => setPaymentMethod('CASH')}
                icon={
                  <Wallet
                    size={16}
                    color={
                      paymentMethod === 'CASH'
                        ? semantic.action.primaryDeep
                        : semantic.text.secondary
                    }
                    strokeWidth={2.2}
                  />
                }
                label="Tiền mặt"
              />
            </View>
          </View>
        </View>

        {/* Section: Ghi chú */}
        <View className="bg-white mt-3 px-4 py-5">
          <SectionTitle step="4" title="Ghi chú cho CĐT" />
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Yêu cầu thêm về căn hộ, lịch xem nhà, hỗ trợ vay ngân hàng..."
            placeholderTextColor={semantic.text.tertiary}
            multiline
            textAlignVertical="top"
            style={{
              marginTop: 12,
              minHeight: 100,
              borderWidth: 1,
              borderColor: semantic.border.default,
              borderRadius: 12,
              padding: 12,
              fontFamily: 'BeVietnamPro_400Regular',
              fontSize: 14,
              color: semantic.text.primary,
              lineHeight: 20,
            }}
          />
        </View>

        {/* Terms */}
        <View className="bg-white mt-3 px-4 py-5">
          <Pressable
            onPress={() => setAgreed((v) => !v)}
            className="flex-row items-start gap-3"
          >
            <View
              className="w-5 h-5 rounded-md items-center justify-center"
              style={{
                marginTop: 2,
                backgroundColor: agreed ? semantic.action.primary : palette.white,
                borderWidth: agreed ? 0 : 1.5,
                borderColor: semantic.border.default,
              }}
            >
              {agreed && <Check size={13} color={palette.white} strokeWidth={3} />}
            </View>
            <View className="flex-1">
              <Text variant="body" style={{ color: semantic.text.primary, lineHeight: 20 }}>
                Tôi xác nhận đã đọc và đồng ý với{' '}
                <Text style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_700Bold' }}>
                  Điều khoản đặt chỗ
                </Text>{' '}
                của CĐT.
              </Text>
              <View className="flex-row items-center gap-1 mt-2">
                <ShieldCheck size={12} color={palette.emerald[700]} strokeWidth={2.4} />
                <Text
                  variant="caption"
                  style={{
                    color: palette.emerald[700],
                    fontFamily: 'BeVietnamPro_600SemiBold',
                  }}
                >
                  Cam kết bảo mật thông tin khách
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: palette.white,
          borderTopWidth: 1,
          borderTopColor: semantic.border.light,
          paddingTop: 10,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 14,
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text variant="caption" className="text-text-secondary">
            Tiền đặt cọc
          </Text>
          <Text
            variant="body-lg"
            style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            {formatVND(depositAmount)}
          </Text>
        </View>
        <Pressable
          onPress={handleSubmit}
          className="h-12 rounded-xl items-center justify-center"
          style={{
            backgroundColor: canSubmit ? semantic.action.primary : palette.slate[300],
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: canSubmit ? 0.25 : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: canSubmit ? 4 : 0,
          }}
        >
          <Text
            variant="button"
            style={{ color: palette.white }}
          >
            Gửi booking tới CĐT
          </Text>
        </Pressable>
      </View>

      <BottomSheetModal
        visible={leadPickerOpen}
        onClose={() => setLeadPickerOpen(false)}
        heightPercent={0.75}
      >
        <LeadPickerContent
          leads={leads}
          currentLeadId={linkedLeadId}
          onSelect={(leadId) => {
            setLinkedLeadId(leadId);
            setLeadPickerOpen(false);
          }}
        />
      </BottomSheetModal>
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

// --- Sub-components ---

function LeadPickerContent({
  leads,
  currentLeadId,
  onSelect,
}: {
  leads: Lead[];
  currentLeadId?: string;
  onSelect: (leadId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.fullName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.primaryProject.shortName.toLowerCase().includes(q)
    );
  }, [leads, query]);

  return (
    <View className="px-4 pt-1 pb-4" style={{ flex: 1 }}>
      <Text variant="h3" className="text-text-primary">
        Chọn lead để liên kết
      </Text>
      <Text variant="caption" className="text-text-secondary mt-1">
        Thông tin khách sẽ tự động điền vào form
      </Text>

      <View
        className="mt-3 px-3 rounded-xl flex-row items-center"
        style={{
          borderWidth: 1,
          borderColor: semantic.border.default,
          backgroundColor: palette.white,
        }}
      >
        <UserSearch size={15} color={semantic.text.tertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm theo tên / SĐT / dự án..."
          placeholderTextColor={semantic.text.tertiary}
          style={{
            flex: 1,
            marginLeft: 8,
            paddingVertical: 10,
            fontFamily: 'BeVietnamPro_500Medium',
            fontSize: 14,
            color: semantic.text.primary,
          }}
        />
      </View>

      <ScrollView
        className="mt-3"
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
      >
        {filtered.length === 0 ? (
          <View
            className="p-6 rounded-2xl items-center"
            style={{
              backgroundColor: semantic.surface.alt,
              borderWidth: 1,
              borderColor: semantic.border.light,
              borderStyle: 'dashed',
            }}
          >
            <Text variant="body" className="text-text-secondary text-center">
              Không tìm thấy lead phù hợp
            </Text>
          </View>
        ) : (
          filtered.map((l) => {
            const active = l.id === currentLeadId;
            return (
              <Pressable
                key={l.id}
                onPress={() => onSelect(l.id)}
                className="p-3 rounded-2xl flex-row items-center gap-3"
                style={{
                  backgroundColor: active ? semantic.action.primarySoft : palette.white,
                  borderWidth: 1,
                  borderColor: active ? semantic.action.primary : semantic.border.light,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: semantic.leadGroup[statusToGroup[l.status]].bg }}
                >
                  <Text
                    variant="subtitle"
                    style={{
                      color: semantic.leadGroup[statusToGroup[l.status]].fg,
                      fontFamily: 'BeVietnamPro_700Bold',
                    }}
                  >
                    {initials(l.fullName)}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text
                      variant="subtitle"
                      style={{
                        color: semantic.text.primary,
                        fontFamily: 'BeVietnamPro_700Bold',
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {l.fullName}
                    </Text>
                    <StatusBadge status={l.status} />
                  </View>
                  <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
                    {formatPhone(l.phone)} · {l.primaryProject.shortName}
                  </Text>
                </View>
                {active && (
                  <CircleCheck size={18} color={semantic.action.primary} strokeWidth={2.4} />
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StepProgress({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  return (
    <View
      className="flex-row items-center gap-2 px-4 py-3"
      style={{ backgroundColor: semantic.action.primarySoft }}
    >
      <View className="flex-row gap-1 flex-1">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor:
                i < current ? semantic.action.primary : palette.white,
            }}
          />
        ))}
      </View>
      <Text variant="badge" style={{ color: semantic.action.primaryDeep }}>
        Bước {current}/{total} · {label}
      </Text>
    </View>
  );
}

function SectionTitle({ step, title }: { step: string; title: string }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View
        className="w-7 h-7 rounded-full items-center justify-center"
        style={{ backgroundColor: semantic.action.primary }}
      >
        <Text
          variant="caption"
          style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
        >
          {step}
        </Text>
      </View>
      <Text
        variant="body-lg"
        style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
      >
        {title}
      </Text>
    </View>
  );
}

function ChipOption({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="px-3.5 h-9 rounded-xl items-center justify-center border flex-row gap-1"
      style={{
        backgroundColor: active ? semantic.action.primarySoft : palette.white,
        borderColor: active ? semantic.action.primary : semantic.border.default,
      }}
    >
      {active && <CircleCheck size={12} color={semantic.action.primaryDeep} strokeWidth={2.4} />}
      <Text
        variant="caption"
        style={{
          color: active ? semantic.action.primaryDeep : semantic.text.secondary,
          fontFamily: 'BeVietnamPro_700Bold',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Field({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  icon,
  rightSlot,
  error,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'number-pad';
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  /** Error message — khi có, field đổi border đỏ + hiển thị helper text bên dưới. */
  error?: string;
}) {
  return (
    <View>
      <Text
        variant="caption"
        style={{
          color: semantic.text.secondary,
          fontFamily: 'BeVietnamPro_600SemiBold',
          marginBottom: 6,
        }}
      >
        {label}
        {required && <Text style={{ color: palette.red[500] }}> *</Text>}
      </Text>
      <View
        className="flex-row items-center px-3 rounded-xl"
        style={{
          borderWidth: 1,
          borderColor: error ? palette.red[500] : semantic.border.default,
          backgroundColor: error ? palette.red[50] : palette.white,
          minHeight: 46,
        }}
      >
        {icon && <View className="mr-2">{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={semantic.text.tertiary}
          keyboardType={keyboardType}
          style={{
            flex: 1,
            fontFamily: 'BeVietnamPro_500Medium',
            fontSize: 14,
            color: semantic.text.primary,
            paddingVertical: 10,
          }}
        />
        {rightSlot}
      </View>
      {error && (
        <Text
          variant="caption"
          style={{
            color: palette.red[600],
            fontFamily: 'BeVietnamPro_500Medium',
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

function PaymentOption({
  active,
  onPress,
  icon,
  label,
}: {
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 h-12 rounded-xl flex-row items-center justify-center gap-2 border"
      style={{
        backgroundColor: active ? semantic.action.primarySoft : palette.white,
        borderColor: active ? semantic.action.primary : semantic.border.default,
      }}
    >
      {icon}
      <Text
        variant="caption"
        style={{
          color: active ? semantic.action.primaryDeep : semantic.text.secondary,
          fontFamily: 'BeVietnamPro_700Bold',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
