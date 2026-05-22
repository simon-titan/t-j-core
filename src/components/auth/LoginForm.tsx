'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FormControl, FormLabel,
  Input, Button, VStack, Text,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types/database';

function getRoleHome(role: UserRole): string {
  if (role === 'super_admin') return '/admin';
  if (role === 'org_admin')   return '/dashboard';
  return '/app';
}

const MotionButton = motion(Button);

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

const fadeInUp = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.40, ease: [0.65, 0, 0.35, 1] } },
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('E-Mail oder Passwort ungültig.');
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = ((profileData as { role?: string } | null)?.role ?? 'member') as UserRole;
      router.push(getRoleHome(role));
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <VStack spacing={5} align="stretch">

          <motion.div variants={fadeInUp}>
            <FormControl isRequired>
              <FormLabel
                fontSize="13px"
                fontWeight={500}
                color="var(--mute)"
                mb={1.5}
                fontFamily="var(--font-sans)"
                letterSpacing="-0.01em"
              >
                E-Mail
              </FormLabel>
              <Input
                type="email"
                placeholder="name@firma.de"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </FormControl>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <FormControl isRequired>
              <FormLabel
                fontSize="13px"
                fontWeight={500}
                color="var(--mute)"
                mb={1.5}
                fontFamily="var(--font-sans)"
                letterSpacing="-0.01em"
              >
                Passwort
              </FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </FormControl>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              <Text
                fontSize="13px"
                color="#991B1B"
                bg="rgba(239,68,68,0.08)"
                border="1px solid rgba(239,68,68,0.18)"
                borderRadius="var(--radius-2)"
                px={3}
                py={2}
                fontFamily="var(--font-sans)"
              >
                {error}
              </Text>
            </motion.div>
          )}

          <motion.div variants={fadeInUp}>
            <MotionButton
              type="submit"
              isLoading={loading}
              loadingText="Anmelden…"
              w="100%"
              h="44px"
              mt={2}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.12 }}
              sx={{
                bg: 'var(--forest)',
                color: 'var(--paper)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: '15px',
                letterSpacing: '-0.01em',
                borderRadius: 'var(--radius-2)',
                position: 'relative',
                overflow: 'hidden',
                _hover: { bg: 'var(--glow)' },
                _active: { transform: 'scale(0.97)' },
                _loading: { opacity: 0.65 },
              }}
            >
              Anmelden →
            </MotionButton>
          </motion.div>

        </VStack>
      </motion.div>
    </form>
  );
}
