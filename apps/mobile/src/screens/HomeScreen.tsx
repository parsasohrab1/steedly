import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Horse } from '@asbaan/shared';
import { fetchHorses } from '../lib/api';
import { theme } from '../lib/theme';
import type { RootStackParamList } from '../navigation';

const SAMPLE_HORSES: Horse[] = [
  { id: 'horse-1', ownerId: 'owner-1', name: 'شبدیز', breed: 'عرب', ageYears: 9, discipline: 'jumping' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [horses, setHorses] = useState<Horse[]>(SAMPLE_HORSES);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    fetchHorses()
      .then((data) => {
        setHorses(data);
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>اسبان</Text>
      <Text style={styles.subtitle}>دستیار هوشمند سوارکار</Text>
      {offline && <Text style={styles.note}>اتصال به بک‌اند برقرار نشد — داده نمونه نمایش داده می‌شود.</Text>}
      <FlatList
        data={horses}
        keyExtractor={(h) => h.id}
        contentContainerStyle={{ gap: 10, paddingTop: 16 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('HorseDetail', { horseId: item.id, horseName: item.name })}>
            <Text style={styles.cardTitle}>🐴 {item.name}</Text>
            <Text style={styles.cardMeta}>{item.breed} · {item.ageYears} ساله</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: theme.green },
  subtitle: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  note: { fontSize: 12, color: theme.gold, marginTop: 10 },
  card: { backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  cardMeta: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
});
