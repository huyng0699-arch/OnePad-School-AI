import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DataFieldKey } from '../../services/permissions/permissionEngine';

const roles = [
  'student',
  'parent',
  'subject_teacher',
  'homeroom_teacher',
  'education_guardian',
  'school_admin',
] as const;

type MatrixCell = Record<(typeof roles)[number], boolean>;

const matrix: Record<DataFieldKey, MatrixCell> = {
  learning_mastery: {
    student: true,
    parent: true,
    subject_teacher: true,
    homeroom_teacher: true,
    education_guardian: true,
    school_admin: false,
  },
  quiz_score: {
    student: true,
    parent: true,
    subject_teacher: true,
    homeroom_teacher: true,
    education_guardian: true,
    school_admin: false,
  },
  body_readiness: {
    student: true,
    parent: true,
    subject_teacher: false,
    homeroom_teacher: true,
    education_guardian: true,
    school_admin: false,
  },
  wellbeing_safe_summary: {
    student: true,
    parent: true,
    subject_teacher: false,
    homeroom_teacher: true,
    education_guardian: true,
    school_admin: false,
  },
  private_reflection: {
    student: true,
    parent: false,
    subject_teacher: false,
    homeroom_teacher: false,
    education_guardian: false,
    school_admin: false,
  },
  raw_ai_chat: {
    student: true,
    parent: false,
    subject_teacher: false,
    homeroom_teacher: false,
    education_guardian: false,
    school_admin: false,
  },
  raw_body_logs: {
    student: true,
    parent: false,
    subject_teacher: false,
    homeroom_teacher: false,
    education_guardian: false,
    school_admin: false,
  },
  support_signal: {
    student: true,
    parent: true,
    subject_teacher: true,
    homeroom_teacher: true,
    education_guardian: true,
    school_admin: true,
  },
  audit_log: {
    student: false,
    parent: false,
    subject_teacher: false,
    homeroom_teacher: false,
    education_guardian: false,
    school_admin: true,
  },
};

export default function PermissionMatrixCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Permission Matrix</Text>
      {Object.entries(matrix).map(([field, map]) => (
        <View key={field} style={styles.row}>
          <Text style={styles.field}>{field.replace(/_/g, ' ')}</Text>
          <Text style={styles.value}>
            {roles
              .filter((role) => map[role])
              .map((role) => role.replace(/_/g, ' '))
              .join(', ')}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 12 },
  title: { color: '#1f2937', fontWeight: '800', fontSize: 16, marginBottom: 10 },
  row: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8, marginTop: 8 },
  field: { color: '#0f172a', fontWeight: '700', textTransform: 'capitalize', marginBottom: 4 },
  value: { color: '#475569', fontSize: 12 },
});
