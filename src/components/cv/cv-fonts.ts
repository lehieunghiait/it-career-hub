import regular from '@expo-google-fonts/be-vietnam-pro/BeVietnamPro_400Regular.ttf?url';
import italic from '@expo-google-fonts/be-vietnam-pro/BeVietnamPro_400Regular_Italic.ttf?url';
import semiBold from '@expo-google-fonts/be-vietnam-pro/BeVietnamPro_600SemiBold.ttf?url';
import bold from '@expo-google-fonts/be-vietnam-pro/BeVietnamPro_700Bold.ttf?url';

// Same font files for the PDF and the HTML preview
export const CV_FONT_FILES = [
  { src: regular, fontWeight: 400 },
  { src: italic, fontWeight: 400, fontStyle: 'italic' as const },
  { src: semiBold, fontWeight: 600 },
  { src: bold, fontWeight: 700 },
];
