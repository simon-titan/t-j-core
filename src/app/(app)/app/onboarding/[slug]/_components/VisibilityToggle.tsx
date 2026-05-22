'use client';

import { HStack, Box } from '@chakra-ui/react';
import { Lock, Users } from 'lucide-react';

interface Props {
  value:    'private' | 'team';
  onChange: (v: 'private' | 'team') => void;
  disabled?: boolean;
}

export function VisibilityToggle({ value, onChange, disabled }: Props) {
  return (
    <HStack
      gap="2px"
      bg="var(--mist)"
      borderRadius="var(--radius-full)"
      p="2px"
      display="inline-flex"
    >
      <ToggleBtn
        active={value === 'private'}
        onClick={() => !disabled && onChange('private')}
        icon={<Lock size={11} strokeWidth={2} />}
        label="Privat"
      />
      <ToggleBtn
        active={value === 'team'}
        onClick={() => !disabled && onChange('team')}
        icon={<Users size={11} strokeWidth={2} />}
        label="Team"
      />
    </HStack>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active:  boolean;
  onClick: () => void;
  icon:    React.ReactNode;
  label:   string;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      display="inline-flex"
      alignItems="center"
      gap="4px"
      px="10px"
      py="4px"
      borderRadius="var(--radius-full)"
      fontSize="11px"
      fontFamily="var(--font-sans)"
      fontWeight={active ? 500 : 400}
      cursor="pointer"
      border="none"
      transition="all 120ms var(--ease-default)"
      style={
        active
          ? { background: 'var(--forest)', color: 'var(--paper)' }
          : { background: 'transparent', color: 'var(--mute)' }
      }
      _hover={active ? {} : { color: 'var(--ink)' }}
    >
      {icon}
      {label}
    </Box>
  );
}
