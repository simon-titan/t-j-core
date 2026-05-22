'use client';

import { useState } from 'react';
import { Box, Text, HStack, Select, Avatar } from '@chakra-ui/react';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import type { OrgMember, TemplateWithStats, PitchStatus } from './types';

interface Props {
  members:   OrgMember[];
  templates: TemplateWithStats[];
  noTemplatePitches: Array<{ id: string; status: PitchStatus; sent_by: string; leads: Array<{ id: string }> }>;
  currentUserId: string;
}

interface MemberStats {
  member:    OrgMember;
  pitches:   number;
  answered:  number;
  withAppt:  number;
  template:  string;
}

function computeMemberStats(
  members: OrgMember[],
  templates: TemplateWithStats[],
  noTemplatePitches: Props['noTemplatePitches'],
  templateFilter: string,
): MemberStats[] {
  const allPitches = [
    ...templates.flatMap(t =>
      t.pitches.map(p => ({ ...p, templateName: t.name, templateId: t.id }))
    ),
    ...noTemplatePitches.map(p => ({ ...p, templateName: 'Ohne Template', templateId: 'no-template' })),
  ];

  return members.map(member => {
    const memberPitches = allPitches.filter(p => {
      const matchUser     = p.sent_by === member.id;
      const matchTemplate = !templateFilter || p.templateId === templateFilter;
      return matchUser && matchTemplate;
    });

    return {
      member,
      pitches:  memberPitches.length,
      answered: memberPitches.filter(p => p.status === 'answered').length,
      withAppt: memberPitches.filter(p => p.leads?.length > 0).length,
      template: templateFilter
        ? (templates.find(t => t.id === templateFilter)?.name ?? 'Ohne Template')
        : 'Alle',
    };
  }).sort((a, b) => b.pitches - a.pitches);
}

export function TeamPerformanceSection({ members, templates, noTemplatePitches, currentUserId }: Props) {
  const [collapsed, setCollapsed]         = useState(false);
  const [templateFilter, setTemplate]     = useState('');

  if (members.length <= 1) return null;

  const stats = computeMemberStats(members, templates, noTemplatePitches, templateFilter);

  return (
    <Box
      mb={8}
      border="1px solid var(--mist)"
      borderRadius="var(--radius-4)"
      overflow="hidden"
    >
      {/* Section Header */}
      <HStack
        justify="space-between"
        px={4}
        py={3}
        bg="var(--frost)"
        borderBottom={collapsed ? 'none' : '1px solid var(--mist)'}
        cursor="pointer"
        onClick={() => setCollapsed(c => !c)}
        _hover={{ bg: 'var(--ink-04)' }}
        transition="background 120ms var(--ease-default)"
      >
        <HStack spacing={2}>
          <TrendingUp size={14} strokeWidth={2} color="var(--mute)" />
          <Text
            fontFamily="var(--font-mono)"
            fontSize="10px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="var(--mute)"
          >
            Team Performance
          </Text>
          <Box
            px="6px"
            py="1px"
            bg="var(--mist)"
            borderRadius="var(--radius-full)"
          >
            <Text fontFamily="var(--font-mono)" fontSize="9px" color="var(--mute)">
              {members.length} Mitglieder
            </Text>
          </Box>
        </HStack>

        <HStack spacing={3} onClick={e => e.stopPropagation()}>
          <Select
            size="xs"
            fontFamily="var(--font-sans)"
            fontSize="12px"
            value={templateFilter}
            onChange={e => setTemplate(e.target.value)}
            bg="var(--paper)"
            border="1px solid var(--mist)"
            borderRadius="var(--radius-2)"
            color="var(--ink)"
            w="160px"
            cursor="pointer"
            onClick={e => e.stopPropagation()}
          >
            <option value="">Alle Templates</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
            <option value="no-template">Ohne Template</option>
          </Select>

          <Box color="var(--mute)">
            {collapsed
              ? <ChevronDown size={16} strokeWidth={2} />
              : <ChevronUp size={16} strokeWidth={2} />
            }
          </Box>
        </HStack>
      </HStack>

      {!collapsed && (
        <>
          {/* Table Header */}
          <Box
            display="grid"
            gridTemplateColumns="1fr 100px 90px 90px"
            px={4}
            py={2}
            borderBottom="1px solid var(--mist)"
          >
            {['Mitglied', 'Pitches', 'Antwortrate', 'Terminrate'].map(h => (
              <Text
                key={h}
                fontFamily="var(--font-mono)"
                fontSize="9px"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="var(--mute)"
              >
                {h}
              </Text>
            ))}
          </Box>

          {/* Rows */}
          {stats.map(({ member, pitches, answered, withAppt }) => {
            const answerRate = pitches > 0 ? Math.round((answered / pitches) * 100) : 0;
            const apptRate   = pitches > 0 ? Math.round((withAppt / pitches) * 100) : 0;
            const isMe       = member.id === currentUserId;

            return (
              <Box
                key={member.id}
                display="grid"
                gridTemplateColumns="1fr 100px 90px 90px"
                px={4}
                py={3}
                borderBottom="1px solid var(--mist)"
                bg={isMe ? 'rgba(74,124,92,0.03)' : 'transparent'}
                _last={{ borderBottom: 'none' }}
              >
                {/* Member */}
                <HStack spacing={2}>
                  <Avatar
                    name={member.full_name ?? '?'}
                    src={member.avatar_url ?? undefined}
                    size="xs"
                    bg="var(--forest)"
                    color="var(--paper)"
                    fontFamily="var(--font-sans)"
                  />
                  <Box>
                    <Text
                      fontFamily="var(--font-sans)"
                      fontSize="13px"
                      fontWeight={isMe ? 600 : 400}
                      color="var(--ink)"
                    >
                      {member.full_name ?? 'Unbekannt'}
                      {isMe && (
                        <Text as="span" fontSize="11px" color="var(--mute)" fontWeight={400} ml={1}>
                          (du)
                        </Text>
                      )}
                    </Text>
                  </Box>
                </HStack>

                {/* Pitches */}
                <Text
                  fontFamily="var(--font-display)"
                  fontStyle="italic"
                  fontSize="18px"
                  color="var(--ink)"
                  letterSpacing="-0.01em"
                >
                  {pitches}
                </Text>

                {/* Answer Rate */}
                <HStack spacing={1}>
                  <Text
                    fontFamily="var(--font-display)"
                    fontStyle="italic"
                    fontSize="18px"
                    color={answerRate >= 20 ? 'var(--forest)' : 'var(--ink)'}
                    letterSpacing="-0.01em"
                  >
                    {answerRate}
                  </Text>
                  <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--mute)">%</Text>
                </HStack>

                {/* Appt Rate */}
                <HStack spacing={1}>
                  <Text
                    fontFamily="var(--font-display)"
                    fontStyle="italic"
                    fontSize="18px"
                    color={apptRate >= 10 ? 'var(--forest)' : 'var(--ink)'}
                    letterSpacing="-0.01em"
                  >
                    {apptRate}
                  </Text>
                  <Text fontFamily="var(--font-sans)" fontSize="11px" color="var(--mute)">%</Text>
                </HStack>
              </Box>
            );
          })}
        </>
      )}
    </Box>
  );
}
