import React from 'react';
import { AuthContextProvider, useAuth } from '@/lib/authContext';
import { Slot } from 'expo-router';
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import { DefaultTheme as MD3LightTheme, PaperProvider, MD3DarkTheme } from 'react-native-paper';


const themeLight = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    "primary": "#ffffff",
    "onPrimary": "rgb(0, 0, 0)",
    "primaryContainer": "rgb(151, 240, 255)",
    "onPrimaryContainer": "rgb(0, 31, 36)",
    "secondary": "#F5F5F5",
    "onSecondary": "rgb(0, 0, 0)",
    "secondaryContainer": "rgb(255, 217, 226)",
    "onSecondaryContainer": "rgb(62, 0, 29)",
    "tertiary": "rgb(82, 94, 125)",
    "onTertiary": "rgb(255, 255, 255)",
    "tertiaryContainer": "rgb(218, 226, 255)",
    "onTertiaryContainer": "rgb(14, 27, 55)",
    "error": "rgb(186, 26, 26)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(255, 218, 214)",
    "onErrorContainer": "rgb(65, 0, 2)",
    "background": "rgb(250, 253, 253)",
    "onBackground": "rgb(25, 28, 29)",
    "surface": "rgb(250, 253, 253)",
    "onSurface": "rgb(25, 28, 29)",
    "surfaceVariant": "rgb(219, 228, 230)",
    "onSurfaceVariant": "rgb(63, 72, 74)",
    "outline": "rgb(111, 121, 122)",
    "outlineVariant": "rgb(191, 200, 202)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(46, 49, 50)",
    "inverseOnSurface": "rgb(239, 241, 241)",
    "inversePrimary": "rgb(79, 216, 235)",
    "mainColor":"#4e888f",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(238, 246, 246)",
      "level2": "rgb(230, 241, 242)",
      "level3": "rgb(223, 237, 238)",
      "level4": "rgb(220, 235, 237)",
      "level5": "rgb(215, 232, 234)"
    },
    "surfaceDisabled": "rgba(25, 28, 29, 0.12)",
    "onSurfaceDisabled": "rgba(25, 28, 29, 0.38)",
    "backdrop": "rgba(41, 50, 52, 0.4)"
  },
};

const themeDark = {
  ...MD3DarkTheme,
  colors: {
    "primary": "#4C4E52",
    "onPrimary": "rgb(255, 255, 255)",
    "primaryContainer": "rgb(0, 79, 88)",
    "onPrimaryContainer": "rgb(151, 240, 255)",
    "secondary": "rgb(0, 0, 0)",
    "onSecondary": "rgb(255, 255, 255)",
    "secondaryContainer": "rgb(123, 41, 73)",
    "onSecondaryContainer": "rgb(255, 217, 226)",
    "tertiary": "rgb(186, 198, 234)",
    "onTertiary": "rgb(36, 48, 77)",
    "tertiaryContainer": "rgb(59, 70, 100)",
    "onTertiaryContainer": "rgb(218, 226, 255)",
    "error": "rgb(255, 180, 171)",
    "onError": "rgb(105, 0, 5)",
    "errorContainer": "rgb(147, 0, 10)",
    "onErrorContainer": "rgb(255, 180, 171)",
    "background": "rgb(25, 28, 29)",
    "onBackground": "rgb(225, 227, 227)",
    "surface": "rgb(25, 28, 29)",
    "onSurface": "rgb(225, 227, 227)",
    "surfaceVariant": "rgb(63, 72, 74)",
    "onSurfaceVariant": "rgb(191, 200, 202)",
    "outline": "rgb(137, 146, 148)",
    "outlineVariant": "rgb(63, 72, 74)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(225, 227, 227)",
    "inverseOnSurface": "rgb(46, 49, 50)",
    "inversePrimary": "rgb(0, 104, 116)",
    "mainColor":"#4e888f",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(28, 37, 39)",
      "level2": "rgb(29, 43, 46)",
      "level3": "rgb(31, 49, 52)",
      "level4": "rgb(32, 51, 54)",
      "level5": "rgb(33, 54, 58)"
    },
    "surfaceDisabled": "rgba(225, 227, 227, 0.12)",
    "onSurfaceDisabled": "rgba(225, 227, 227, 0.38)",
    "backdrop": "rgba(41, 50, 52, 0.4)"
  },
}


function App() {
  const {darkmode, setDarkmode} = useSettings()
  const { user, userDetails, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if(userDetails) {
    setDarkmode(userDetails.settings?.darkmode)
  }

  return (
    <PaperProvider theme={darkmode ? themeDark : themeLight}>
      <Slot />
    </PaperProvider>
  )
}

export default function RootLayout() {



  return (
    <AutocompleteDropdownContextProvider>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </AutocompleteDropdownContextProvider>
  );
}
