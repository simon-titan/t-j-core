'use client';

import { useState, useCallback, Fragment } from 'react';
import { Box, Text, Tooltip } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, VisibilityMatrix } from '@/lib/types/database';

interface Props {
  orgId:    string;
  members:  Profile[];
  matrix:   VisibilityMatrix[];
}

export function VisibilityTab({ orgId, members, matrix: initialMatrix }: Props) {
  const [matrix, setMatrix] = useState(initialMatrix);
  const [pending, setPending] = useState<Set<string>>(new Set());

  // Build a Set of "viewer_id:target_id" for O(1) lookup
  const allowed = new Set(matrix.map(r => `${r.viewer_id}:${r.target_id}`));

  const canSee = useCallback(
    (viewerId: string, targetId: string) =>
      viewerId === targetId || allowed.has(`${viewerId}:${targetId}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matrix]
  );

  async function toggle(viewerId: string, targetId: string, currentlyAllowed: boolean) {
    const key = `${viewerId}:${targetId}`;
    if (pending.has(key)) return;

    setPending(prev => new Set(prev).add(key));
    const supabase = createClient();

    if (currentlyAllowed) {
      await supabase
        .from('visibility_matrix')
        .delete()
        .eq('org_id', orgId)
        .eq('viewer_id', viewerId)
        .eq('target_id', targetId);
      setMatrix(prev => prev.filter(r => !(r.viewer_id === viewerId && r.target_id === targetId)));
    } else {
      const { data } = await supabase
        .from('visibility_matrix')
        .insert({ org_id: orgId, viewer_id: viewerId, target_id: targetId })
        .select()
        .single();
      if (data) setMatrix(prev => [...prev, data as VisibilityMatrix]);
    }

    setPending(prev => { const s = new Set(prev); s.delete(key); return s; });
  }

  if (members.length === 0) {
    return (
      <Box py={8} textAlign="center">
        <Text fontFamily="var(--font-sans)" fontSize="13px" color="var(--mute)">
          Noch keine Benutzer — füge zuerst Benutzer hinzu.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Legend */}
      <Box display="flex" alignItems="center" gap={4} mb={5}>
        <Text fontFamily="var(--font-sans)" fontSize="12px" color="var(--mute)">
          Zeile = Betrachter &nbsp;·&nbsp; Spalte = sichtbares Mitglied
        </Text>
        <Box display="flex" alignItems="center" gap={2}>
          <Box w="14px" h="14px" borderRadius="var(--radius-1)" bg="var(--forest)" />
          <Text fontFamily="var(--font-mono)" fontSize="10px" color="var(--mute)">kann sehen</Text>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Box w="14px" h="14px" borderRadius="var(--radius-1)" border="1px solid var(--mist)" bg="var(--frost)" />
          <Text fontFamily="var(--font-mono)" fontSize="10px" color="var(--mute)">versteckt</Text>
        </Box>
      </Box>

      {/* Matrix */}
      <Box overflowX="auto">
        <Box
          display="grid"
          style={{
            gridTemplateColumns: `180px repeat(${members.length}, 40px)`,
          }}
          gap={0}
        >
          {/* Corner cell */}
          <Box
            p={2}
            borderBottom="1px solid var(--mist)"
            borderRight="1px solid var(--mist)"
          />

          {/* Column headers (targets) */}
          {members.map(target => (
            <Tooltip key={target.id} label={target.full_name ?? target.id} placement="top">
              <Box
                p={1}
                display="flex"
                alignItems="flex-end"
                justifyContent="center"
                h="60px"
                borderBottom="1px solid var(--mist)"
                borderRight="1px solid var(--mist)"
              >
                <Text
                  fontFamily="var(--font-mono)"
                  fontSize="10px"
                  color="var(--mute)"
                  style={{
                    writingMode: 'vertical-lr',
                    transform: 'rotate(180deg)',
                    maxHeight: '52px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {(target.full_name ?? 'User').split(' ')[0]}
                </Text>
              </Box>
            </Tooltip>
          ))}

          {/* Rows */}
          {members.map(viewer => (
            <Fragment key={viewer.id}>
              {/* Row label */}
              <Box
                px={3}
                py={2}
                display="flex"
                alignItems="center"
                borderBottom="1px solid var(--mist)"
                borderRight="1px solid var(--mist)"
                bg="var(--frost)"
              >
                <Text
                  fontFamily="var(--font-sans)"
                  fontSize="12px"
                  fontWeight={500}
                  color="var(--ink)"
                  isTruncated
                >
                  {viewer.full_name ?? '—'}
                </Text>
              </Box>

              {/* Checkboxes */}
              {members.map(target => {
                const isSelf    = viewer.id === target.id;
                const checked   = canSee(viewer.id, target.id);
                const key       = `${viewer.id}:${target.id}`;
                const isPending = pending.has(key);

                return (
                  <Box
                    key={`cell-${viewer.id}-${target.id}`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderBottom="1px solid var(--mist)"
                    borderRight="1px solid var(--mist)"
                    p={1}
                  >
                    <Box
                      as={isSelf ? 'div' : 'button'}
                      onClick={isSelf ? undefined : () => toggle(viewer.id, target.id, checked)}
                      w="22px"
                      h="22px"
                      borderRadius="var(--radius-1)"
                      border="1px solid"
                      borderColor={
                        isSelf ? 'var(--mist)'
                          : checked ? 'var(--forest)'
                          : 'var(--mist)'
                      }
                      bg={
                        isSelf ? 'var(--mist)'
                          : checked ? 'var(--forest)'
                          : 'var(--frost)'
                      }
                      cursor={isSelf ? 'default' : isPending ? 'wait' : 'pointer'}
                      opacity={isPending ? 0.5 : 1}
                      transition="all 120ms var(--ease-default)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      _hover={
                        isSelf ? undefined
                          : checked
                          ? { bg: 'var(--glow)', borderColor: 'var(--glow)' }
                          : { borderColor: 'var(--mute)' }
                      }
                      title={
                        isSelf ? 'Eigenes Profil'
                          : checked ? 'Klicken um Sichtbarkeit zu entfernen'
                          : 'Klicken um Sichtbarkeit zu erlauben'
                      }
                    >
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke={isSelf ? 'var(--mute)' : 'var(--paper)'}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Fragment>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
