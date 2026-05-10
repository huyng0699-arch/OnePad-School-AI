import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { InterventionPlan } from '../../types/interventionTypes';

type Props = {
  plan: InterventionPlan;
};

const renderList = (items: string[]) => {
  return items.map((item) => (
    <Text key={item} style={styles.text}>
      - {item}
    </Text>
  ));
};

export default function InterventionPlanCard({ plan }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Intervention Plan</Text>
      <Text style={styles.heading}>Student</Text>
      {renderList(plan.studentActions)}
      <Text style={styles.heading}>Teacher</Text>
      {renderList(plan.teacherActions)}
      <Text style={styles.heading}>Parent</Text>
      {renderList(plan.parentActions)}
      <Text style={styles.heading}>Admin</Text>
      {renderList(plan.adminActions)}
      <Text style={styles.note}>{plan.safetyNote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 12 },
  title: { color: '#1f2937', fontWeight: '800', fontSize: 16, marginBottom: 8 },
  heading: { color: '#0f172a', fontWeight: '700', marginTop: 8, marginBottom: 4 },
  text: { color: '#475569', fontSize: 13, marginBottom: 3 },
  note: { color: '#0f766e', marginTop: 10, fontWeight: '700', fontSize: 12 },
});
