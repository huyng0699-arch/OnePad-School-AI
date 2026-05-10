import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ChartPoint } from './chartUtils';
import { clampPercent } from './chartUtils';

type MiniBarChartProps = {
  title: string;
  points: ChartPoint[];
  color: string;
  maxValue?: number;
  suffix?: string;
};

export default function MiniBarChart({ title, points, color, maxValue, suffix }: MiniBarChartProps) {
  const chartMax = maxValue ?? Math.max(...points.map((point) => point.value), 1);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {points.length === 0 ? (
        <Text style={styles.empty}>Not enough data yet.</Text>
      ) : (
        <View style={styles.row}>
          {points.slice(-7).map((point) => (
            <View key={`${title}-${point.label}`} style={styles.column}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    { height: `${clampPercent((point.value / chartMax) * 100)}%`, backgroundColor: color }
                  ]}
                />
              </View>
              <Text style={styles.value}>{point.value}{suffix ?? ''}</Text>
              <Text style={styles.label}>{point.label}</Text>
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
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  column: { flex: 1, alignItems: 'center' },
  track: {
    height: 84,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  bar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  value: { marginTop: 6, color: '#334155', fontSize: 10, fontWeight: '700' },
  label: { marginTop: 2, color: '#64748b', fontSize: 10 }
});
