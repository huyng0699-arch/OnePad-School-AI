import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { WellbeingCheckIn } from '../../types/wellbeingTypes';

type Props = {
  checkIns: WellbeingCheckIn[];
};

export default function WellbeingHeatmap({ checkIns }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Wellbeing check-ins</Text>
      {checkIns.length === 0 ? (
        <Text style={styles.empty}>No check-ins yet.</Text>
      ) : (
        <View style={styles.row}>
          {checkIns.map((checkIn) => (
            <View key={checkIn.id} style={styles.item}>
              <View
                style={[
                  styles.cell,
                  { backgroundColor: checkIn.schoolStressLevel >= 4 ? '#fbbf24' : '#86efac' }
                ]}
              />
              <Text style={styles.label}>{checkIn.date.slice(5).replace('-', '/')}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  title: { color: '#0f172a', fontSize: 15, fontWeight: '800', marginBottom: 10 },
  empty: { color: '#64748b', fontSize: 13 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { alignItems: 'center' },
  cell: { width: 28, height: 28, borderRadius: 6 },
  label: { marginTop: 4, color: '#64748b', fontSize: 10 }
});
