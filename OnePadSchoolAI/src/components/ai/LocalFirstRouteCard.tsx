import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LocalFirstRouteCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>AI Route</Text>
      <Text style={styles.item}>- Wellbeing check-in: Local-first</Text>
      <Text style={styles.item}>- Redaction: Local-first</Text>
      <Text style={styles.item}>- Body readiness: Local deterministic engine</Text>
      <Text style={styles.item}>- Long report: Cloud fallback through backend</Text>
      <Text style={styles.item}>- Private reflection: Cloud disabled</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 12 },
  title: { color: '#1f2937', fontWeight: '800', fontSize: 16, marginBottom: 8 },
  item: { color: '#475569', fontSize: 13, marginBottom: 4 },
});
