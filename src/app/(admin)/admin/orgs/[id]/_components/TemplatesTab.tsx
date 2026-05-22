'use client';

import { useState } from 'react';
import { Box, Text, Input, Textarea, FormControl, FormLabel, Switch } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { PitchTemplate } from '@/lib/types/database';

interface Props {
  orgId:     string;
  userId:    string;
  templates: PitchTemplate[];
}

const modalVariants = {
  hidden:  { opacity: 0, y: 10, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.2, ease: [0.65, 0, 0.35, 1] } },
  exit:    { opacity: 0, y: 6,  scale: 0.97, transition: { duration: 0.15 } },
};

type FormState = {
  name:            string;
  body:            string;
  target_audience: string;
  product_service: string;
};

const EMPTY: FormState = { name: '', body: '', target_audience: '', product_service: '' };

export function TemplatesTab({ orgId, userId, templates: initial }: Props) {
  const [templates, setTemplates] = useState(initial);
  const [modal,    setModal]      = useState(false);
  const [editing,  setEditing]    = useState<PitchTemplate | null>(null);
  const [form,     setForm]       = useState<FormState>(EMPTY);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState<string | null>(null);
  const [toggling, setToggling]   = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setModal(true);
  }

  function openEdit(t: PitchTemplate) {
    setEditing(t);
    setForm({
      name:            t.name,
      body:            t.body,
      target_audience: t.target_audience ?? '',
      product_service: t.product_service ?? '',
    });
    setError(null);
    setModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.body.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      organization_id:  orgId,
      created_by:       userId,
      name:             form.name.trim(),
      body:             form.body.trim(),
      target_audience:  form.target_audience.trim() || null,
      product_service:  form.product_service.trim() || null,
    };

    if (editing) {
      const { data, error: err } = await supabase
        .from('pitch_templates')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single();

      if (err) { setError(err.message); setLoading(false); return; }
      setTemplates(prev => prev.map(t => t.id === editing.id ? data as PitchTemplate : t));
    } else {
      const { data, error: err } = await supabase
        .from('pitch_templates')
        .insert({ ...payload, is_active: true })
        .select()
        .single();

      if (err) { setError(err.message); setLoading(false); return; }
      setTemplates(prev => [...prev, data as PitchTemplate]);
    }

    setLoading(false);
    setModal(false);
  }

  async function handleToggle(id: string, current: boolean) {
    setToggling(id);
    const supabase = createClient();
    await supabase.from('pitch_templates').update({ is_active: !current }).eq('id', id);
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, is_active: !current } : t));
    setToggling(null);
  }

  return (
    <>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Text
          fontFamily="var(--font-mono)"
          fontSize="10px"
          fontWeight={500}
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="var(--mute)"
        >
          {templates.length} {templates.length === 1 ? 'Template' : 'Templates'}
        </Text>
        <motion.button
          onClick={openCreate}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            height: '32px', padding: '0 12px',
            borderRadius: 'var(--radius-2)',
            background: 'var(--ink)',
            color: 'var(--paper)',
            fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500,
            border: 'none', cursor: 'pointer',
          }}
        >
          <Plus size={12} strokeWidth={2} />
          Neues Template
        </motion.button>
      </Box>

      {/* Template list */}
      <Box border="1px solid var(--mist)" borderRadius="var(--radius-3)" overflow="hidden" bg="var(--paper)">
        <Box overflowX="auto">
        {/* Head */}
        <Box
          display="grid"
          gridTemplateColumns="1fr 160px 160px 80px 60px"
          minW="520px"
          px={5}
          py={3}
          bg="var(--frost)"
          borderBottom="1px solid var(--mist)"
        >
          {['Name', 'Zielgruppe', 'Produkt', 'Status', ''].map(h => (
            <Text
              key={h}
              fontFamily="var(--font-mono)"
              fontSize="10px"
              fontWeight={500}
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="var(--mute)"
            >
              {h}
            </Text>
          ))}
        </Box>

        {templates.length === 0 ? (
          <Box px={5} py={8} textAlign="center">
            <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)">
              Noch keine Templates. Erstelle das erste.
            </Text>
          </Box>
        ) : (
          templates.map((t, i) => (
            <Box
              key={t.id}
              display="grid"
              gridTemplateColumns="1fr 160px 160px 80px 60px"
              minW="520px"
              px={5}
              py={3}
              borderBottom={i < templates.length - 1 ? '1px solid var(--mist)' : undefined}
              alignItems="center"
            >
              {/* Name */}
              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={500}
                color="var(--ink)"
                isTruncated
              >
                {t.name}
              </Text>

              {/* Target audience */}
              <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" isTruncated>
                {t.target_audience ?? '—'}
              </Text>

              {/* Product/service */}
              <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" isTruncated>
                {t.product_service ?? '—'}
              </Text>

              {/* Toggle active */}
              <Box display="flex" alignItems="center" gap={2}>
                <Switch
                  isChecked={t.is_active}
                  onChange={() => handleToggle(t.id, t.is_active)}
                  isDisabled={toggling === t.id}
                  size="sm"
                  colorScheme="green"
                />
                <Text fontFamily="var(--font-mono)" fontSize="10px" color="var(--mute)">
                  {t.is_active ? 'Aktiv' : 'Aus'}
                </Text>
              </Box>

              {/* Edit button */}
              <Box display="flex" justifyContent="flex-end">
                <Box
                  as="button"
                  onClick={() => openEdit(t)}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  w="28px"
                  h="28px"
                  borderRadius="var(--radius-2)"
                  border="1px solid var(--mist)"
                  bg="transparent"
                  color="var(--mute)"
                  cursor="pointer"
                  transition="all 120ms"
                  _hover={{ color: 'var(--ink)', borderColor: 'var(--ink)', bg: 'var(--frost)' }}
                >
                  <Pencil size={12} strokeWidth={1.5} />
                </Box>
              </Box>
            </Box>
          ))
        )}
        </Box>
      </Box>

      {/* Template Modal */}
      <AnimatePresence>
        {modal && (
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
            onClick={() => setModal(false)}
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
                width: '560px',
                maxWidth: '90vw',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
            >
              {/* Modal header */}
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={6}>
                <Box>
                  <span
                    className="label-kicker"
                    style={{ display: 'block', marginBottom: 'var(--space-2)' }}
                  >
                    {editing ? 'Template bearbeiten' : 'Neues Template'}
                  </span>
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="18px"
                    fontWeight={600}
                    letterSpacing="-0.02em"
                    color="var(--ink)"
                  >
                    {editing ? editing.name : 'Template erstellen'}
                  </Text>
                </Box>
                <Box
                  as="button"
                  onClick={() => setModal(false)}
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

              <Box as="form" onSubmit={handleSubmit} display="flex" flexDir="column" gap={4}>
                <FormControl isRequired>
                  <FormLabel fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--ink)" mb={1}>
                    Name
                  </FormLabel>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="z.B. Kalt-Pitch LinkedIn"
                    autoFocus
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--ink)" mb={1}>
                    Nachrichtentext
                  </FormLabel>
                  <Textarea
                    value={form.body}
                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                    placeholder="Hey {{name}}, ich habe gesehen dass…"
                    rows={5}
                    resize="vertical"
                    fontFamily="var(--font-mono)"
                    fontSize="13px"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--ink)" mb={1}>
                    Zielgruppe
                    <Text as="span" fontWeight={400} color="var(--mute)" ml={1}>(optional)</Text>
                  </FormLabel>
                  <Input
                    value={form.target_audience}
                    onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
                    placeholder="z.B. HR-Manager in KMUs"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--ink)" mb={1}>
                    Produkt / Dienstleistung
                    <Text as="span" fontWeight={400} color="var(--mute)" ml={1}>(optional)</Text>
                  </FormLabel>
                  <Input
                    value={form.product_service}
                    onChange={e => setForm(f => ({ ...f, product_service: e.target.value }))}
                    placeholder="z.B. Recruiting-Software"
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
                    onClick={() => setModal(false)}
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
                    border="none"
                    cursor={loading ? 'wait' : 'pointer'}
                    opacity={loading ? 0.65 : 1}
                    transition="all 120ms"
                    _hover={{ bg: loading ? 'var(--mute)' : 'var(--forest-deep)' }}
                    disabled={loading}
                  >
                    {loading ? 'Speichert…' : editing ? 'Speichern →' : 'Erstellen →'}
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
