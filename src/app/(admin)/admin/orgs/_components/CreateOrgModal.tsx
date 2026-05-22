'use client';

import { useState } from 'react';
import { Box, Text, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  isOpen:   boolean;
  onClose:  () => void;
  onCreated: () => void;
}

const modalVariants = {
  hidden:  { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.22, ease: [0.65, 0, 0.35, 1] } },
  exit:    { opacity: 0, y: 8,  scale: 0.97, transition: { duration: 0.16 } },
};

export function CreateOrgModal({ isOpen, onClose, onCreated }: Props) {
  const [name,     setName]     = useState('');
  const [logoUrl,  setLogoUrl]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { error: err } = await supabase.from('organizations').insert({
      name:     name.trim(),
      slug:     `${slug}-${Date.now()}`,
      logo_url: logoUrl.trim() || null,
      settings: { admin_visibility: 'all' },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setName('');
    setLogoUrl('');
    setLoading(false);
    onCreated();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(14,14,12,0.60)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--mist)',
              borderRadius: 'var(--radius-5)',
              boxShadow: 'var(--shadow-4)',
              padding: '40px',
              width: '480px',
              maxWidth: '90vw',
            }}
          >
            {/* Header */}
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={6}>
              <Box>
                <span
                  className="label-kicker"
                  style={{ display: 'block', marginBottom: 'var(--space-2)' }}
                >
                  Neue Organisation
                </span>
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="18px"
                  fontWeight={600}
                  letterSpacing="-0.02em"
                  color="var(--ink)"
                >
                  Organisation erstellen
                </Text>
              </Box>
              <Box
                as="button"
                onClick={onClose}
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="32px"
                h="32px"
                borderRadius="var(--radius-2)"
                border="1px solid var(--mist)"
                bg="transparent"
                cursor="pointer"
                color="var(--mute)"
                _hover={{ bg: 'var(--frost)', color: 'var(--ink)' }}
                transition="all 120ms"
              >
                <X size={14} strokeWidth={2} />
              </Box>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDir="column" gap={4}>
                <FormControl isRequired>
                  <FormLabel
                    fontFamily="var(--font-sans)"
                    fontSize="13px"
                    fontWeight={500}
                    color="var(--ink)"
                    mb={1}
                  >
                    Name
                  </FormLabel>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="z.B. Acme GmbH"
                    autoFocus
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontFamily="var(--font-sans)"
                    fontSize="13px"
                    fontWeight={500}
                    color="var(--ink)"
                    mb={1}
                  >
                    Logo URL
                    <Text as="span" fontWeight={400} color="var(--mute)" ml={1}>(optional)</Text>
                  </FormLabel>
                  <Input
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                    type="url"
                  />
                </FormControl>

                {error && (
                  <Text fontFamily="var(--font-sans)" fontSize="13px" color="#991B1B">
                    {error}
                  </Text>
                )}

                <Box display="flex" gap={3} pt={2}>
                  <Box
                    as="button"
                    type="button"
                    onClick={onClose}
                    flex={1}
                    h="44px"
                    borderRadius="var(--radius-2)"
                    border="1px solid var(--mist)"
                    bg="transparent"
                    fontFamily="var(--font-sans)"
                    fontSize="14px"
                    fontWeight={500}
                    color="var(--ink)"
                    cursor="pointer"
                    transition="all 120ms"
                    _hover={{ bg: 'var(--frost)' }}
                  >
                    Abbrechen
                  </Box>
                  <Box
                    as="button"
                    type="submit"
                    flex={2}
                    h="44px"
                    borderRadius="var(--radius-2)"
                    bg={loading ? 'var(--mute)' : 'var(--ink)'}
                    color="var(--paper)"
                    fontFamily="var(--font-sans)"
                    fontSize="14px"
                    fontWeight={500}
                    cursor={loading ? 'wait' : 'pointer'}
                    border="none"
                    transition="all 120ms"
                    _hover={{ bg: loading ? 'var(--mute)' : 'var(--forest-deep)' }}
                    disabled={loading}
                    opacity={loading ? 0.65 : 1}
                  >
                    {loading ? 'Erstellt…' : 'Erstellen →'}
                  </Box>
                </Box>
              </Box>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
