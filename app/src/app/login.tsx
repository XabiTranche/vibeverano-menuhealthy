import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email y contraseña son obligatorios');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    const result = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);

    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Logo / Title */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🥗</Text>
          <Text style={styles.title}>MenuFamiliaresHealthy</Text>
          <Text style={styles.subtitle}>Planifica menús saludables para tu familia</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9E9E9E"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#9E9E9E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {isSignUp ? 'Registrarse' : 'Entrar'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => { setIsSignUp(!isSignUp); setError(null); }}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },

  // Header
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#757575', marginTop: 4, textAlign: 'center' },

  // Form
  form: { },
  formTitle: { fontSize: 20, fontWeight: '600', color: '#1a1a1a', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 12, color: '#1a1a1a' },
  error: { color: '#F44336', fontSize: 13, marginBottom: 12 },
  submitButton: { backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  toggleButton: { marginTop: 16, alignItems: 'center' },
  toggleText: { color: '#4CAF50', fontSize: 14 },
});
