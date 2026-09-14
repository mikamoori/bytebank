import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';

const CLOUDINARY_CLOUD_NAME = 'leffrguu';
const CLOUDINARY_UPLOAD_PRESET = 'bytebank_recibos';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function ExploreScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Alimentação');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ['Alimentação', 'Lazer', 'Trabalho', 'Transporte', 'Outros'];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri: string) => {
    console.log('Iniciando upload para Cloudinary...'); // DEBUG

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('file', blob);
    } else {
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);
    }

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    console.log('Resposta do Cloudinary:', data); // DEBUG

    return data.secure_url;
  };

  const handleSaveTransaction = async () => {
    console.log('CLIQUEI NO BOTAO'); // DEBUG 

    if (!title || !amount) {
      console.log('Validação falhou: título ou valor vazio'); // DEBUG
      Alert.alert('Erro', 'Preencha o título e o valor da transação.');
      return;
    }

    if (!user?.uid) {
      console.log('Sem usuário autenticado:', user); // DEBUG
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading true, entrando no try...'); // DEBUG

      let receiptUrl = '';

      if (imageUri) {
        console.log('Tem imagem, vai fazer upload...'); // DEBUG
        receiptUrl = await uploadToCloudinary(imageUri);
        console.log('Upload concluído, URL:', receiptUrl); // DEBUG
      }

      console.log('Vai salvar no Firestore...'); // DEBUG

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        title,
        amount: parseFloat(amount.replace(',', '.')),
        type,
        category,
        receiptUrl,
        date: Timestamp.now(),
      });

      console.log('Salvo com sucesso no Firestore!'); // DEBUG

      Alert.alert('Sucesso', 'Transação registrada com sucesso!');

      setTitle('');
      setAmount('');
      setImageUri(null);

      router.push('/');
    } catch (error) {
      console.error('Erro ao salvar transação:', error); // Já existia
      Alert.alert('Erro', 'Não foi possível salvar a transação.');
    } finally {
      setLoading(false);
      console.log('Finally executado, loading false'); // DEBUG
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>Transições</Text>
        <Text style={styles.headerSubtitle}>Registre suas entradas ou saídas</Text>

        {/* Tipo: Entrada ou Saída */}
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.incomeSelected]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeText, type === 'income' && styles.selectedTypeText]}>
              ↓ Entrada
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.expenseSelected]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeText, type === 'expense' && styles.selectedTypeText]}>
              ↑ Saída
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Mercado, Salário..."
            placeholderTextColor="#A1A1AA"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor="#A1A1AA"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBadge, category === cat && styles.categorySelected]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryBadgeText,
                    category === cat && styles.categorySelectedText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Comprovante / Recibo</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadButtonText}>
              {imageUri ? '✓ Recibo Selecionado (Alterar)' : '📷 Anexar Recibo'}
            </Text>
          </TouchableOpacity>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSaveTransaction}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Salvar Transação</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFFF',
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181B',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#71717A',
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F4F2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeSelected: {
    backgroundColor: '#16A34A',
  },
  expenseSelected: {
    backgroundColor: '#18181B',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#F4F2FF',
    borderWidth: 1,
    borderColor: '#E2DCFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#18181B',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F4F2FF',
    marginRight: 8,
  },
  categorySelected: {
    backgroundColor: '#7C65C1',
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },
  categorySelectedText: {
    color: '#FFFFFF',
  },
  uploadButton: {
    height: 48,
    backgroundColor: '#F4F2FF',
    borderWidth: 1,
    borderColor: '#7C65C1',
    borderStyle: 'dashed',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#7C65C1',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginTop: 10,
  },
  submitButton: {
    height: 52,
    backgroundColor: '#7C65C1',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#BBAFE6',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});