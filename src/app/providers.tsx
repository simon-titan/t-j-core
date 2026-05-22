'use client';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { Toaster } from 'sonner';
import theme from '@/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
      <Toaster
        position="bottom-right"
        theme="light"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            borderRadius: 'var(--radius-3)',
            border: '1px solid var(--mist)',
          },
        }}
      />
    </>
  );
}
