import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,

  fonts: {
    heading: "'Fraunces', Georgia, serif",
    body:    "'Geist Sans', system-ui, sans-serif",
    mono:    "'Geist Mono', 'JetBrains Mono', monospace",
  },

  colors: {
    ink:    '#0E0E0C',
    paper:  '#FCFCFD',
    frost:  '#F8F8FA',
    mist:   '#EEEEF1',
    mute:   '#8B867E',
    forest: {
      deep:    '#122620',
      DEFAULT: '#1F3A2E',
      glow:    '#2D5443',
      leaf:    '#4A7C5C',
    },
    brand: {
      50:  '#F0F7F3',
      100: '#D6EBE0',
      200: '#A8D1BB',
      300: '#6EB495',
      400: '#4A7C5C',
      500: '#1F3A2E',
      600: '#1A3128',
      700: '#152820',
      800: '#122620',
      900: '#0D1D18',
    },
    // Platform dark surfaces (used in semanticTokens)
    platform: {
      bg:        '#0E0E0C',
      surface:   '#141614',
      surface2:  '#1A1C1A',
      text:      '#F4F4F4',
      textMuted: '#7A7A7A',
    },
  },

  // Semantic tokens handle light/dark mode switching
  semanticTokens: {
    colors: {
      'app-bg': {
        default: 'var(--paper)',
        _dark:   'var(--platform-bg)',
      },
      'surface': {
        default: 'var(--frost)',
        _dark:   'var(--platform-surface)',
      },
      'surface-2': {
        default: 'var(--mist)',
        _dark:   'var(--platform-surface-2)',
      },
      'app-border': {
        default: 'var(--mist)',
        _dark:   'var(--platform-border)',
      },
      'app-text': {
        default: 'var(--ink)',
        _dark:   'var(--platform-text)',
      },
      'app-text-muted': {
        default: 'var(--mute)',
        _dark:   'var(--platform-text-muted)',
      },
      'topbar-bg': {
        default: 'rgba(252,252,253,0.92)',
        _dark:   'rgba(20,22,20,0.92)',
      },
    },
  },

  radii: {
    sm:   '4px',
    md:   '8px',
    lg:   '14px',
    xl:   '20px',
    '2xl': '24px',
    full: '9999px',
  },

  shadows: {
    sm:   '0 1px 2px rgba(14,14,12,0.04), 0 1px 1px rgba(14,14,12,0.03)',
    md:   '0 4px 8px rgba(14,14,12,0.06), 0 2px 4px rgba(14,14,12,0.04)',
    lg:   '0 12px 24px rgba(14,14,12,0.08), 0 4px 8px rgba(14,14,12,0.05)',
    xl:   '0 24px 48px rgba(14,14,12,0.10), 0 8px 16px rgba(14,14,12,0.06)',
    cool: '0 4px 8px rgba(18,38,32,0.08), 0 2px 4px rgba(18,38,32,0.05)',
    'cool-lg': '0 12px 24px rgba(18,38,32,0.10), 0 4px 8px rgba(18,38,32,0.07)',
  },

  space: {
    '1':  '2px',
    '2':  '4px',
    '3':  '8px',
    '4':  '12px',
    '5':  '16px',
    '6':  '24px',
    '7':  '32px',
    '8':  '48px',
    '9':  '64px',
    '10': '96px',
    '11': '128px',
  },

  sizes: {
    container: {
      sm:   '640px',
      md:   '768px',
      lg:   '1024px',
      xl:   '1280px',
      '2xl': '1440px',
    },
  },

  textStyles: {
    display: {
      fontFamily: 'heading',
      fontSize: ['72px', null, '132px'],
      lineHeight: '0.95',
      letterSpacing: '-0.04em',
      fontWeight: '400',
    },
    h1: {
      fontFamily: 'heading',
      fontSize: ['40px', null, '64px'],
      lineHeight: '1.05',
      letterSpacing: '-0.03em',
      fontWeight: '400',
    },
    h2: {
      fontFamily: 'heading',
      fontSize: ['28px', null, '44px'],
      lineHeight: '1.1',
      letterSpacing: '-0.025em',
      fontWeight: '400',
    },
    h3: {
      fontFamily: 'heading',
      fontSize: ['22px', null, '28px'],
      lineHeight: '1.2',
      letterSpacing: '-0.015em',
      fontWeight: '400',
    },
    pullQuote: {
      fontFamily: 'heading',
      fontSize: ['24px', null, '38px'],
      fontStyle: 'italic',
      lineHeight: '1.25',
      fontWeight: '400',
    },
    kicker: {
      fontFamily: 'mono',
      fontSize: '11px',
      fontWeight: '500',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'mute',
    },
    body: {
      fontFamily: 'body',
      fontSize: '17px',
      lineHeight: '1.6',
      fontWeight: '400',
    },
    sm: {
      fontFamily: 'body',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    xs: {
      fontFamily: 'mono',
      fontSize: '12px',
      lineHeight: '1.4',
      letterSpacing: '0.02em',
    },
  },

  styles: {
    global: {
      body: {
        bg:         'var(--paper)',
        color:      'var(--ink)',
        fontFamily: 'var(--font-sans)',
      },
      '::selection': {
        bg:    'rgba(74,124,92,0.20)',
        color: '#0E0E0C',
      },
    },
  },

  components: {
    Button: {
      baseStyle: {
        fontFamily:    'var(--font-sans)',
        fontWeight:    500,
        borderRadius:  'var(--radius-2)',
        letterSpacing: '-0.01em',
        position:      'relative',
        overflow:      'hidden',
        _active: { transform: 'scale(0.97)' },
      },
      variants: {
        primary: {
          bg:    'var(--ink)',
          color: 'var(--paper)',
          _hover: { bg: 'var(--forest-deep)' },
        },
        secondary: {
          bg:    'var(--forest)',
          color: 'var(--paper)',
          _hover: { bg: 'var(--glow)' },
        },
        ghost: {
          bg:          'transparent',
          color:       'var(--ink)',
          borderBottom: '1px solid var(--ink)',
          borderRadius: 0,
          px:          0,
          py:          1,
          _hover: { color: 'var(--forest)', borderColor: 'var(--forest)' },
        },
        icon: {
          bg:           'transparent',
          color:        'app-text-muted',
          borderRadius: 'var(--radius-3)',
          p:            2,
          minW:         '36px',
          h:            '36px',
          _hover: { bg: 'var(--ink-04)', color: 'app-text' },
        },
      },
      defaultProps: { variant: 'primary' },
    },

    Input: {
      variants: {
        editorial: {
          field: {
            bg:          'var(--frost)',
            border:      '1px solid',
            borderColor: 'var(--mist)',
            borderRadius:'var(--radius-2)',
            fontFamily:  'var(--font-sans)',
            fontSize:    '15px',
            color:       'var(--ink)',
            height:      '44px',
            _placeholder: { color: 'var(--mute)', opacity: 0.65 },
            _hover:       { borderColor: 'var(--mute)' },
            _focus: {
              borderColor: 'var(--leaf)',
              boxShadow:   '0 0 0 3px rgba(74,124,92,0.12)',
            },
          },
        },
      },
      defaultProps: { variant: 'editorial' },
    },

    FormLabel: {
      baseStyle: {
        fontFamily:  'var(--font-sans)',
        fontSize:    '13px',
        fontWeight:  500,
        color:       'var(--ink)',
        mb:          '4px',
      },
    },

    Card: {
      baseStyle: {
        container: {
          bg:          'var(--frost)',
          border:      '1px solid var(--mist)',
          borderRadius:'var(--radius-3)',
          boxShadow:   'var(--shadow-1)',
        },
      },
    },

    Tooltip: {
      baseStyle: {
        bg:          'var(--ink)',
        color:       'var(--paper)',
        borderRadius:'var(--radius-2)',
        fontSize:    '13px',
        fontFamily:  'var(--font-sans)',
        px:          3,
        py:          2,
      },
    },

    Menu: {
      baseStyle: {
        list: {
          bg:          'surface',
          border:      '1px solid',
          borderColor: 'app-border',
          borderRadius:'var(--radius-3)',
          boxShadow:   'var(--shadow-3)',
          py:          1,
          minW:        '180px',
        },
        item: {
          fontFamily:  'var(--font-sans)',
          fontSize:    '14px',
          color:       'app-text',
          bg:          'transparent',
          px:          3,
          py:          2,
          _hover: { bg: 'var(--ink-04)' },
          _focus: { bg: 'var(--ink-04)' },
        },
        divider: {
          borderColor: 'app-border',
          my:          1,
        },
      },
    },
  },
});

export default theme;
