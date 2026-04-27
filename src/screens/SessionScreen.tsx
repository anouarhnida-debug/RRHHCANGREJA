import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '../components/Screen';
import { useProfile } from '../hooks/useProfile';
import { colors } from '../theme';

function Field({
  autoCapitalize = 'none',
  keyboardType,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value,
}: {
  autoCapitalize?: 'none' | 'sentences' | 'words';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
}) {
  return (
    <TextInput
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      secureTextEntry={secureTextEntry}
      style={styles.input}
      value={value}
    />
  );
}

export function SessionScreen() {
  const { login } = useProfile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await login(email, password);
    setMessage(result.message);
    setSubmitting(false);
  };

  return (
    <Screen contentContainerStyle={styles.content} scroll={false}>
      <Image
        resizeMode="contain"
        source={require('../../assets/logoTRR.png')}
        style={styles.logo}
      />

      <View style={styles.heading}>
        <Text style={styles.title}>Acceso de empleados</Text>
        <Text style={styles.subtitle}>
          Inicia sesión con tu correo corporativo y la contraseña creada en Supabase Auth.
        </Text>
      </View>

      <View style={styles.form}>
        <Field
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Correo"
          value={email}
        />
        <Field
          onChangeText={setPassword}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
        />
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable
        disabled={submitting}
        onPress={() => {
          void handleSubmit();
        }}
        style={({ pressed }) => [
          styles.submitButton,
          submitting && styles.submitButtonDisabled,
          pressed && !submitting && styles.pressed,
        ]}
      >
        <Text style={[styles.submitText, submitting && styles.submitTextDisabled]}>
          {submitting ? 'Procesando...' : 'Entrar'}
        </Text>
      </Pressable>

      <Text style={styles.notice}>
        Solo pueden entrar usuarios ya creados por administración. No hay registro público desde
        la app.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 24,
  },
  logo: {
    alignSelf: 'center',
    height: 118,
    marginBottom: 28,
    width: 180,
  },
  heading: {
    alignSelf: 'center',
    marginBottom: 26,
    maxWidth: 340,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    alignItems: 'center',
    gap: 18,
  },
  input: {
    alignSelf: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    color: colors.textPrimary,
    fontSize: 16,
    maxWidth: 360,
    minHeight: 44,
    paddingHorizontal: 0,
    paddingVertical: 8,
    textAlign: 'center',
    width: '82%',
  },
  message: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 50,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  submitTextDisabled: {
    color: colors.textMuted,
  },
  notice: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.92,
  },
});
