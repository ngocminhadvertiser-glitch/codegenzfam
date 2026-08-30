import {
  User,
  Family,
  EmotionJournalEntry,
  ConsultationSession,
  DeepTalkTopic,
  DeepTalkSession,
  Challenge30DayTask,
  ChallengeDayProgress,
  HappinessPointRecord,
  NotificationItem,
  SecurityAuditLog,
} from '../types';

export interface AppFullDatabase {
  version: string;
  exportDate: string;
  system: string;
  users: User[];
  family: Family;
  journalEntries: EmotionJournalEntry[];
  consultations: ConsultationSession[];
  deepTalkTopics: DeepTalkTopic[];
  deepTalkSessions: DeepTalkSession[];
  challengeTasks: Challenge30DayTask[];
  challengeProgress: ChallengeDayProgress[];
  happinessHistory: HappinessPointRecord[];
  notifications: NotificationItem[];
  auditLogs: SecurityAuditLog[];
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string | number | boolean | null | undefined): string {
  if (unsafe === null || unsafe === undefined) return '';
  const str = String(unsafe);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wrap multiline or special content in CDATA safely
 */
function cdata(content: string | undefined | null): string {
  if (!content) return '<![CDATA[]]>';
  const sanitized = String(content).replace(/]]>/g, ']]]]><![CDATA[>');
  return `<![CDATA[${sanitized}]]>`;
}

/**
 * Convert the complete Application State to standardized XML format
 */
export function exportToXml(db: AppFullDatabase): string {
  const dateStr = db.exportDate || new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<CodeGenzDatabase version="${escapeXml(db.version || '1.0')}" exportDate="${escapeXml(dateStr)}" system="CODE GenZ Family Empathy Platform">\n`;

  // 1. Users
  xml += `  <Users count="${db.users.length}">\n`;
  db.users.forEach((u) => {
    xml += `    <User id="${escapeXml(u.id)}" role="${escapeXml(u.role)}" familyRole="${escapeXml(u.familyRole || '')}" verified="${Boolean(u.verified)}">\n`;
    xml += `      <Name>${cdata(u.name)}</Name>\n`;
    xml += `      <Email>${escapeXml(u.email)}</Email>\n`;
    xml += `      <Avatar>${escapeXml(u.avatar)}</Avatar>\n`;
    if (u.familyId) xml += `      <FamilyId>${escapeXml(u.familyId)}</FamilyId>\n`;
    if (u.grade) xml += `      <Grade>${cdata(u.grade)}</Grade>\n`;
    if (u.title) xml += `      <Title>${cdata(u.title)}</Title>\n`;
    if (u.bio) xml += `      <Bio>${cdata(u.bio)}</Bio>\n`;
    if (u.phone) xml += `      <Phone>${escapeXml(u.phone)}</Phone>\n`;
    xml += `    </User>\n`;
  });
  xml += `  </Users>\n\n`;

  // 2. Family
  xml += `  <Family id="${escapeXml(db.family.id)}" familyCode="${escapeXml(db.family.familyCode)}" happinessPoints="${db.family.happinessPoints}" streakDays="${db.family.streakDays}" createdAt="${escapeXml(db.family.createdAt)}">\n`;
  xml += `    <Name>${cdata(db.family.name)}</Name>\n`;
  xml += `    <StudentIds>${(db.family.studentIds || []).map((id) => `<StudentId>${escapeXml(id)}</StudentId>`).join('')}</StudentIds>\n`;
  xml += `    <ParentIds>${(db.family.parentIds || []).map((id) => `<ParentId>${escapeXml(id)}</ParentId>`).join('')}</ParentIds>\n`;
  if (db.family.avatarIcon) xml += `    <AvatarIcon>${escapeXml(db.family.avatarIcon)}</AvatarIcon>\n`;
  xml += `  </Family>\n\n`;

  // 3. Emotion Journals
  xml += `  <EmotionJournals count="${db.journalEntries.length}">\n`;
  db.journalEntries.forEach((j) => {
    xml += `    <Journal id="${escapeXml(j.id)}" studentId="${escapeXml(j.studentId)}" emotion="${escapeXml(j.emotion)}" intensity="${j.intensity}" privacy="${escapeXml(j.privacy)}" consultationRequested="${Boolean(j.consultationRequested)}" createdAt="${escapeXml(j.createdAt)}">\n`;
    xml += `      <StudentName>${cdata(j.studentName)}</StudentName>\n`;
    xml += `      <EmotionLabel>${cdata(j.emotionLabel)}</EmotionLabel>\n`;
    xml += `      <Triggers>\n`;
    (j.triggers || []).forEach((t) => {
      xml += `        <Trigger>${cdata(t)}</Trigger>\n`;
    });
    xml += `      </Triggers>\n`;
    xml += `      <Reason>${cdata(j.reason)}</Reason>\n`;
    xml += `      <EventsHappening>${cdata(j.eventsHappening)}</EventsHappening>\n`;
    xml += `      <WishToUnderstand>${cdata(j.wishToUnderstand)}</WishToUnderstand>\n`;
    xml += `      <PersonalNote>${cdata(j.personalNote)}</PersonalNote>\n`;
    if (j.consultationId) xml += `      <ConsultationId>${escapeXml(j.consultationId)}</ConsultationId>\n`;

    // Parent reactions
    xml += `      <ParentReactions count="${(j.parentReactions || []).length}">\n`;
    (j.parentReactions || []).forEach((r) => {
      xml += `        <Reaction id="${escapeXml(r.id)}" parentId="${escapeXml(r.parentId)}" reactionType="${escapeXml(r.reactionType)}" createdAt="${escapeXml(r.createdAt)}">\n`;
      xml += `          <ParentName>${cdata(r.parentName)}</ParentName>\n`;
      xml += `          <ParentRoleName>${cdata(r.parentRoleName)}</ParentRoleName>\n`;
      if (r.comment) xml += `          <Comment>${cdata(r.comment)}</Comment>\n`;
      xml += `        </Reaction>\n`;
    });
    xml += `      </ParentReactions>\n`;
    xml += `    </Journal>\n`;
  });
  xml += `  </EmotionJournals>\n\n`;

  // 4. Consultation Sessions
  xml += `  <ConsultationSessions count="${db.consultations.length}">\n`;
  db.consultations.forEach((c) => {
    xml += `    <Session id="${escapeXml(c.id)}" studentId="${escapeXml(c.studentId)}" status="${escapeXml(c.status)}" createdAt="${escapeXml(c.createdAt)}" updatedAt="${escapeXml(c.updatedAt)}">\n`;
    xml += `      <StudentName>${cdata(c.studentName)}</StudentName>\n`;
    if (c.studentGrade) xml += `      <StudentGrade>${cdata(c.studentGrade)}</StudentGrade>\n`;
    if (c.psychologistId) xml += `      <PsychologistId>${escapeXml(c.psychologistId)}</PsychologistId>\n`;
    if (c.psychologistName) xml += `      <PsychologistName>${cdata(c.psychologistName)}</PsychologistName>\n`;
    if (c.psychologistTitle) xml += `      <PsychologistTitle>${cdata(c.psychologistTitle)}</PsychologistTitle>\n`;
    xml += `      <Topic>${cdata(c.topic)}</Topic>\n`;
    xml += `      <InitialMessage>${cdata(c.initialMessage)}</InitialMessage>\n`;
    if (c.officialFeedback) xml += `      <OfficialFeedback>${cdata(c.officialFeedback)}</OfficialFeedback>\n`;
    if (c.nextActionPlan) xml += `      <NextActionPlan>${cdata(c.nextActionPlan)}</NextActionPlan>\n`;
    if (c.privateProfessionalNotes) xml += `      <PrivateProfessionalNotes>${cdata(c.privateProfessionalNotes)}</PrivateProfessionalNotes>\n`;

    xml += `      <SharedJournalIds>${(c.sharedJournalIds || []).map((jid) => `<JournalId>${escapeXml(jid)}</JournalId>`).join('')}</SharedJournalIds>\n`;

    xml += `      <Messages count="${(c.messages || []).length}">\n`;
    (c.messages || []).forEach((m) => {
      xml += `        <Message id="${escapeXml(m.id)}" senderId="${escapeXml(m.senderId)}" senderRole="${escapeXml(m.senderRole)}" timestamp="${escapeXml(m.timestamp)}">\n`;
      xml += `          <SenderName>${cdata(m.senderName)}</SenderName>\n`;
      xml += `          <Content>${cdata(m.content)}</Content>\n`;
      xml += `        </Message>\n`;
    });
    xml += `      </Messages>\n`;
    xml += `    </Session>\n`;
  });
  xml += `  </ConsultationSessions>\n\n`;

  // 5. Deep Talk Topics & Sessions
  xml += `  <DeepTalkSessions count="${db.deepTalkSessions.length}">\n`;
  db.deepTalkSessions.forEach((s) => {
    xml += `    <DeepTalkSession id="${escapeXml(s.id)}" familyId="${escapeXml(s.familyId)}" topicId="${escapeXml(s.topicId)}" isCompleted="${Boolean(s.isCompleted)}" currentQuestionIndex="${s.currentQuestionIndex}" startedAt="${escapeXml(s.startedAt)}" completedAt="${escapeXml(s.completedAt || '')}">\n`;
    xml += `      <TopicTitle>${cdata(s.topicTitle)}</TopicTitle>\n`;
    if (s.reflection) xml += `      <Reflection>${cdata(s.reflection)}</Reflection>\n`;
    xml += `      <Answers>\n`;
    (s.answers || []).forEach((ans) => {
      xml += `        <Answer questionId="${escapeXml(ans.questionId)}">\n`;
      if (ans.studentAnswer) xml += `          <StudentAnswer>${cdata(ans.studentAnswer)}</StudentAnswer>\n`;
      if (ans.parentAnswer) xml += `          <ParentAnswer>${cdata(ans.parentAnswer)}</ParentAnswer>\n`;
      xml += `        </Answer>\n`;
    });
    xml += `      </Answers>\n`;
    xml += `    </DeepTalkSession>\n`;
  });
  xml += `  </DeepTalkSessions>\n\n`;

  // 6. Challenge 30 Days Progress
  xml += `  <ChallengeProgress count="${db.challengeProgress.length}">\n`;
  db.challengeProgress.forEach((cp) => {
    xml += `    <DayProgress day="${cp.day}" studentConfirmed="${Boolean(cp.studentConfirmed)}" parentConfirmed="${Boolean(cp.parentConfirmed)}" isCompleted="${Boolean(cp.isCompleted)}" completedAt="${escapeXml(cp.completedAt || '')}">\n`;
    if (cp.note) xml += `      <Note>${cdata(cp.note)}</Note>\n`;
    xml += `    </DayProgress>\n`;
  });
  xml += `  </ChallengeProgress>\n\n`;

  // 7. Happiness Points History
  xml += `  <HappinessPointsHistory count="${db.happinessHistory.length}">\n`;
  db.happinessHistory.forEach((h) => {
    xml += `    <Record id="${escapeXml(h.id)}" familyId="${escapeXml(h.familyId)}" amount="${h.amount}" source="${escapeXml(h.source)}" createdAt="${escapeXml(h.createdAt)}">\n`;
    xml += `      <SourceTitle>${cdata(h.sourceTitle)}</SourceTitle>\n`;
    xml += `    </Record>\n`;
  });
  xml += `  </HappinessPointsHistory>\n\n`;

  // 8. Security Audit Logs
  xml += `  <SecurityAuditLogs count="${db.auditLogs.length}">\n`;
  db.auditLogs.forEach((l) => {
    xml += `    <AuditLog id="${escapeXml(l.id)}" userId="${escapeXml(l.userId)}" userRole="${escapeXml(l.userRole)}" action="${escapeXml(l.action)}" timestamp="${escapeXml(l.timestamp)}">\n`;
    xml += `      <UserName>${cdata(l.userName)}</UserName>\n`;
    xml += `      <Resource>${escapeXml(l.resource)}</Resource>\n`;
    xml += `      <Details>${cdata(l.details)}</Details>\n`;
    xml += `    </AuditLog>\n`;
  });
  xml += `  </SecurityAuditLogs>\n`;

  xml += `</CodeGenzDatabase>\n`;
  return xml;
}

/**
 * Convert Database to JSON string
 */
export function exportToJson(db: AppFullDatabase): string {
  return JSON.stringify(db, null, 2);
}

/**
 * Generate PostgreSQL / SQLite DDL & DML SQL Dump for relational databases
 */
export function exportToSqlDump(db: AppFullDatabase): string {
  let sql = `-- ==========================================================\n`;
  sql += `-- CODE GenZ Family - Relational Database Schema & Data Dump\n`;
  sql += `-- Generated on: ${new Date().toISOString()}\n`;
  sql += `-- Compatibility: PostgreSQL, SQLite, MySQL\n`;
  sql += `-- ==========================================================\n\n`;

  // Schema Definitions
  sql += `CREATE TABLE IF NOT EXISTS users (\n`;
  sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sql += `  name VARCHAR(255) NOT NULL,\n`;
  sql += `  email VARCHAR(255),\n`;
  sql += `  role VARCHAR(32) NOT NULL,\n`;
  sql += `  family_role VARCHAR(32),\n`;
  sql += `  avatar TEXT,\n`;
  sql += `  family_id VARCHAR(64),\n`;
  sql += `  grade VARCHAR(128),\n`;
  sql += `  title VARCHAR(128),\n`;
  sql += `  verified BOOLEAN DEFAULT FALSE\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS families (\n`;
  sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sql += `  name VARCHAR(255) NOT NULL,\n`;
  sql += `  family_code VARCHAR(32) UNIQUE NOT NULL,\n`;
  sql += `  happiness_points INT DEFAULT 0,\n`;
  sql += `  streak_days INT DEFAULT 0,\n`;
  sql += `  created_at TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS emotion_journals (\n`;
  sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sql += `  student_id VARCHAR(64) REFERENCES users(id),\n`;
  sql += `  student_name VARCHAR(255),\n`;
  sql += `  emotion VARCHAR(64) NOT NULL,\n`;
  sql += `  emotion_label VARCHAR(64),\n`;
  sql += `  intensity INT NOT NULL,\n`;
  sql += `  triggers TEXT,\n`;
  sql += `  reason TEXT,\n`;
  sql += `  wish_to_understand TEXT,\n`;
  sql += `  privacy VARCHAR(32) NOT NULL,\n`;
  sql += `  created_at TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS consultation_sessions (\n`;
  sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sql += `  student_id VARCHAR(64) REFERENCES users(id),\n`;
  sql += `  psychologist_id VARCHAR(64),\n`;
  sql += `  topic VARCHAR(255) NOT NULL,\n`;
  sql += `  initial_message TEXT,\n`;
  sql += `  status VARCHAR(32) NOT NULL,\n`;
  sql += `  official_feedback TEXT,\n`;
  sql += `  created_at TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `-- ================= INSERT DATA =================\n\n`;

  // Insert Users
  db.users.forEach((u) => {
    const esc = (s: any) => `'${String(s || '').replace(/'/g, "''")}'`;
    sql += `INSERT INTO users (id, name, email, role, family_role, avatar, family_id, grade, title, verified) VALUES (${esc(u.id)}, ${esc(u.name)}, ${esc(u.email)}, ${esc(u.role)}, ${esc(u.familyRole)}, ${esc(u.avatar)}, ${esc(u.familyId)}, ${esc(u.grade)}, ${esc(u.title)}, ${u.verified ? 'TRUE' : 'FALSE'}) ON CONFLICT (id) DO NOTHING;\n`;
  });
  sql += `\n`;

  // Insert Family
  if (db.family) {
    const f = db.family;
    const esc = (s: any) => `'${String(s || '').replace(/'/g, "''")}'`;
    sql += `INSERT INTO families (id, name, family_code, happiness_points, streak_days, created_at) VALUES (${esc(f.id)}, ${esc(f.name)}, ${esc(f.familyCode)}, ${f.happinessPoints}, ${f.streakDays}, ${esc(f.createdAt)}) ON CONFLICT (id) DO NOTHING;\n\n`;
  }

  // Insert Journals
  db.journalEntries.forEach((j) => {
    const esc = (s: any) => `'${String(s || '').replace(/'/g, "''")}'`;
    const triggersJson = JSON.stringify(j.triggers || []).replace(/'/g, "''");
    sql += `INSERT INTO emotion_journals (id, student_id, student_name, emotion, emotion_label, intensity, triggers, reason, wish_to_understand, privacy, created_at) VALUES (${esc(j.id)}, ${esc(j.studentId)}, ${esc(j.studentName)}, ${esc(j.emotion)}, ${esc(j.emotionLabel)}, ${j.intensity}, '${triggersJson}', ${esc(j.reason)}, ${esc(j.wishToUnderstand)}, ${esc(j.privacy)}, ${esc(j.createdAt)}) ON CONFLICT (id) DO NOTHING;\n`;
  });
  sql += `\n`;

  return sql;
}

/**
 * Robust XML Parser that deserializes CodeGenz XML back into typed AppFullDatabase
 */
export function parseXmlToAppData(xmlString: string, existingData: AppFullDatabase): { success: boolean; data?: Partial<AppFullDatabase>; error?: string } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check parser error
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      return { success: false, error: `Cú pháp XML không hợp lệ: ${parserError[0].textContent}` };
    }

    const root = xmlDoc.getElementsByTagName('CodeGenzDatabase')[0];
    if (!root) {
      return { success: false, error: 'Tệp XML không đúng cấu trúc CODE GenZ Database.' };
    }

    const parsed: Partial<AppFullDatabase> = {};

    // 1. Users
    const userNodes = xmlDoc.getElementsByTagName('User');
    if (userNodes.length > 0) {
      const users: User[] = [];
      for (let i = 0; i < userNodes.length; i++) {
        const node = userNodes[i];
        users.push({
          id: node.getAttribute('id') || `user-${Date.now()}-${i}`,
          name: node.getElementsByTagName('Name')[0]?.textContent || 'Chưa đặt tên',
          email: node.getElementsByTagName('Email')[0]?.textContent || '',
          role: (node.getAttribute('role') as any) || 'student',
          familyRole: (node.getAttribute('familyRole') as any) || 'none',
          avatar: node.getElementsByTagName('Avatar')[0]?.textContent || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          familyId: node.getElementsByTagName('FamilyId')[0]?.textContent || undefined,
          grade: node.getElementsByTagName('Grade')[0]?.textContent || undefined,
          title: node.getElementsByTagName('Title')[0]?.textContent || undefined,
          bio: node.getElementsByTagName('Bio')[0]?.textContent || undefined,
          phone: node.getElementsByTagName('Phone')[0]?.textContent || undefined,
          verified: node.getAttribute('verified') === 'true',
        });
      }
      parsed.users = users;
    }

    // 2. Family
    const familyNode = xmlDoc.getElementsByTagName('Family')[0];
    if (familyNode) {
      const studentIdNodes = familyNode.getElementsByTagName('StudentId');
      const parentIdNodes = familyNode.getElementsByTagName('ParentId');
      const studentIds: string[] = [];
      const parentIds: string[] = [];
      for (let i = 0; i < studentIdNodes.length; i++) studentIds.push(studentIdNodes[i].textContent || '');
      for (let i = 0; i < parentIdNodes.length; i++) parentIds.push(parentIdNodes[i].textContent || '');

      parsed.family = {
        id: familyNode.getAttribute('id') || 'fam-1',
        name: familyNode.getElementsByTagName('Name')[0]?.textContent || 'Gia đình Hạnh Phúc',
        familyCode: familyNode.getAttribute('familyCode') || 'CODE-8899',
        studentIds,
        parentIds,
        happinessPoints: parseInt(familyNode.getAttribute('happinessPoints') || '150', 10),
        streakDays: parseInt(familyNode.getAttribute('streakDays') || '7', 10),
        createdAt: familyNode.getAttribute('createdAt') || new Date().toISOString(),
      };
    }

    // 3. Emotion Journals
    const journalNodes = xmlDoc.getElementsByTagName('Journal');
    if (journalNodes.length > 0) {
      const journals: EmotionJournalEntry[] = [];
      for (let i = 0; i < journalNodes.length; i++) {
        const jn = journalNodes[i];
        const triggerNodes = jn.getElementsByTagName('Trigger');
        const triggers: string[] = [];
        for (let t = 0; t < triggerNodes.length; t++) triggers.push(triggerNodes[t].textContent || '');

        const reactionNodes = jn.getElementsByTagName('Reaction');
        const reactions: any[] = [];
        for (let r = 0; r < reactionNodes.length; r++) {
          const rn = reactionNodes[r];
          reactions.push({
            id: rn.getAttribute('id') || `rx-${r}`,
            parentId: rn.getAttribute('parentId') || 'user-parent-1',
            parentName: rn.getElementsByTagName('ParentName')[0]?.textContent || 'Phụ huynh',
            parentRoleName: rn.getElementsByTagName('ParentRoleName')[0]?.textContent || 'Mẹ',
            reactionType: rn.getAttribute('reactionType') || 'heart',
            comment: rn.getElementsByTagName('Comment')[0]?.textContent || undefined,
            createdAt: rn.getAttribute('createdAt') || new Date().toISOString(),
          });
        }

        journals.push({
          id: jn.getAttribute('id') || `journal-${Date.now()}-${i}`,
          studentId: jn.getAttribute('studentId') || 'user-student-1',
          studentName: jn.getElementsByTagName('StudentName')[0]?.textContent || 'Học sinh',
          emotion: (jn.getAttribute('emotion') as any) || 'happy',
          emotionLabel: jn.getElementsByTagName('EmotionLabel')[0]?.textContent || 'Vui vẻ',
          intensity: parseInt(jn.getAttribute('intensity') || '7', 10),
          triggers,
          reason: jn.getElementsByTagName('Reason')[0]?.textContent || '',
          eventsHappening: jn.getElementsByTagName('EventsHappening')[0]?.textContent || '',
          wishToUnderstand: jn.getElementsByTagName('WishToUnderstand')[0]?.textContent || '',
          personalNote: jn.getElementsByTagName('PersonalNote')[0]?.textContent || '',
          privacy: (jn.getAttribute('privacy') as any) || 'private',
          consultationRequested: jn.getAttribute('consultationRequested') === 'true',
          consultationId: jn.getElementsByTagName('ConsultationId')[0]?.textContent || undefined,
          parentReactions: reactions,
          createdAt: jn.getAttribute('createdAt') || new Date().toISOString(),
        });
      }
      parsed.journalEntries = journals;
    }

    // 4. Consultation Sessions
    const sessionNodes = xmlDoc.getElementsByTagName('Session');
    if (sessionNodes.length > 0) {
      const consultations: ConsultationSession[] = [];
      for (let s = 0; s < sessionNodes.length; s++) {
        const sn = sessionNodes[s];
        const msgNodes = sn.getElementsByTagName('Message');
        const messages: any[] = [];
        for (let m = 0; m < msgNodes.length; m++) {
          const mn = msgNodes[m];
          messages.push({
            id: mn.getAttribute('id') || `msg-${m}`,
            senderId: mn.getAttribute('senderId') || '',
            senderRole: mn.getAttribute('senderRole') || 'student',
            senderName: mn.getElementsByTagName('SenderName')[0]?.textContent || '',
            content: mn.getElementsByTagName('Content')[0]?.textContent || '',
            timestamp: mn.getAttribute('timestamp') || new Date().toISOString(),
          });
        }

        const sharedJNodes = sn.getElementsByTagName('JournalId');
        const sharedIds: string[] = [];
        for (let j = 0; j < sharedJNodes.length; j++) sharedIds.push(sharedJNodes[j].textContent || '');

        consultations.push({
          id: sn.getAttribute('id') || `consult-${s}`,
          studentId: sn.getAttribute('studentId') || 'user-student-1',
          studentName: sn.getElementsByTagName('StudentName')[0]?.textContent || '',
          studentGrade: sn.getElementsByTagName('StudentGrade')[0]?.textContent || undefined,
          psychologistId: sn.getElementsByTagName('PsychologistId')[0]?.textContent || undefined,
          psychologistName: sn.getElementsByTagName('PsychologistName')[0]?.textContent || undefined,
          psychologistTitle: sn.getElementsByTagName('PsychologistTitle')[0]?.textContent || undefined,
          topic: sn.getElementsByTagName('Topic')[0]?.textContent || 'Tham vấn tâm lý',
          initialMessage: sn.getElementsByTagName('InitialMessage')[0]?.textContent || '',
          sharedJournalIds: sharedIds,
          status: (sn.getAttribute('status') as any) || 'pending',
          messages,
          officialFeedback: sn.getElementsByTagName('OfficialFeedback')[0]?.textContent || undefined,
          nextActionPlan: sn.getElementsByTagName('NextActionPlan')[0]?.textContent || undefined,
          privateProfessionalNotes: sn.getElementsByTagName('PrivateProfessionalNotes')[0]?.textContent || undefined,
          createdAt: sn.getAttribute('createdAt') || new Date().toISOString(),
          updatedAt: sn.getAttribute('updatedAt') || new Date().toISOString(),
        });
      }
      parsed.consultations = consultations;
    }

    return { success: true, data: parsed };
  } catch (err: any) {
    return { success: false, error: `Lỗi đọc XML: ${err.message || String(err)}` };
  }
}

/**
 * Trigger browser file download
 */
export function downloadFile(fileName: string, content: string, mimeType: string = 'application/xml;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
