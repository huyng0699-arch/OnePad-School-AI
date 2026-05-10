import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PermissionDecision } from '../../services/permissions/permissionEngine';

type Props = {
  decision: PermissionDecision;
};

export default function PrivacyRedactionSummary({ decision }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Privacy Redaction Summary</Text>
      <Text style={styles.text}>Role: {decision.role.replace(/_/g, ' ')}</Text>
      <Text style={styles.text}>Visible: {decision.visibleFields.join(', ') || 'None'}</Text>
      <Text style={styles.text}>Hidden: {decision.hiddenFields.join(', ') || 'None'}</Text>
      <Text style={styles.summary}>{decision.redactedSummary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, marginBottom: 12 },
  title: { color: '#1f2937', fontWeight: '800', fontSize: 16, marginBottom: 8 },
  text: { color: '#475569', fontSize: 13, marginBottom: 5 },
  summary: { color: '#0f172a', fontWeight: '700', marginTop: 6 },
});
