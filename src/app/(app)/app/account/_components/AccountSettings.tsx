'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { Eye, EyeOff, KeyRound, User, Mail, CheckCircle2, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { t } from '@/lib/toast';

interface Props {
  email:    string;
  fullName: string;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontFamily="var(--font-mono)"
      fontSize="10px"
      letterSpacing="0.12em"
      textTransform="uppercase"
      color="var(--mute)"
      mb="6px"
    >
      — {children}
    </Text>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      bg="var(--paper)"
      border="1px solid var(--mist)"
      borderRadius="var(--radius-4)"
      overflow="hidden"
    >
      <HStack
        px="24px"
        py="16px"
        spacing="10px"
        borderBottom="1px solid var(--mist)"
        bg="var(--frost)"
      >
        <Box color="var(--forest)">{icon}</Box>
        <Text
          fontFamily="var(--font-mono)"
          fontSize="11px"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="var(--ink)"
          fontWeight={500}
        >
          {title}
        </Text>
      </HStack>
      <Box px="24px" py="20px">
        {children}
      </Box>
    </Box>
  );
}

export function AccountSettings({ email, fullName }: Props) {
  const supabase = createClient();

  // ── Email change ────────────────────────────────────────────────────────────
  const [newEmail,      setNewEmail]      = useState('');
  const [savingEmail,   setSavingEmail]   = useState(false);
  const [emailSent,     setEmailSent]     = useState(false);

  const emailValid  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim());
  const emailSame   = newEmail.trim().toLowerCase() === email.toLowerCase();
  const canSaveEmail = emailValid && !emailSame && !savingEmail;

  // Show success after returning from the email-change confirmation link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('email_changed') === '1') {
      t.success('E-Mail-Adresse erfolgreich geändert');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  async function handleEmailSave() {
    if (!canSaveEmail) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSavingEmail(false);
    if (error) {
      t.error(error.message ?? 'E-Mail konnte nicht geändert werden');
      return;
    }
    setEmailSent(true);
    setNewEmail('');
    t.success('Bestätigungs-E-Mail wurde versendet');
  }

  function handleEmailKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleEmailSave();
  }

  // ── Password change ─────────────────────────────────────────────────────────
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const pwMismatch  = confirmPw.length > 0 && newPw !== confirmPw;
  const pwTooShort  = newPw.length > 0 && newPw.length < 8;
  const canSave     = newPw.length >= 8 && newPw === confirmPw && !saving;

  async function handlePasswordSave() {
    if (!canSave) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) {
      t.error(error.message ?? 'Passwort konnte nicht geändert werden');
      return;
    }
    setSaved(true);
    setNewPw('');
    setConfirmPw('');
    setTimeout(() => setSaved(false), 3000);
    t.success('Passwort erfolgreich geändert');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handlePasswordSave();
  }

  return (
    <Box maxW="600px" w="100%">
      {/* Page header */}
      <Box mb="32px">
        <Text
          fontFamily="var(--font-mono)"
          fontSize="10px"
          letterSpacing="0.14em"
          textTransform="uppercase"
          color="var(--mute)"
          mb="4px"
        >
          — Konto
        </Text>
        <Text
          fontFamily="var(--font-display)"
          fontStyle="italic"
          fontSize="32px"
          letterSpacing="-0.03em"
          lineHeight={1}
          color="var(--ink)"
        >
          Einstellungen.
        </Text>
      </Box>

      <VStack align="stretch" spacing="16px">

        {/* Account Info (read-only) */}
        <Section icon={<User size={14} strokeWidth={1.5} />} title="Konto-Informationen">
          <VStack align="stretch" spacing="16px">
            <Box>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={fullName}
                isReadOnly
                bg="var(--frost)"
                border="1px solid var(--mist)"
                borderRadius="var(--radius-2)"
                fontFamily="var(--font-sans)"
                fontSize="14px"
                color="var(--ink)"
                _readOnly={{ opacity: 0.7, cursor: 'default' }}
                h="40px"
              />
            </Box>
            <Box>
              <FieldLabel>Aktuelle E-Mail</FieldLabel>
              <HStack spacing="8px">
                <Box color="var(--mute)" flexShrink={0}>
                  <Mail size={14} strokeWidth={1.5} />
                </Box>
                <Input
                  value={email}
                  isReadOnly
                  bg="var(--frost)"
                  border="1px solid var(--mist)"
                  borderRadius="var(--radius-2)"
                  fontFamily="var(--font-sans)"
                  fontSize="14px"
                  color="var(--ink)"
                  _readOnly={{ opacity: 0.7, cursor: 'default' }}
                  h="40px"
                />
              </HStack>
            </Box>
          </VStack>
        </Section>

        {/* Email Change */}
        <Section icon={<Mail size={14} strokeWidth={1.5} />} title="E-Mail ändern">
          <VStack align="stretch" spacing="16px">

            {emailSent ? (
              <HStack
                spacing="10px"
                bg="rgba(74,124,92,0.07)"
                border="1px solid rgba(74,124,92,0.2)"
                borderRadius="var(--radius-3)"
                px="16px"
                py="14px"
              >
                <CheckCircle2 size={16} strokeWidth={1.5} color="var(--forest)" />
                <Box>
                  <Text fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500} color="var(--forest)">
                    Bestätigungs-E-Mail versendet
                  </Text>
                  <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)" mt="2px">
                    Bitte prüfe dein Postfach und klicke den Bestätigungslink.
                  </Text>
                </Box>
              </HStack>
            ) : (
              <Box>
                <FieldLabel>Neue E-Mail-Adresse</FieldLabel>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  placeholder={email}
                  bg="var(--paper)"
                  border="1px solid"
                  borderColor={newEmail && !emailValid ? 'rgba(239,68,68,0.50)' : 'var(--mist)'}
                  borderRadius="var(--radius-2)"
                  fontFamily="var(--font-sans)"
                  fontSize="14px"
                  color="var(--ink)"
                  h="40px"
                  _focus={{ borderColor: 'var(--forest)', boxShadow: 'none', outline: 'none' }}
                  _placeholder={{ color: 'var(--mist)', fontSize: '13px' }}
                />
                {emailSame && newEmail.length > 0 && (
                  <Text fontFamily="var(--font-sans)" fontSize="12px" color="#DC2626" mt="5px">
                    Das ist bereits deine aktuelle E-Mail-Adresse.
                  </Text>
                )}
              </Box>
            )}

            <HStack justify="space-between" align="center" pt="4px">
              <Text
                fontFamily="var(--font-sans)"
                fontSize="12px"
                color="var(--mute)"
                maxW="320px"
                lineHeight={1.5}
              >
                Du erhältst eine Bestätigungs-E-Mail an die neue Adresse.
              </Text>

              {!emailSent && (
                <Box
                  as="button"
                  onClick={handleEmailSave}
                  disabled={!canSaveEmail}
                  display="inline-flex"
                  alignItems="center"
                  gap="6px"
                  px="20px"
                  py="9px"
                  borderRadius="var(--radius-2)"
                  bg={canSaveEmail ? 'var(--forest)' : 'var(--mist)'}
                  color={canSaveEmail ? 'var(--paper)' : 'var(--mute)'}
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                  fontWeight={600}
                  cursor={canSaveEmail ? 'pointer' : 'not-allowed'}
                  opacity={savingEmail ? 0.6 : 1}
                  transition="all 150ms ease"
                  _hover={canSaveEmail ? { bg: 'var(--leaf)' } : {}}
                  border="none"
                  flexShrink={0}
                >
                  <Send size={13} strokeWidth={1.8} />
                  {savingEmail ? 'Wird gesendet…' : 'Bestätigung senden'}
                </Box>
              )}

              {emailSent && (
                <Box
                  as="button"
                  onClick={() => setEmailSent(false)}
                  px="16px"
                  py="9px"
                  borderRadius="var(--radius-2)"
                  border="1px solid var(--mist)"
                  bg="transparent"
                  color="var(--mute)"
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                  cursor="pointer"
                  transition="all 150ms ease"
                  _hover={{ bg: 'var(--frost)', color: 'var(--ink)' }}
                >
                  Neue Adresse eingeben
                </Box>
              )}
            </HStack>
          </VStack>
        </Section>

        {/* Password Change */}
        <Section icon={<KeyRound size={14} strokeWidth={1.5} />} title="Passwort ändern">
          <VStack align="stretch" spacing="16px">
            {/* New password */}
            <Box>
              <FieldLabel>Neues Passwort</FieldLabel>
              <InputGroup>
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e) => { setNewPw(e.target.value); setSaved(false); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Mindestens 8 Zeichen"
                  bg="var(--paper)"
                  border="1px solid"
                  borderColor={pwTooShort ? 'rgba(239,68,68,0.50)' : 'var(--mist)'}
                  borderRadius="var(--radius-2)"
                  fontFamily="var(--font-sans)"
                  fontSize="14px"
                  color="var(--ink)"
                  h="40px"
                  _focus={{ borderColor: 'var(--forest)', boxShadow: 'none', outline: 'none' }}
                  _placeholder={{ color: 'var(--mist)', fontSize: '13px' }}
                  pr="40px"
                />
                <InputRightElement h="40px">
                  <IconButton
                    aria-label={showNew ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    icon={showNew ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                    variant="ghost"
                    size="sm"
                    color="var(--mute)"
                    _hover={{ color: 'var(--ink)', bg: 'transparent' }}
                    onClick={() => setShowNew(v => !v)}
                  />
                </InputRightElement>
              </InputGroup>
              {pwTooShort && (
                <Text fontFamily="var(--font-sans)" fontSize="12px" color="#DC2626" mt="5px">
                  Mindestens 8 Zeichen erforderlich.
                </Text>
              )}
            </Box>

            {/* Confirm password */}
            <Box>
              <FieldLabel>Passwort bestätigen</FieldLabel>
              <InputGroup>
                <Input
                  type={showConf ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={(e) => { setConfirmPw(e.target.value); setSaved(false); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Passwort wiederholen"
                  bg="var(--paper)"
                  border="1px solid"
                  borderColor={pwMismatch ? 'rgba(239,68,68,0.50)' : 'var(--mist)'}
                  borderRadius="var(--radius-2)"
                  fontFamily="var(--font-sans)"
                  fontSize="14px"
                  color="var(--ink)"
                  h="40px"
                  _focus={{ borderColor: 'var(--forest)', boxShadow: 'none', outline: 'none' }}
                  _placeholder={{ color: 'var(--mist)', fontSize: '13px' }}
                  pr="40px"
                />
                <InputRightElement h="40px">
                  <IconButton
                    aria-label={showConf ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    icon={showConf ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                    variant="ghost"
                    size="sm"
                    color="var(--mute)"
                    _hover={{ color: 'var(--ink)', bg: 'transparent' }}
                    onClick={() => setShowConf(v => !v)}
                  />
                </InputRightElement>
              </InputGroup>
              {pwMismatch && (
                <Text fontFamily="var(--font-sans)" fontSize="12px" color="#DC2626" mt="5px">
                  Passwörter stimmen nicht überein.
                </Text>
              )}
            </Box>

            {/* Save button */}
            <HStack justify="flex-end" pt="4px">
              {saved && (
                <HStack spacing="6px" color="var(--forest)">
                  <CheckCircle2 size={14} strokeWidth={1.5} />
                  <Text fontFamily="var(--font-sans)" fontSize="13px" fontWeight={500}>
                    Gespeichert
                  </Text>
                </HStack>
              )}
              <Box
                as="button"
                onClick={handlePasswordSave}
                disabled={!canSave}
                px="20px"
                py="9px"
                borderRadius="var(--radius-2)"
                bg={canSave ? 'var(--forest)' : 'var(--mist)'}
                color={canSave ? 'var(--paper)' : 'var(--mute)'}
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={600}
                cursor={canSave ? 'pointer' : 'not-allowed'}
                opacity={saving ? 0.6 : 1}
                transition="all 150ms ease"
                _hover={canSave ? { bg: 'var(--leaf)' } : {}}
                border="none"
              >
                {saving ? 'Wird gespeichert…' : 'Passwort speichern'}
              </Box>
            </HStack>
          </VStack>
        </Section>

      </VStack>
    </Box>
  );
}
