'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, VStack, HStack, Spinner } from '@chakra-ui/react';
import { Upload, Trash2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Organization } from '@/lib/types/database';

interface Props {
  org: Organization;
}

export function OrgSettingsClient({ org }: Props) {
  const router                          = useRouter();
  const inputRef                        = useRef<HTMLInputElement>(null);
  const [preview, setPreview]           = useState<string | null>(null);
  const [file, setFile]                 = useState<File | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [removing, setRemoving]         = useState(false);

  const currentLogo = preview ?? org.logo_url ?? null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Datei zu groß (max. 5 MB)');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch(`/api/orgs/${org.id}/logo`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload fehlgeschlagen');
      toast.success('Logo erfolgreich hochgeladen');
      setFile(null);
      setPreview(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      const res = await fetch(`/api/orgs/${org.id}/logo`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Entfernen fehlgeschlagen');
      }
      toast.success('Logo entfernt');
      setPreview(null);
      setFile(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Entfernen fehlgeschlagen');
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Box maxW="640px">
      <Box mb={8}>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: '0 0 4px',
          }}
        >
          Einstellungen
        </h1>
        <Text fontFamily="var(--font-sans)" fontSize="14px" color="var(--mute)">
          Organisationsprofil und Branding verwalten
        </Text>
      </Box>

      {/* Organisation card */}
      <Box
        border="1px solid var(--mist)"
        borderRadius="var(--radius-4)"
        overflow="hidden"
      >
        {/* Card header */}
        <Box
          px="var(--space-6)"
          py="var(--space-5)"
          borderBottom="1px solid var(--mist)"
          bg="var(--frost)"
        >
          <Text
            fontFamily="var(--font-sans)"
            fontSize="14px"
            fontWeight={600}
            color="var(--ink)"
          >
            Organisations-Logo
          </Text>
          <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)" mt={1}>
            Wird in der Topbar neben „T&J Consulting" angezeigt.
          </Text>
        </Box>

        <Box px="var(--space-6)" py="var(--space-6)">
          <VStack align="stretch" gap="var(--space-6)">
            {/* Preview */}
            <HStack gap="var(--space-5)" align="flex-start">
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="80px"
                h="80px"
                borderRadius="var(--radius-3)"
                border="1px solid var(--mist)"
                bg="var(--frost)"
                overflow="hidden"
                flexShrink={0}
              >
                {currentLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentLogo}
                    alt={org.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box color="var(--mute)" opacity={0.35}>
                    <ImageIcon size={28} strokeWidth={1.2} />
                  </Box>
                )}
              </Box>

              <Box>
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="14px"
                  fontWeight={500}
                  color="var(--ink)"
                  mb={1}
                >
                  {org.name}
                </Text>
                <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)">
                  JPEG, PNG oder WebP · Max. 5 MB
                </Text>
                {preview && (
                  <Text
                    fontFamily="var(--font-sans)"
                    fontSize="12px"
                    color="var(--forest)"
                    mt={1}
                  >
                    Vorschau — noch nicht gespeichert
                  </Text>
                )}
              </Box>
            </HStack>

            {/* Actions */}
            <HStack gap="var(--space-3)" flexWrap="wrap">
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <Box
                as="button"
                onClick={() => inputRef.current?.click()}
                display="inline-flex"
                alignItems="center"
                gap="var(--space-2)"
                px="var(--space-5)"
                h="40px"
                borderRadius="var(--radius-3)"
                border="1px solid var(--mist)"
                bg="var(--frost)"
                fontFamily="var(--font-sans)"
                fontSize="13px"
                fontWeight={500}
                color="var(--ink)"
                cursor="pointer"
                transition="all 140ms"
                _hover={{ bg: 'var(--paper)', borderColor: 'rgba(139,134,126,0.5)' }}
              >
                <ImageIcon size={14} strokeWidth={1.5} />
                {file ? `${file.name.slice(0, 22)}…` : 'Datei wählen'}
              </Box>

              {file && (
                <Box
                  as="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  display="inline-flex"
                  alignItems="center"
                  gap="var(--space-2)"
                  px="var(--space-5)"
                  h="40px"
                  borderRadius="var(--radius-3)"
                  bg={uploading ? 'var(--mist)' : 'var(--forest)'}
                  color={uploading ? 'var(--mute)' : 'var(--paper)'}
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                  fontWeight={500}
                  cursor={uploading ? 'not-allowed' : 'pointer'}
                  border="none"
                  transition="all 140ms"
                  _hover={uploading ? {} : { bg: 'var(--glow)' }}
                >
                  {uploading ? <Spinner size="xs" /> : <Upload size={14} strokeWidth={1.5} />}
                  {uploading ? 'Wird hochgeladen…' : 'Logo speichern'}
                </Box>
              )}

              {(org.logo_url || preview) && !file && (
                <Box
                  as="button"
                  onClick={handleRemove}
                  disabled={removing}
                  display="inline-flex"
                  alignItems="center"
                  gap="var(--space-2)"
                  px="var(--space-5)"
                  h="40px"
                  borderRadius="var(--radius-3)"
                  border="1px solid rgba(239,68,68,0.25)"
                  bg="rgba(239,68,68,0.05)"
                  color="#B91C1C"
                  fontFamily="var(--font-sans)"
                  fontSize="13px"
                  fontWeight={500}
                  cursor={removing ? 'not-allowed' : 'pointer'}
                  transition="all 140ms"
                  _hover={removing ? {} : { bg: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.40)' }}
                >
                  {removing ? <Spinner size="xs" /> : <Trash2 size={14} strokeWidth={1.5} />}
                  {removing ? 'Wird entfernt…' : 'Logo entfernen'}
                </Box>
              )}
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
