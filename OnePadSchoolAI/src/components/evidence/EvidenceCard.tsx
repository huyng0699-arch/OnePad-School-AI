import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { EvidenceItem } from '../../types/evidenceTypes';

type Props = {
  items: EvidenceItem[];
};

export default function EvidenceCard({ items }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Evidence</Text>
      {items.length === 0 ? <Text style={styles.text}>No evidence available.</Text> : null}
      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.label}>
            {item.label}: {item.value}
          </Text>
          <Text style={styles.text}>{item.interpretation}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 12 },
  title: { color: '#1f2937', fontWeight: '800', fontSize: 16, marginBottom: 8 },
  item: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10, marginTop: 10 },
  label: { color: '#0f172a', fontWeight: '700', marginBottom: 4 },
  text: { color: '#475569', fontSize: 13 },
});
