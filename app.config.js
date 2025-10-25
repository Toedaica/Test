// Bridge EAS Secrets (EXPO_PUBLIC_*) vào extra để đảm bảo có mặt ở runtime
module.exports = ({ config }) => {
  return {
    ...config,
    // Ensure expo-font plugin is enabled so font loading is optimized
    plugins: [
      ...(config.plugins || []),
      'expo-font',
    ],
    extra: {
      ...(config.extra || {}),
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || (config.extra && config.extra.supabaseUrl) || '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || (config.extra && config.extra.supabaseAnonKey) || '',
      eas: config.extra?.eas,
    },
  };
};



