import React from 'react';
import { ScrollView, View, Image, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { useFonts, Quicksand_400Regular, Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';

export default function WelcomeScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  const fontRegular = fontsLoaded ? 'Quicksand_400Regular' : 'Roboto';
  const fontMedium = fontsLoaded ? 'Quicksand_500Medium' : 'Roboto';
  const fontSemibold = fontsLoaded ? 'Quicksand_600SemiBold' : 'Roboto';
  const fontBold = fontsLoaded ? 'Quicksand_700Bold' : 'Roboto';

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient colors={["#10b981", "#3b82f6", "#9333ea"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, paddingHorizontal: 16, paddingTop: 36, paddingBottom: 24 }}>
        <View style={{ alignItems: 'center' }}>
          <Image source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/29df12551c-cfac780c63faa3abd7a8.png' }} style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 12 }} />
          <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16 }}>
            <ThemedText style={{ color: '#111', fontFamily: fontSemibold }}>Sẵn sàng chưa? Cùng bắt đầu thôi nào! 😊</ThemedText>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <ThemedText style={{ color: '#fff', fontSize: 16, lineHeight: 22, textAlign: 'center', fontFamily: fontSemibold, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>Chào mừng bạn đến với</ThemedText>
          <ThemedText style={{ color: '#fff', fontSize: 28, lineHeight: 34, textAlign: 'center', marginTop: 6, fontFamily: fontBold, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>AI Financial Coach 💰</ThemedText>
          <ThemedText style={{ color: '#fff', opacity: 0.9, marginTop: 12, textAlign: 'center', fontSize: 16, lineHeight: 24, fontFamily: fontMedium }}>Cùng Fin bắt đầu hành trình tài chính thông minh và vui vẻ nhé!</ThemedText>
        </View>

        <View style={{ marginTop: 22, gap: 12 }}>
          <Pressable onPress={() => router.replace('/auth/signin')}>
            <LinearGradient colors={["#3b82f6", "#1d4ed8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
              <ThemedText style={{ color: '#fff', fontSize: 16, lineHeight: 22, fontFamily: fontBold }}>Đăng nhập</ThemedText>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => router.replace('/auth/signup')}>
            <LinearGradient colors={["#a78bfa", "#7c3aed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
              <ThemedText style={{ color: '#fff', fontSize: 16, lineHeight: 22, fontFamily: fontBold }}>Tạo tài khoản mới</ThemedText>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}



