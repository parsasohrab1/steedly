import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { scoreAllDiseases, type HorseBaseline, type RiskAssessment, type TelemetrySnapshot } from '@asbaan/shared';
import { createEmergencyBooking, fetchRiskStatus } from '../lib/api';
import { theme } from '../lib/theme';
import type { RootStackParamList } from '../navigation';

const BASELINE: HorseBaseline = { horseId: 'horse-1', heartRateRestingBpm: 36, lyingBoutsPer2h: 1, dailyActivityIndex: 100 };

function localSample(): TelemetrySnapshot {
  return {
    horseId: 'horse-1',
    timestampIso: new Date().toISOString(),
    heartRateBpm: 36 + Math.round(Math.random() * 4),
    skinTempC: 37.8,
    sweatIncreased: false,
    lyingBoutsLast2h: 1,
    activityDropPct: 0,
    rollingDetected: false,
    missedFeedingCount: 0,
    hoofTempAsymmetryC: 0,
    weightShiftFrequent: false,
    hoursSinceExercise: 8,
    postExerciseStiffness: 'none',
    vitalsSurgeSeverity: 'none',
  };
}

function tierColor(tier: string) {
  if (tier === 'emergency' || tier === 'alert') return { bg: theme.alertSoft, fg: theme.alert };
  if (tier === 'watch') return { bg: theme.watchSoft, fg: theme.watch };
  return { bg: theme.okSoft, fg: theme.ok };
}

type Props = NativeStackScreenProps<RootStackParamList, 'HorseDetail'>;

export function HorseDetailScreen({ route }: Props) {
  const { horseId, horseName } = route.params;
  const [assessment, setAssessment] = useState<RiskAssessment>(() => scoreAllDiseases(localSample(), BASELINE));
  const [source, setSource] = useState<'live' | 'local-engine'>('local-engine');

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const live = await fetchRiskStatus(horseId);
        setAssessment(live);
        setSource('live');
      } catch {
        setAssessment(scoreAllDiseases(localSample(), BASELINE));
        setSource('local-engine');
      }
    }, 3000);
    return () => clearInterval(id);
  }, [horseId]);

  const worst = [assessment.colic, assessment.laminitis, assessment.azoturia].reduce((a, b) => (a.score >= b.score ? a : b));
  const colors = tierColor(worst.tier);

  async function handleSos() {
    try {
      const booking = await createEmergencyBooking(horseId);
      Alert.alert('دیسپچ اورژانس ارسال شد', `ارائه‌دهنده: ${booking.providerName}`);
    } catch {
      Alert.alert('اتصال برقرار نشد', 'بک‌اند اسبان را اجرا کنید تا دیسپچ واقعی ثبت شود.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={styles.title}>🐴 {horseName}</Text>
      <Text style={styles.sourceNote}>
        {source === 'live' ? 'داده زنده از بک‌اند اسبان' : 'موتور ریسک‌اسکورینگ محلی (@asbaan/shared) — بک‌اند در دسترس نیست'}
      </Text>

      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.fg, fontWeight: '700' }}>
          {worst.tier === 'normal' && 'وضعیت عادی'}
          {worst.tier === 'watch' && 'تحت نظر'}
          {worst.tier === 'alert' && 'هشدار'}
          {worst.tier === 'emergency' && 'اورژانس'}
        </Text>
      </View>

      <ScoreRow label="کولیک" score={assessment.colic.score} />
      <ScoreRow label="لمینایتیس" score={assessment.laminitis.score} />
      <ScoreRow label="آزوتوریا" score={assessment.azoturia.score} />

      <Pressable style={styles.sosButton} onPress={handleSos}>
        <Text style={styles.sosText}>🚨 فعال‌سازی دستی SOS</Text>
      </Pressable>
    </ScrollView>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{score} / 100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  title: { fontSize: 22, fontWeight: '800', color: theme.text },
  sourceNote: { fontSize: 11, color: theme.textMuted },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.surface2,
    borderRadius: 10, padding: 12,
  },
  rowLabel: { color: theme.textMuted, fontSize: 13 },
  rowValue: { fontWeight: '700', color: theme.text },
  sosButton: { backgroundColor: theme.alert, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  sosText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
