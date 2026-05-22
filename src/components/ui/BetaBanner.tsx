'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Link,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { Info, AlertTriangle, Mail } from 'lucide-react';

export function BetaBanner() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        h="36px"
        zIndex={40}
        bg="rgba(180,130,0,0.10)"
        borderBottom="1px solid rgba(180,130,0,0.22)"
        backdropFilter="blur(8px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px="var(--space-5)"
      >
        <HStack spacing="8px">
          <Text
            fontFamily="var(--font-mono)"
            fontSize="11px"
            letterSpacing="0.08em"
            color="#92400E"
            _dark={{ color: '#FCD34D' }}
          >
            Du befindest dich aktuell in der Beta-Version 0.1
          </Text>
          <Box
            as="button"
            onClick={onOpen}
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="18px"
            h="18px"
            borderRadius="var(--radius-full)"
            color="#92400E"
            _dark={{ color: '#FCD34D' }}
            opacity={0.75}
            _hover={{ opacity: 1 }}
            transition="opacity 150ms ease"
            aria-label="Beta-Info anzeigen"
          >
            <Info size={14} strokeWidth={1.8} />
          </Box>
        </HStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(6px)" bg="rgba(14,14,12,0.50)" />
        <ModalContent
          bg="var(--paper)"
          border="1px solid var(--mist)"
          borderRadius="var(--radius-4)"
          boxShadow="0 24px 64px rgba(14,14,12,0.18)"
          mx="16px"
        >
          <ModalHeader p={0}>
            <Box
              bg="linear-gradient(135deg, #0A0F0D 0%, #1a2e1f 100%)"
              borderRadius="var(--radius-4) var(--radius-4) 0 0"
              px="24px"
              pt="24px"
              pb="20px"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0} left={0} right={0} h="2px"
                bg="linear-gradient(90deg, transparent 0%, rgba(234,179,8,0.7) 40%, rgba(234,179,8,0.3) 100%)"
              />
              <HStack spacing="10px" mb="4px">
                <Box color="rgba(234,179,8,0.85)">
                  <AlertTriangle size={16} strokeWidth={1.5} />
                </Box>
                <Text
                  fontFamily="var(--font-mono)"
                  fontSize="10px"
                  letterSpacing="0.14em"
                  textTransform="uppercase"
                  color="rgba(252,252,253,0.40)"
                >
                  — Beta-Hinweis
                </Text>
              </HStack>
              <Text
                fontFamily="var(--font-display)"
                fontStyle="italic"
                fontSize="22px"
                letterSpacing="-0.025em"
                color="var(--paper)"
                lineHeight={1.15}
              >
                Version 0.1 — Beta
              </Text>
            </Box>
          </ModalHeader>
          <ModalCloseButton
            top="16px"
            right="16px"
            color="rgba(252,252,253,0.45)"
            _hover={{ color: 'var(--paper)' }}
            borderRadius="var(--radius-2)"
          />

          <ModalBody px="24px" pt="20px" pb="24px">
            <VStack align="stretch" spacing="16px">
              <Text
                fontFamily="var(--font-sans)"
                fontSize="14px"
                color="var(--ink)"
                lineHeight={1.65}
              >
                Diese Plattform befindet sich aktuell in der{' '}
                <Box as="span" fontWeight={600} color="var(--forest)">
                  Beta-Phase (Version 0.1)
                </Box>
                . Es kann zu unerwarteten Fehlern, Darstellungsproblemen oder
                eingeschränkter Funktionalität kommen.
              </Text>

              <Text
                fontFamily="var(--font-sans)"
                fontSize="14px"
                color="var(--ink)"
                lineHeight={1.65}
              >
                Solltest du einen Fehler entdecken, bitten wir dich, einen{' '}
                <Box as="span" fontWeight={600}>
                  Screenshot
                </Box>{' '}
                sowie eine kurze Beschreibung des Problems an folgende Adresse
                zu senden:
              </Text>

              <Box
                bg="rgba(74,124,92,0.06)"
                border="1px solid rgba(74,124,92,0.18)"
                borderLeft="3px solid var(--forest)"
                borderRadius="var(--radius-2)"
                px="16px"
                py="12px"
              >
                <HStack spacing="10px">
                  <Mail size={14} color="var(--forest)" strokeWidth={1.5} />
                  <Link
                    href="mailto:simon@titandevelopment.de"
                    fontFamily="var(--font-mono)"
                    fontSize="13px"
                    fontWeight={600}
                    color="var(--forest)"
                    _hover={{ textDecoration: 'underline' }}
                    isExternal
                  >
                    simon@titandevelopment.de
                  </Link>
                </HStack>
              </Box>

              <Text
                fontFamily="var(--font-sans)"
                fontSize="13px"
                color="var(--mute)"
                lineHeight={1.6}
              >
                Vielen Dank für dein Feedback — es hilft uns, die Plattform
                schnell zu verbessern.
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
