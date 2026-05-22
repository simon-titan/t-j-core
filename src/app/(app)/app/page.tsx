import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Box, Grid, Text } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Organization } from '@/lib/types/database';
import { deriveKanbanColumn } from './_components/crmHelpers';
import { MetricsRow } from './_components/MetricsRow';
import { PitchSnapshot } from './_components/PitchSnapshot';
import { CrmSnapshot } from './_components/CrmSnapshot';
import { OnboardingProgress } from './_components/OnboardingProgress';
import { TeamLeaderboard } from './_components/TeamLeaderboard';
import { NotificationsPreview } from './_components/NotificationsPreview';
import { CheckInBanner } from './_components/CheckInBanner';
import type {
  DashboardMetrics,
  PitchSnapshotItem,
  CrmSnapshotLead,
  TeamMemberRow,
  DashboardNotification,
  ModuleProgressItem,
} from './_components/types';

export const metadata: Metadata = { title: 'Dashboard' };

function getWeekStart(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekEnd(): Date {
  const weekStart = getWeekStart();
  const sunday = new Date(weekStart);
  sunday.setDate(weekStart.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getGreeting(name: string | null): string {
  const hour = new Date().getHours();
  const first = name?.split(' ')[0] ?? '';
  if (hour < 12) return `Guten Morgen${first ? `, ${first}` : ''}.`;
  if (hour < 18) return `Guten Tag${first ? `, ${first}` : ''}.`;
  return `Guten Abend${first ? `, ${first}` : ''}.`;
}

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  const profile = profileData as Profile | null;
  if (!profile) redirect('/login');

  const orgId      = profile.organization_id;
  const weekStart  = getWeekStart();
  const weekEnd    = getWeekEnd();
  const today      = getTodayStr();
  const canSeeTeam = profile.role === 'org_admin' || profile.role === 'super_admin';
  const now          = new Date();
  const periodYear   = now.getFullYear();
  const periodMonth  = now.getMonth() + 1;

  // All queries in parallel
  const [
    orgRes,
    dmsCountRes,
    answeredCountRes,
    followupsTodayRes,
    appointmentsWeekRes,
    closedLeadsRes,
    pitchSnapshotRes,
    crmLeadsRes,
    onboardingModulesRes,
    onboardingQuestionsRes,
    onboardingAnswersRes,
    notificationsRes,
    checkinSubmissionRes,
  ] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', orgId).single(),

    supabase
      .from('pitches')
      .select('*', { count: 'exact', head: true })
      .eq('sent_by', user.id)
      .gte('sent_at', weekStart.toISOString()),

    supabase
      .from('pitches')
      .select('*', { count: 'exact', head: true })
      .eq('sent_by', user.id)
      .eq('status', 'answered')
      .gte('sent_at', weekStart.toISOString()),

    supabase
      .from('followups')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .eq('status', 'pending')
      .eq('scheduled_for', today),

    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .in('status', ['scheduled', 'completed'])
      .gte('scheduled_at', weekStart.toISOString())
      .lte('scheduled_at', weekEnd.toISOString()),

    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .eq('status', 'won'),

    supabase
      .from('pitches')
      .select(`
        id, sent_at, status,
        prospects(first_name, last_name, company),
        followups(level, status, scheduled_for)
      `)
      .eq('sent_by', user.id)
      .order('sent_at', { ascending: false })
      .limit(5),

    supabase
      .from('leads')
      .select(`
        id, status,
        prospects(first_name, last_name, company),
        appointments(id, scheduled_at, status)
      `)
      .eq('organization_id', orgId)
      .not('status', 'in', '(won,lost)'),

    supabase
      .from('onboarding_modules')
      .select('*')
      .eq('is_active', true)
      .order('order_index'),

    supabase
      .from('onboarding_questions')
      .select('id, module_id'),

    supabase
      .from('onboarding_answers')
      .select('question_id')
      .eq('user_id', user.id),

    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('checkin_submissions')
      .select('id')
      .eq('user_id', user.id)
      .eq('period_year', periodYear)
      .eq('period_month', periodMonth)
      .maybeSingle(),
  ]);

  // ── Metrics ─────────────────────────────────────────────────────────────────
  const dmsThisWeek = dmsCountRes.count ?? 0;
  const answeredCount = answeredCountRes.count ?? 0;
  const answerRate = dmsThisWeek > 0 ? Math.round((answeredCount / dmsThisWeek) * 100) : 0;

  const metrics: DashboardMetrics = {
    dmsThisWeek,
    answerRate,
    followupsToday: followupsTodayRes.count ?? 0,
    appointmentsThisWeek: appointmentsWeekRes.count ?? 0,
    totalClosed: closedLeadsRes.count ?? 0,
  };

  // ── Pitch Snapshot ───────────────────────────────────────────────────────────
  const pitchSnapshot: PitchSnapshotItem[] = (pitchSnapshotRes.data ?? []).map((p: any) => ({
    id: p.id,
    sent_at: p.sent_at,
    status: p.status,
    prospect: p.prospects ?? { first_name: '?', last_name: '', company: null },
    followups: p.followups ?? [],
  }));

  // ── CRM Snapshot ─────────────────────────────────────────────────────────────
  const rawLeads = crmLeadsRes.data ?? [];
  const crmSnapshotLeads: CrmSnapshotLead[] = [];

  for (const raw of rawLeads as any[]) {
    const appointments = raw.appointments ?? [];
    const column = deriveKanbanColumn(raw.status, appointments);

    if (column !== 'heute_fällig' && column !== 'neu_terminieren') continue;

    const nextAppt =
      appointments
        .filter((a: any) => a.status === 'scheduled')
        .sort(
          (a: any, b: any) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        )[0] ?? null;

    const latestAppt =
      appointments.length > 0
        ? [...appointments].sort(
            (a: any, b: any) =>
              new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
          )[0]
        : null;

    crmSnapshotLeads.push({
      id: raw.id,
      column,
      prospect: raw.prospects ?? { first_name: '?', last_name: '', company: null },
      nextAppointmentAt: nextAppt?.scheduled_at ?? latestAppt?.scheduled_at ?? null,
    });
  }

  const heuteFällig = crmSnapshotLeads.filter((l) => l.column === 'heute_fällig');
  const neuTerminieren = crmSnapshotLeads.filter((l) => l.column === 'neu_terminieren');

  // ── Onboarding ───────────────────────────────────────────────────────────────
  const modules = onboardingModulesRes.data ?? [];
  const questions = onboardingQuestionsRes.data ?? [];
  const answers = onboardingAnswersRes.data ?? [];
  const answeredIds = new Set(answers.map((a: any) => a.question_id));

  const modulesWithProgress = modules.map((mod: any) => {
    const total = questions.filter((q: any) => q.module_id === mod.id).length;
    const answered = questions.filter(
      (q: any) => q.module_id === mod.id && answeredIds.has(q.id)
    ).length;
    const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
    let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
    if (answered > 0 && answered < total) status = 'in_progress';
    if (total > 0 && answered === total) status = 'completed';
    return { id: mod.id, slug: mod.slug, title: mod.title, icon: mod.icon, percentage: pct, status };
  });

  const totalQuestions = questions.length;
  const totalAnswered = answeredIds.size;
  const overallPct = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  const nextModules: ModuleProgressItem[] = modulesWithProgress
    .filter((m: ModuleProgressItem) => m.status !== 'completed')
    .slice(0, 3);

  // ── Notifications ─────────────────────────────────────────────────────────────
  const notifications: DashboardNotification[] = (notificationsRes.data ?? []) as DashboardNotification[];

  // ── Check-In ──────────────────────────────────────────────────────────────────
  const checkinDue = !checkinSubmissionRes.data;

  // ── Team (org_admin only) ─────────────────────────────────────────────────────
  let teamData: TeamMemberRow[] = [];
  if (canSeeTeam) {
    const { data: members } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('organization_id', orgId);

    if (members && members.length > 0) {
      const memberIds = members.map((m: any) => m.id);

      const [teamPitchesRes, teamAnsweredRes, teamApptsRes, teamClosedRes] = await Promise.all([
        supabase
          .from('pitches')
          .select('sent_by')
          .in('sent_by', memberIds)
          .gte('sent_at', weekStart.toISOString())
          .lte('sent_at', weekEnd.toISOString()),
        supabase
          .from('pitches')
          .select('sent_by')
          .in('sent_by', memberIds)
          .eq('status', 'answered')
          .gte('sent_at', weekStart.toISOString())
          .lte('sent_at', weekEnd.toISOString()),
        supabase
          .from('appointments')
          .select('assigned_to')
          .in('assigned_to', memberIds)
          .in('status', ['scheduled', 'completed'])
          .gte('scheduled_at', weekStart.toISOString())
          .lte('scheduled_at', weekEnd.toISOString()),
        supabase
          .from('leads')
          .select('assigned_to')
          .in('assigned_to', memberIds)
          .eq('status', 'won'),
      ]);

      const dmsByUser: Record<string, number> = {};
      const answeredByUser: Record<string, number> = {};
      const apptsByUser: Record<string, number> = {};
      const closedByUser: Record<string, number> = {};

      for (const row of teamPitchesRes.data ?? []) {
        dmsByUser[row.sent_by] = (dmsByUser[row.sent_by] ?? 0) + 1;
      }
      for (const row of teamAnsweredRes.data ?? []) {
        answeredByUser[row.sent_by] = (answeredByUser[row.sent_by] ?? 0) + 1;
      }
      for (const row of teamApptsRes.data ?? []) {
        if (row.assigned_to) apptsByUser[row.assigned_to] = (apptsByUser[row.assigned_to] ?? 0) + 1;
      }
      for (const row of teamClosedRes.data ?? []) {
        if (row.assigned_to) closedByUser[row.assigned_to] = (closedByUser[row.assigned_to] ?? 0) + 1;
      }

      teamData = members
        .map((m: any) => {
          const dms = dmsByUser[m.id] ?? 0;
          const answered = answeredByUser[m.id] ?? 0;
          return {
            userId: m.id,
            fullName: m.full_name ?? 'Unbekannt',
            dms,
            answerRate: dms > 0 ? Math.round((answered / dms) * 100) : 0,
            appointments: apptsByUser[m.id] ?? 0,
            closed: closedByUser[m.id] ?? 0,
            isCurrentUser: m.id === user.id,
          };
        })
        .sort((a: TeamMemberRow, b: TeamMemberRow) => b.dms - a.dms);
    }
  }

  const greeting = getGreeting(profile.full_name);

  return (
    <Box>
      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <Box
        bg="var(--forest-deep)"
        position="relative"
        overflow="hidden"
        mx={{ base: '-20px', md: '-32px' }}
        mt={{ base: '-20px', md: '-32px' }}
        mb={8}
        px={{ base: 'var(--space-6)', md: 'var(--space-9)' }}
        pt={{ base: 'var(--space-8)', md: 'var(--space-10)' }}
        pb={{ base: 'var(--space-7)', md: 'var(--space-9)' }}
      >
        {/* Radial glow */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          style={{
            background: 'radial-gradient(ellipse 55% 80% at 80% 50%, rgba(45,84,67,0.55) 0%, transparent 70%)',
          }}
        />

        <Box position="relative">
          <Text
            fontFamily="var(--font-mono)"
            fontSize="11px"
            fontWeight={500}
            letterSpacing="0.14em"
            textTransform="uppercase"
            color="var(--leaf)"
            mb="var(--space-5)"
          >
            — Dashboard
          </Text>

          <Box
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            gap="var(--space-6)"
            flexWrap="wrap"
          >
            <Text
              as="h1"
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="clamp(36px, 5.5vw, 80px)"
              lineHeight={0.92}
              letterSpacing="-0.035em"
              color="var(--paper)"
            >
              {greeting}
            </Text>

            <Text
              fontFamily="var(--font-mono)"
              fontSize="12px"
              color="rgba(252,252,253,0.40)"
              letterSpacing="0.06em"
              flexShrink={0}
              pb="6px"
            >
              {new Date().toLocaleDateString('de-DE', {
                weekday: 'long',
                day:     '2-digit',
                month:   'long',
              })}
            </Text>
          </Box>
        </Box>

        {/* Chase Trail */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="1px"
          overflow="hidden"
          sx={{
            '&::after': {
              content:        '""',
              position:       'absolute',
              inset:          0,
              background:     'linear-gradient(90deg, transparent 0%, var(--leaf) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation:      'chase 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.4s both',
            },
          }}
        />
      </Box>

      {/* Check-In Banner */}
      {checkinDue && (
        <CheckInBanner periodYear={periodYear} periodMonth={periodMonth} />
      )}

      {/* Metrics Row */}
      <Box mb={6}>
        <MetricsRow metrics={metrics} />
      </Box>

      {/* Snapshots — two columns */}
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        gap={6}
        mb={6}
        alignItems="start"
      >
        <PitchSnapshot pitches={pitchSnapshot} />
        <CrmSnapshot heuteFällig={heuteFällig} neuTerminieren={neuTerminieren} />
      </Grid>

      {/* Onboarding Progress */}
      <Box mb={6}>
        <OnboardingProgress
          overallPct={overallPct}
          totalAnswered={totalAnswered}
          totalQuestions={totalQuestions}
          nextModules={nextModules}
        />
      </Box>

      {/* Team Leaderboard (conditional) */}
      {canSeeTeam && (
        <Box mb={6}>
          <TeamLeaderboard
            initialData={teamData}
            currentUserId={user.id}
            orgId={orgId}
          />
        </Box>
      )}

      {/* Notifications Preview */}
      {notifications.length > 0 && (
        <Box mb={6}>
          <NotificationsPreview initialNotifications={notifications} />
        </Box>
      )}
    </Box>
  );
}
