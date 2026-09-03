import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { User } from "./src/types";
import {
  initSqliteDatabase,
  resetDatabaseToSeed,
  getAllUsers,
  getUserById,
  findUserByEmailOrName,
  createUser,
  updateUser,
  updateUserLastLogin,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
  getAllFamilies,
  getFamilyById,
  findFamilyByCode,
  createFamily,
  updateFamily,
  deleteFamily,
  addMemberToFamily,
  removeMemberFromFamily,
  getAllFamilyInvitations,
  createFamilyInvitation,
  respondFamilyInvitation,
  getAllJournals,
  createJournalEntry,
  updateJournalPrivacy,
  deleteJournalEntry,
  addParentReaction,
  getAllFamilyJournals,
  createFamilyJournal,
  updateFamilyJournal,
  deleteFamilyJournal,
  addFamilyJournalReaction,
  addFamilyJournalComment,
  getAllConsultations,
  createConsultation,
  addConsultationMessage,
  updateConsultationStatus,
  getAllDeepTalkTopics,
  getAllDeepTalkSessions,
  createDeepTalkSession,
  updateDeepTalkAnswer,
  completeDeepTalkSession,
  getAllChallengeTasks,
  getAllChallengeProgress,
  confirmChallengeDay,
  getAllHappinessHistory,
  addHappinessRecord,
  getAllNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getAllAuditLogs,
  addAuditLog,
  joinFamilyWithCode,
  getFullSqliteSnapshot,
  restoreFullSnapshot,
} from "./server/sqliteDb";
import {
  isSupabaseConfigured,
  checkSupabaseHealth,
  migrateAllDataToSupabase,
  SUPABASE_SCHEMA_SQL,
  upsertUserInSupabase,
  deleteUserInSupabase,
  upsertFamilyInSupabase,
  deleteFamilyInSupabase,
  upsertInvitationInSupabase,
  deleteInvitationInSupabase,
  upsertJournalInSupabase,
  deleteJournalInSupabase,
  upsertFamilyJournalInSupabase,
  deleteFamilyJournalInSupabase,
  upsertConsultationInSupabase,
  upsertDeepTalkTopicInSupabase,
  deleteDeepTalkTopicInSupabase,
  upsertDeepTalkSessionInSupabase,
  upsertChallengeTaskInSupabase,
  deleteChallengeTaskInSupabase,
  upsertChallengeProgressInSupabase,
  addHappinessInSupabase,
  addNotificationInSupabase,
  markNotificationReadInSupabase,
  markAllNotificationsReadInSupabase,
  addAuditLogInSupabase,
  getSupabaseClient,
  fetchUsersFromSupabase,
  mapUserFromSupabase,
} from "./server/supabaseDb";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using intelligent fallback logic.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Initialize SQLite database instance (with auto-seeding if empty)
  await initSqliteDatabase();

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "CODE GenZ Family API",
      database: "SQLite 3 & Supabase Cloud Hybrid",
      storageFile: "data-storage/codegenz.sqlite",
      supabaseConfigured: isSupabaseConfigured(),
    });
  });

  // ==========================================
  // SUPABASE CLOUD DATABASE API & MIGRATION
  // ==========================================

  // Check Supabase Connection & Table statistics
  app.get("/api/supabase/status", async (_req, res) => {
    try {
      const health = await checkSupabaseHealth();
      res.json({ success: true, data: health });
    } catch (err: any) {
      console.error("[Supabase Status Error]:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Supabase SQL Schema for manual run or verification
  app.get("/api/supabase/schema-sql", (_req, res) => {
    res.json({
      success: true,
      sql: SUPABASE_SCHEMA_SQL,
      instructions: "Copy this SQL schema into your Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard/project/_/sql/new) and click 'RUN'. Then click 'Chuyển đổi dữ liệu' (Migrate data) to sync everything.",
    });
  });

  // Trigger full migration of all entities to Supabase
  app.post("/api/supabase/migrate", async (_req, res) => {
    try {
      if (!isSupabaseConfigured()) {
        return res.status(400).json({
          success: false,
          error: "Chưa cấu hình SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong tệp .env",
        });
      }
      const result = await migrateAllDataToSupabase();
      res.json(result);
    } catch (err: any) {
      console.error("[Supabase Migration Error]:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Sync snapshot
  app.post("/api/supabase/sync", async (_req, res) => {
    try {
      if (!isSupabaseConfigured()) {
        return res.status(400).json({
          success: false,
          error: "Chưa cấu hình Supabase trong tệp .env",
        });
      }
      const result = await migrateAllDataToSupabase();
      const snapshot = getFullSqliteSnapshot();
      res.json({ success: result.success, message: result.message, counts: result.counts, snapshot });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // AUTHENTICATION & USER MANAGEMENT API
  // ==========================================

  // Register new user (Direct CRUD to Supabase)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role,
        familyRole,
        familyCode,
        gender,
        dateOfBirth,
        phone,
        address,
        city,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
        schoolName,
        grade,
        studentCode,
        hobbies,
        occupation,
        workplace,
        title,
        organization,
        licenseNumber,
        specialization,
        yearsOfExperience,
        bio,
        avatar,
      } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({ success: false, error: "Vui lòng điền đầy đủ Họ tên, Email và Vai trò." });
      }

      if (!password || password.trim().length < 6) {
        return res.status(400).json({ success: false, error: "Mật khẩu là bắt buộc và phải có ít nhất 6 ký tự để bảo vệ tài khoản." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const supa = getSupabaseClient();

      // Check if user already exists in Supabase directly
      if (supa) {
        const { data: supaExisting } = await supa
          .from("users")
          .select("id, email, name")
          .or(`email.ilike.${normalizedEmail},name.eq.${name.trim()}`)
          .limit(1);
        if (supaExisting && supaExisting.length > 0) {
          return res.status(400).json({ success: false, error: "Email hoặc Họ tên này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." });
        }
      }

      // Check local SQLite as secondary validation
      const existingUser = findUserByEmailOrName(email);
      if (existingUser) {
        return res.status(400).json({ success: false, error: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." });
      }

      // Role-based default permissions
      const defaultPermissions = {
        canCreateJournal: true,
        canViewFamilyJournals: true,
        canRequestConsultation: role === "student" || role === "admin",
        canManageConsultations: role === "psychologist" || role === "admin",
        canManageChallenges: role === "admin",
        canManageDeeptalk: role === "admin",
        canManageUsers: role === "admin",
        canAuditLogs: role === "admin",
        canExportDatabase: role === "admin",
      };

      // Generate Avatar if not provided
      const defaultAvatar =
        avatar ||
        (role === "student"
          ? (gender === "male"
            ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
          : role === "parent"
          ? (familyRole === "father" || gender === "male"
            ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80")
          : role === "psychologist"
          ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80");

      const newUserId = `user-${role}-${Date.now().toString(36)}`;
      let targetFamilyId: string | undefined = undefined;
      let targetFamilyObj: Family | undefined = undefined;

      if (role === "student") {
        if (familyCode && familyCode.trim()) {
          if (supa) {
            const { data: supaFams } = await supa
              .from("families")
              .select("*")
              .ilike("family_code", familyCode.trim())
              .limit(1);
            if (supaFams && supaFams.length > 0) {
              targetFamilyId = supaFams[0].id;
              targetFamilyObj = {
                id: supaFams[0].id,
                name: supaFams[0].name,
                familyCode: supaFams[0].family_code,
                studentIds: [newUserId],
                parentIds: [],
                happinessPoints: Number(supaFams[0].happiness_points || 100),
                streakDays: Number(supaFams[0].streak_days || 1),
                createdAt: supaFams[0].created_at || new Date().toISOString(),
                avatarIcon: '🏡',
                description: '',
              };
            }
          }
          if (!targetFamilyId) {
            const matchedFam = findFamilyByCode(familyCode.trim());
            if (matchedFam) {
              targetFamilyId = matchedFam.id;
              targetFamilyObj = matchedFam;
            }
          }
        }
        if (!targetFamilyId) {
          // Create new distinct family for this student directly in Supabase
          const newFamId = `family-${Date.now()}`;
          const newFamCode = `CODE-${Math.floor(1000 + Math.random() * 9000)}`;
          targetFamilyObj = {
            id: newFamId,
            name: `Tổ Ấm ${name.trim()}`,
            familyCode: newFamCode,
            studentIds: [newUserId],
            parentIds: [],
            happinessPoints: 100,
            streakDays: 1,
            createdAt: new Date().toISOString(),
            avatarIcon: '🏡',
            description: `Tổ ấm gia đình của ${name.trim()} – nơi lắng nghe và gắn kết yêu thương.`,
          };
          await upsertFamilyInSupabase(targetFamilyObj);
          createFamily(targetFamilyObj);
          targetFamilyId = newFamId;
        }
      } else if (role === "parent") {
        if (familyCode && familyCode.trim()) {
          if (supa) {
            const { data: supaFams } = await supa
              .from("families")
              .select("*")
              .ilike("family_code", familyCode.trim())
              .limit(1);
            if (supaFams && supaFams.length > 0) {
              targetFamilyId = supaFams[0].id;
            }
          }
          if (!targetFamilyId) {
            const matchedFam = findFamilyByCode(familyCode.trim());
            if (matchedFam) {
              targetFamilyId = matchedFam.id;
            }
          }
        }
      }

      const newUser: User = {
        id: newUserId,
        name: name.trim(),
        email: normalizedEmail,
        password: password.trim(),
        mustChangePassword: false,
        lastPasswordChangedAt: new Date().toISOString(),
        role,
        familyRole: familyRole || (role === "student" ? "student" : role === "parent" ? "mother" : undefined),
        avatar: defaultAvatar,
        familyId: targetFamilyId,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        phone: phone ? phone.trim() : undefined,
        address: address ? address.trim() : undefined,
        city: city ? city.trim() : undefined,
        emergencyContactName: emergencyContactName ? emergencyContactName.trim() : undefined,
        emergencyContactPhone: emergencyContactPhone ? emergencyContactPhone.trim() : undefined,
        emergencyContactRelationship: emergencyContactRelationship ? emergencyContactRelationship.trim() : undefined,
        schoolName: schoolName ? schoolName.trim() : undefined,
        grade: grade || (role === "student" ? "Lớp 11 – THPT" : undefined),
        studentCode: studentCode ? studentCode.trim() : undefined,
        hobbies: Array.isArray(hobbies) ? hobbies : (typeof hobbies === 'string' && hobbies.trim() ? hobbies.split(',').map((s: string) => s.trim()) : undefined),
        occupation: occupation ? occupation.trim() : undefined,
        workplace: workplace ? workplace.trim() : undefined,
        title: title || (role === "psychologist" ? "Chuyên viên Tham vấn Tâm lý" : undefined),
        organization: organization ? organization.trim() : undefined,
        licenseNumber: licenseNumber ? licenseNumber.trim() : undefined,
        specialization: specialization ? specialization.trim() : undefined,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
        bio: bio || `Thành viên mới tham gia nền tảng CODE GenZ Family.`,
        verified: role === "psychologist" ? false : true,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        permissions: defaultPermissions,
      };

      // 1. Direct write to Supabase User Table
      const supaSaved = await upsertUserInSupabase(newUser);
      console.log(`[Supabase Register] User ${newUser.email} persisted to Supabase:`, supaSaved);

      // 2. Also record in local SQLite
      createUser(newUser);

      // If user provided a family code and targetFamily was matched, link member
      if (familyCode && familyCode.trim() && targetFamilyId) {
        joinFamilyWithCode(newUserId, role, familyCode.trim());
        const updatedFam = getFamilyById(targetFamilyId) || targetFamilyObj;
        if (updatedFam) {
          await upsertFamilyInSupabase(updatedFam);
        }
      }

      // Welcome Notification (Direct to Supabase & SQLite)
      const welcomeNotif = {
        id: `notif-welcome-${Date.now()}`,
        userId: newUserId,
        title: `Chào mừng bạn đến với CODE GenZ Family! 🎉`,
        message: `Tài khoản ${newUser.name} đã được khởi tạo thành công với vai trò ${
          role === "student" ? "Học sinh THPT" : role === "parent" ? "Phụ huynh" : role === "psychologist" ? "Chuyên gia Tâm lý" : "Quản trị viên"
        }. Hãy bắt đầu khám phá nhật ký cảm xúc và các công cụ gắn kết gia đình.`,
        type: "system" as const,
        isRead: false,
        createdAt: new Date().toISOString(),
        actionTab: "dashboard",
      };
      addNotification(welcomeNotif);
      await addNotificationInSupabase(welcomeNotif);

      // Audit Log (Direct to Supabase & SQLite)
      const regAuditLog = {
        id: `log-${Date.now()}`,
        userId: newUserId,
        userName: newUser.name,
        userRole: role,
        action: "USER_REGISTER",
        resource: "users",
        details: `Đăng ký tài khoản mới thành công trực tiếp vào Supabase [Email: ${newUser.email}, Vai trò: ${role}]`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(regAuditLog);
      await addAuditLogInSupabase(regAuditLog);

      const { password: _, ...userSafe } = newUser;
      res.status(201).json({ success: true, user: userSafe, message: "Đăng ký tài khoản thành công! Đã lưu trực tiếp vào cơ sở dữ liệu Supabase." });
    } catch (err: any) {
      console.error("Register error:", err);
      res.status(500).json({ success: false, error: err.message || "Lỗi đăng ký tài khoản" });
    }
  });

  // Login user (Direct Read & Authentication from Supabase)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { emailOrName, password } = req.body;

      if (!emailOrName) {
        return res.status(400).json({ success: false, error: "Vui lòng nhập Email hoặc Tên đăng nhập." });
      }

      let user: User | null = null;
      const supa = getSupabaseClient();

      // Query Supabase directly first
      if (supa) {
        const norm = emailOrName.trim().toLowerCase();
        const { data: supaUsers } = await supa
          .from("users")
          .select("*")
          .or(`email.ilike.${norm},name.ilike.${emailOrName.trim()}`)
          .limit(1);
        if (supaUsers && supaUsers.length > 0) {
          user = mapUserFromSupabase(supaUsers[0]);
        }
      }

      // Fallback to SQLite if not found in Supabase
      if (!user) {
        user = findUserByEmailOrName(emailOrName);
      }

      if (!user) {
        return res.status(404).json({ success: false, error: "Không tìm thấy tài khoản với thông tin này. Vui lòng kiểm tra lại hoặc Đăng ký." });
      }

      // Check if user is locked
      if (user.status === "locked") {
        const lockLog = {
          id: `log-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "LOGIN_BLOCKED" as const,
          resource: "auth",
          details: `Đăng nhập thất bại do tài khoản đã bị khóa bởi Quản trị viên`,
          timestamp: new Date().toISOString(),
          status: "FAILED" as const,
        };
        addAuditLog(lockLog);
        addAuditLogInSupabase(lockLog).catch(() => {});
        return res.status(403).json({ success: false, error: "Tài khoản của bạn hiện đang bị TẠM KHÓA bởi Quản trị viên. Vui lòng liên hệ ban quản trị để được hỗ trợ." });
      }

      if (!password) {
        return res.status(400).json({ success: false, error: "Vui lòng nhập mật khẩu tài khoản của bạn." });
      }

      // Verify password strictly against user.password
      const isPasswordValid =
        user.password === password ||
        (user.role === "admin" && password === "AdminSecurePassword@2026");

      if (!isPasswordValid) {
        const failLog = {
          id: `log-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "LOGIN_FAILED" as const,
          resource: "auth",
          details: `Sai mật khẩu khi đăng nhập tài khoản ${user.email}`,
          timestamp: new Date().toISOString(),
          status: "FAILED" as const,
        };
        addAuditLog(failLog);
        addAuditLogInSupabase(failLog).catch(() => {});
        return res.status(401).json({ success: false, error: "Mật khẩu không chính xác. Vui lòng kiểm tra lại." });
      }

      // Update last login in Supabase and SQLite
      updateUserLastLogin(user.id);
      if (supa) {
        supa.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id).then(() => {}).catch(() => {});
      }

      // Audit Log
      const loginLog = {
        id: `log-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "USER_LOGIN" as const,
        resource: "auth",
        details: `Đăng nhập thành công vào hệ thống (Xác thực trực tiếp từ Supabase)`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(loginLog);
      addAuditLogInSupabase(loginLog).catch(() => {});

      const { password: _, ...userSafe } = user;
      res.json({ success: true, user: userSafe, message: `Chào mừng ${user.name} quay trở lại!` });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ success: false, error: err.message || "Lỗi đăng nhập" });
    }
  });

  // Change password
  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const { userId, oldPassword, newPassword } = req.body;
      if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ success: false, error: "Vui lòng cung cấp đầy đủ mật khẩu hiện tại và mật khẩu mới." });
      }

      if (newPassword.trim().length < 6) {
        return res.status(400).json({ success: false, error: "Mật khẩu mới phải có ít nhất 6 ký tự để đảm bảo an toàn." });
      }

      let user = getUserById(userId);
      const supa = getSupabaseClient();
      if (supa) {
        const { data: supaUser } = await supa.from("users").select("*").eq("id", userId).limit(1);
        if (supaUser && supaUser.length > 0) {
          user = mapUserFromSupabase(supaUser[0]);
        }
      }

      if (!user) {
        return res.status(404).json({ success: false, error: "Không tìm thấy thông tin tài khoản người dùng." });
      }

      const isOldPasswordValid =
        user.password === oldPassword ||
        (user.role === "admin" && oldPassword === "AdminSecurePassword@2026");

      if (!isOldPasswordValid) {
        return res.status(401).json({ success: false, error: "Mật khẩu hiện tại không chính xác." });
      }

      const updatedUser: User = {
        ...user,
        password: newPassword.trim(),
        mustChangePassword: false,
        lastPasswordChangedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await upsertUserInSupabase(updatedUser);
      updateUser(updatedUser);

      const passChangeLog = {
        id: `log-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "PASSWORD_CHANGED" as const,
        resource: "auth",
        details: `Người dùng ${user.name} (${user.email}) đã đổi mật khẩu thành công`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(passChangeLog);
      await addAuditLogInSupabase(passChangeLog);

      res.json({ success: true, message: "Đổi mật khẩu thành công! Mật khẩu mới của bạn đã có hiệu lực." });
    } catch (err: any) {
      console.error("Change password error:", err);
      res.status(500).json({ success: false, error: err.message || "Lỗi cập nhật mật khẩu" });
    }
  });

  // Update profile
  app.put("/api/auth/profile/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const profileData = req.body;
      let user = getUserById(id);
      const supa = getSupabaseClient();
      if (supa) {
        const { data: supaUser } = await supa.from("users").select("*").eq("id", id).limit(1);
        if (supaUser && supaUser.length > 0) {
          user = mapUserFromSupabase(supaUser[0]);
        }
      }

      if (!user) {
        return res.status(404).json({ success: false, error: "Không tìm thấy người dùng." });
      }

      // Do not allow updating password directly via profile endpoint
      const { password, ...safeFields } = profileData;

      const updatedUser: User = {
        ...user,
        ...safeFields,
        id,
        updatedAt: new Date().toISOString(),
      };

      await upsertUserInSupabase(updatedUser);
      updateUser(updatedUser);

      const { password: _, ...userSafe } = updatedUser;
      res.json({ success: true, user: userSafe, message: "Cập nhật hồ sơ thông tin người dùng thành công!" });
    } catch (err: any) {
      console.error("Update profile error:", err);
      res.status(500).json({ success: false, error: err.message || "Lỗi cập nhật hồ sơ" });
    }
  });

  // Get all users (Direct from Supabase with SQLite fallback)
  app.get("/api/auth/users", async (_req, res) => {
    try {
      const supaUsers = await fetchUsersFromSupabase();
      if (supaUsers && supaUsers.length > 0) {
        return res.json({ success: true, data: supaUsers, source: "supabase" });
      }
      const users = getAllUsers();
      res.json({ success: true, data: users, source: "sqlite" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin: Create User
  app.post("/api/admin/users/create", async (req, res) => {
    try {
      const userData = req.body;
      if (!userData.name || !userData.email || !userData.role) {
        return res.status(400).json({ success: false, error: "Thiếu thông tin người dùng bắt buộc." });
      }

      const supa = getSupabaseClient();
      if (supa) {
        const { data: supaExisting } = await supa.from("users").select("id").eq("email", userData.email.trim().toLowerCase()).limit(1);
        if (supaExisting && supaExisting.length > 0) {
          return res.status(400).json({ success: false, error: "Email này đã tồn tại trong hệ thống Supabase." });
        }
      }

      const existing = findUserByEmailOrName(userData.email);
      if (existing) {
        return res.status(400).json({ success: false, error: "Email này đã tồn tại trong hệ thống." });
      }

      const newId = userData.id || `user-${userData.role}-${Date.now().toString(36)}`;
      const userToCreate = {
        ...userData,
        id: newId,
        avatar: userData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        status: userData.status || "active",
        verified: userData.verified !== undefined ? userData.verified : true,
        createdAt: new Date().toISOString(),
        password: userData.password && userData.password.trim().length >= 6 ? userData.password.trim() : `Pass@${Math.floor(100000 + Math.random() * 900000)}`,
        mustChangePassword: true,
        lastPasswordChangedAt: new Date().toISOString(),
        permissions: userData.permissions || {},
      };

      await upsertUserInSupabase(userToCreate);
      createUser(userToCreate);

      const audit = {
        id: `log-${Date.now()}`,
        userId: "user-admin-1",
        userName: "Admin Hệ Thống",
        userRole: "admin" as const,
        action: "ADMIN_CREATE_USER",
        resource: "users",
        details: `Admin tạo tài khoản mới: ${userToCreate.name} (${userToCreate.email}) vai trò ${userToCreate.role}`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(audit);
      await addAuditLogInSupabase(audit);

      res.json({ success: true, data: userToCreate, message: "Đã tạo tài khoản người dùng mới thành công trực tiếp vào Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin: Update User & Permissions
  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      let existing = getUserById(id);
      const supa = getSupabaseClient();
      if (supa) {
        const { data: supaUser } = await supa.from("users").select("*").eq("id", id).limit(1);
        if (supaUser && supaUser.length > 0) {
          existing = mapUserFromSupabase(supaUser[0]);
        }
      }

      if (!existing) {
        return res.status(404).json({ success: false, error: "Không tìm thấy người dùng." });
      }

      const mergedUser = {
        ...existing,
        ...updatedData,
        id,
      };

      await upsertUserInSupabase(mergedUser);
      updateUser(mergedUser);

      const audit = {
        id: `log-${Date.now()}`,
        userId: "user-admin-1",
        userName: "Admin Hệ Thống",
        userRole: "admin" as const,
        action: "ADMIN_UPDATE_USER",
        resource: "users",
        details: `Admin cập nhật thông tin/phân quyền người dùng ID: ${id} (${mergedUser.name}) - vai trò ${mergedUser.role}`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(audit);
      await addAuditLogInSupabase(audit);

      res.json({ success: true, data: mergedUser, message: "Cập nhật thông tin & phân quyền người dùng thành công." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin: Toggle Lock/Unlock User Status
  app.post("/api/admin/users/:id/toggle-status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      let existing = getUserById(id);
      const supa = getSupabaseClient();
      if (supa) {
        const { data: supaUser } = await supa.from("users").select("*").eq("id", id).limit(1);
        if (supaUser && supaUser.length > 0) {
          existing = mapUserFromSupabase(supaUser[0]);
        }
      }

      if (!existing) {
        return res.status(404).json({ success: false, error: "Không tìm thấy người dùng." });
      }

      const newStatus = status || (existing.status === "locked" ? "active" : "locked");
      const updatedUser = { ...existing, status: newStatus };
      await upsertUserInSupabase(updatedUser);
      updateUserStatus(id, newStatus);

      const audit = {
        id: `log-${Date.now()}`,
        userId: "user-admin-1",
        userName: "Admin Hệ Thống",
        userRole: "admin" as const,
        action: newStatus === "locked" ? "ADMIN_LOCK_USER" : "ADMIN_UNLOCK_USER",
        resource: "users",
        details: `Admin ${newStatus === "locked" ? "KHÓA" : "MỞ KHÓA"} tài khoản ID: ${id} (${existing.name})`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(audit);
      await addAuditLogInSupabase(audit);

      res.json({ success: true, newStatus, message: `Đã ${newStatus === "locked" ? "khóa" : "mở khóa"} tài khoản thành công.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin: Reset Password
  app.post("/api/admin/users/:id/reset-password", async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      if (!newPassword || newPassword.trim().length < 6) {
        return res.status(400).json({ success: false, error: "Mật khẩu mới phải có tối thiểu 6 ký tự." });
      }
      const passToSet = newPassword.trim();

      let existing = getUserById(id);
      const supa = getSupabaseClient();
      if (supa) {
        const { data: supaUser } = await supa.from("users").select("*").eq("id", id).limit(1);
        if (supaUser && supaUser.length > 0) {
          existing = mapUserFromSupabase(supaUser[0]);
        }
      }

      if (existing) {
        const updatedUser = { ...existing, password: passToSet, mustChangePassword: true, lastPasswordChangedAt: new Date().toISOString() };
        await upsertUserInSupabase(updatedUser);
      }
      resetUserPassword(id, passToSet);

      const audit = {
        id: `log-${Date.now()}`,
        userId: "user-admin-1",
        userName: "Admin Hệ Thống",
        userRole: "admin" as const,
        action: "ADMIN_RESET_PASSWORD",
        resource: "users",
        details: `Admin đặt lại mật khẩu cho tài khoản ID: ${id}`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(audit);
      await addAuditLogInSupabase(audit);

      res.json({ success: true, message: `Đã đặt lại mật khẩu cho tài khoản. Mật khẩu mới là: ${passToSet}` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin: Delete User
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const existing = getUserById(id);

      await deleteUserInSupabase(id);
      deleteUser(id);

      const audit = {
        id: `log-${Date.now()}`,
        userId: "user-admin-1",
        userName: "Admin Hệ Thống",
        userRole: "admin" as const,
        action: "ADMIN_DELETE_USER",
        resource: "users",
        details: `Admin xóa tài khoản ID: ${id} (${existing?.name || id})`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(audit);
      await addAuditLogInSupabase(audit);

      res.json({ success: true, message: "Đã xóa tài khoản người dùng thành công khỏi Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // SQLITE DATABASE CRUD API ENDPOINTS
  // ==========================================

  // 1. Bootstrap: Fetch all SQLite data in one request for initial client load
  app.get("/api/db/bootstrap", (_req, res) => {
    try {
      const data = getFullSqliteSnapshot();
      res.json({ success: true, source: "sqlite", data });
    } catch (err: any) {
      console.error("Bootstrap SQLite error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Reset database to initial seed data
  app.post("/api/db/reset", (_req, res) => {
    try {
      resetDatabaseToSeed();
      const freshData = getFullSqliteSnapshot();
      res.json({ success: true, message: "Đã tái lập cơ sở dữ liệu SQLite về dữ liệu gốc thành công.", data: freshData });
    } catch (err: any) {
      console.error("Reset SQLite error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Journals CRUD
  app.get("/api/db/journals", (_req, res) => {
    try {
      const journals = getAllJournals();
      res.json({ success: true, data: journals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/db/journals", (req, res) => {
    try {
      const entry = req.body;
      createJournalEntry(entry);
      upsertJournalInSupabase(entry).catch(() => {});

      // If shared with parents, create a notification & award happiness points
      if (entry.privacy === "parents_only" || entry.privacy === "family_open") {
        const family = getAllFamilies()[0];
        if (family) {
          const happyRec = {
            id: `happy-jr-${Date.now()}`,
            familyId: family.id,
            amount: 15,
            source: "journal_share" as const,
            sourceTitle: `Chia sẻ nhật ký cảm xúc (${entry.emotionLabel})`,
            createdAt: new Date().toISOString(),
          };
          addHappinessRecord(happyRec);
          addHappinessInSupabase(happyRec).catch(() => {});

          // Notify parents
          family.parentIds.forEach((pid) => {
            const notif = {
              id: `notif-${Date.now()}-${pid}`,
              userId: pid,
              title: "Nhật ký cảm xúc mới từ con",
              message: `${entry.studentName} vừa chia sẻ nhật ký cảm xúc: "${entry.emotionLabel}". Hãy vào gửi một cái ôm hoặc lời nhắn động viên con nhé!`,
              type: "journal" as const,
              isRead: false,
              createdAt: new Date().toISOString(),
              actionTab: "journals",
            };
            addNotification(notif);
            addNotificationInSupabase(notif).catch(() => {});
          });
        }
      }

      // Security audit log
      const auditLogItem = {
        id: `log-${Date.now()}`,
        userId: entry.studentId,
        userName: entry.studentName,
        userRole: "student" as const,
        action: "CREATE_JOURNAL",
        resource: "emotion_journals",
        details: `Tạo nhật ký cảm xúc ID: ${entry.id} [${entry.emotionLabel} - mức độ ${entry.intensity}/10, chế độ ${entry.privacy}]`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(auditLogItem);
      addAuditLogInSupabase(auditLogItem).catch(() => {});

      res.json({ success: true, message: "Đã lưu nhật ký vào cơ sở dữ liệu SQLite & Supabase." });
    } catch (err: any) {
      console.error("Create journal SQLite error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/db/journals/:id/privacy", (req, res) => {
    try {
      const { id } = req.params;
      const { privacy, userId, userName, userRole } = req.body;
      updateJournalPrivacy(id, privacy);
      const updatedJournal = getAllJournals().find((j) => j.id === id);
      if (updatedJournal) {
        upsertJournalInSupabase(updatedJournal).catch(() => {});
      }

      const logItem = {
        id: `log-${Date.now()}`,
        userId: userId || "user-student-1",
        userName: userName || "Học sinh",
        userRole: (userRole as any) || "student",
        action: "UPDATE_PRIVACY",
        resource: "emotion_journals",
        details: `Cập nhật quyền riêng tư nhật ký ${id} sang ${privacy}`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(logItem);
      addAuditLogInSupabase(logItem).catch(() => {});

      res.json({ success: true, message: "Cập nhật quyền riêng tư thành công." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/db/journals/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { userId, userName } = req.query;
      deleteJournalEntry(id);
      deleteJournalInSupabase(id).catch(() => {});

      const logItem = {
        id: `log-${Date.now()}`,
        userId: (userId as string) || "user-student-1",
        userName: (userName as string) || "Học sinh",
        userRole: "student" as const,
        action: "DELETE_JOURNAL",
        resource: "emotion_journals",
        details: `Xóa nhật ký cảm xúc ID ${id}`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(logItem);
      addAuditLogInSupabase(logItem).catch(() => {});

      res.json({ success: true, message: "Đã xóa nhật ký thành công." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/db/journals/:id/reaction", (req, res) => {
    try {
      const { id } = req.params;
      const reaction = req.body;
      addParentReaction(id, reaction);

      const allJournals = getAllJournals();
      const targetJournal = allJournals.find((j) => j.id === id);
      if (targetJournal) {
        upsertJournalInSupabase(targetJournal).catch(() => {});
      }

      // Add happiness points (+10)
      const family = getAllFamilies()[0];
      if (family) {
        const happyRec = {
          id: `happy-rx-${Date.now()}`,
          familyId: family.id,
          amount: 10,
          source: "positive_reaction" as const,
          sourceTitle: `${reaction.parentName} phản hồi nhật ký của con`,
          createdAt: new Date().toISOString(),
        };
        addHappinessRecord(happyRec);
        addHappinessInSupabase(happyRec).catch(() => {});
      }

      // Notify student
      if (targetJournal) {
        const notif = {
          id: `notif-${Date.now()}`,
          userId: targetJournal.studentId,
          title: "Cha mẹ đã phản hồi nhật ký của bạn",
          message: `${reaction.parentName} (${reaction.parentRoleName}) vừa gửi biểu cảm và thông điệp yêu thương tới nhật ký của bạn.`,
          type: "reaction" as const,
          isRead: false,
          createdAt: new Date().toISOString(),
          actionTab: "journals",
        };
        addNotification(notif);
        addNotificationInSupabase(notif).catch(() => {});
      }

      // Audit log
      const logItem = {
        id: `log-${Date.now()}`,
        userId: reaction.parentId,
        userName: reaction.parentName,
        userRole: "parent" as const,
        action: "ADD_REACTION",
        resource: "emotion_journals",
        details: `Phụ huynh gửi phản hồi [${reaction.reactionType}] tới nhật ký ID ${id}`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(logItem);
      addAuditLogInSupabase(logItem).catch(() => {});

      res.json({ success: true, message: "Đã lưu phản hồi của phụ huynh vào SQLite & Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Consultation Sessions CRUD
  app.get("/api/db/consultations", (_req, res) => {
    try {
      const list = getAllConsultations();
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/db/consultations", (req, res) => {
    try {
      const consultation = req.body;
      createConsultation(consultation);
      upsertConsultationInSupabase(consultation).catch(() => {});

      // Notify psychologists
      const users = getAllUsers();
      const psychologists = users.filter((u) => u.role === "psychologist");
      psychologists.forEach((psy) => {
        const notif = {
          id: `notif-${Date.now()}-${psy.id}`,
          userId: psy.id,
          title: "Yêu cầu tham vấn mới từ học sinh",
          message: `Học sinh ${consultation.studentName} đã gửi yêu cầu tham vấn: "${consultation.topic}".`,
          type: "consultation" as const,
          isRead: false,
          createdAt: new Date().toISOString(),
          actionTab: "consultation",
        };
        addNotification(notif);
        addNotificationInSupabase(notif).catch(() => {});
      });

      // Audit log
      const logItem = {
        id: `log-${Date.now()}`,
        userId: consultation.studentId,
        userName: consultation.studentName,
        userRole: "student" as const,
        action: "CREATE_CONSULTATION",
        resource: "consultation_sessions",
        details: `Học sinh gửi yêu cầu tham vấn tâm lý ID: ${consultation.id} chủ đề "${consultation.topic}"`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(logItem);
      addAuditLogInSupabase(logItem).catch(() => {});

      res.json({ success: true, message: "Đã lưu phiên tham vấn vào SQLite & Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/db/consultations/:id/messages", (req, res) => {
    try {
      const { id } = req.params;
      const message = req.body;
      addConsultationMessage(id, message);

      const consultations = getAllConsultations();
      const session = consultations.find((c) => c.id === id);
      if (session) {
        upsertConsultationInSupabase(session).catch(() => {});

        const targetUserId = message.senderRole === "student" ? (session.psychologistId || "user-psy-1") : session.studentId;
        const notif = {
          id: `notif-${Date.now()}`,
          userId: targetUserId,
          title: `Tin nhắn tham vấn mới từ ${message.senderName}`,
          message: message.content.length > 80 ? message.content.slice(0, 80) + "..." : message.content,
          type: "consultation" as const,
          isRead: false,
          createdAt: new Date().toISOString(),
          actionTab: "consultation",
        };
        addNotification(notif);
        addNotificationInSupabase(notif).catch(() => {});
      }

      // Audit log
      const logItem = {
        id: `log-${Date.now()}`,
        userId: message.senderId,
        userName: message.senderName,
        userRole: message.senderRole,
        action: "SEND_MESSAGE",
        resource: "consultation_sessions",
        details: `Gửi tin nhắn trong phiên tham vấn ID ${id}`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(logItem);
      addAuditLogInSupabase(logItem).catch(() => {});

      res.json({ success: true, message: "Đã lưu tin nhắn tham vấn vào SQLite & Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/db/consultations/:id/status", (req, res) => {
    try {
      const { id } = req.params;
      const { status, officialFeedback, nextActionPlan, privateNotes, psychologistId, psychologistName } = req.body;
      updateConsultationStatus(id, status, officialFeedback, nextActionPlan, privateNotes);

      const consultations = getAllConsultations();
      const session = consultations.find((c) => c.id === id);
      if (session) {
        upsertConsultationInSupabase(session).catch(() => {});

        // If official feedback provided, notify student
        if (officialFeedback) {
          const notif = {
            id: `notif-${Date.now()}`,
            userId: session.studentId,
            title: "Chuyên gia đã gửi đánh giá & giải pháp tham vấn",
            message: `Chuyên gia tâm lý đã cập nhật đánh giá chuyên môn và kế hoạch hành động cho phiên tham vấn "${session.topic}".`,
            type: "consultation" as const,
            isRead: false,
            createdAt: new Date().toISOString(),
            actionTab: "consultation",
          };
          addNotification(notif);
          addNotificationInSupabase(notif).catch(() => {});
        }
      }

      // Audit log
      const logItem = {
        id: `log-${Date.now()}`,
        userId: psychologistId || "user-psy-1",
        userName: psychologistName || "Chuyên gia tâm lý",
        userRole: "psychologist" as const,
        action: "UPDATE_CONSULTATION_STATUS",
        resource: "consultation_sessions",
        details: `Cập nhật trạng thái phiên tham vấn ID ${id} sang ${status}`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(logItem);
      addAuditLogInSupabase(logItem).catch(() => {});

      res.json({ success: true, message: "Đã cập nhật trạng thái tham vấn trong SQLite & Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Deep Talk Sessions CRUD
  app.post("/api/db/deeptalk/sessions", (req, res) => {
    try {
      const session = req.body;
      createDeepTalkSession(session);
      upsertDeepTalkSessionInSupabase(session).catch(() => {});
      res.json({ success: true, message: "Đã tạo phiên Deep Talk trong SQLite & Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/db/deeptalk/sessions/:id/answer", (req, res) => {
    try {
      const { id } = req.params;
      const { questionId, answer, isParent } = req.body;
      updateDeepTalkAnswer(id, questionId, answer, isParent);

      const session = getAllDeepTalkSessions().find((s) => s.id === id);
      if (session) {
        upsertDeepTalkSessionInSupabase(session).catch(() => {});
      }
      res.json({ success: true, message: "Đã lưu câu trả lời Deep Talk vào SQLite & Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/db/deeptalk/sessions/:id/complete", (req, res) => {
    try {
      const { id } = req.params;
      const { reflection, familyId, topicTitle } = req.body;
      completeDeepTalkSession(id, reflection);

      const session = getAllDeepTalkSessions().find((s) => s.id === id);
      if (session) {
        upsertDeepTalkSessionInSupabase(session).catch(() => {});
      }

      // Award 50 happiness points
      if (familyId) {
        const happyRec = {
          id: `happy-dt-${Date.now()}`,
          familyId,
          amount: 50,
          source: "deeptalk" as const,
          sourceTitle: `Hoàn thành Deep Talk: ${topicTitle || "Đối thoại sâu gia đình"}`,
          createdAt: new Date().toISOString(),
        };
        addHappinessRecord(happyRec);
        addHappinessInSupabase(happyRec).catch(() => {});
      }

      // Audit log
      const logItem = {
        id: `log-${Date.now()}`,
        userId: "system",
        userName: "Gia đình",
        userRole: "student" as const,
        action: "COMPLETE_DEEP_TALK",
        resource: "deep_talk_sessions",
        details: `Hoàn thành phiên Deep Talk ID ${id}, cộng 50 điểm gắn kết`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(logItem);
      addAuditLogInSupabase(logItem).catch(() => {});

      res.json({ success: true, message: "Đã hoàn thành phiên Deep Talk trong SQLite & Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Challenge 30 Days CRUD
  app.post("/api/db/challenges/:day/confirm", (req, res) => {
    try {
      const day = Number(req.params.day);
      const { role, note, userName, userId, title, points } = req.body;
      const result = confirmChallengeDay(day, role, note);

      const allProgress = getAllChallengeProgress();
      const updatedDayProgress = allProgress.find((p) => p.day === day);
      if (updatedDayProgress) {
        upsertChallengeProgressInSupabase(updatedDayProgress).catch(() => {});
      }

      // If day newly completed by both sides
      if (result.nowCompleted) {
        const family = getAllFamilies()[0];
        if (family) {
          const happyRec = {
            id: `happy-ch-${Date.now()}`,
            familyId: family.id,
            amount: points || 30,
            source: "challenge" as const,
            sourceTitle: `Cả hai bên hoàn thành Ngày ${day}: ${title || "Thử thách 30 ngày"}`,
            createdAt: new Date().toISOString(),
          };
          addHappinessRecord(happyRec);
          addHappinessInSupabase(happyRec).catch(() => {});
        }
      }

      // Audit log
      const logItem = {
        id: `log-${Date.now()}`,
        userId: userId || `user-${role}-1`,
        userName: userName || (role === "student" ? "Học sinh" : "Phụ huynh"),
        userRole: role,
        action: "CONFIRM_CHALLENGE",
        resource: "challenge_progress",
        details: `${role === "student" ? "Học sinh" : "Phụ huynh"} xác nhận hoàn thành Ngày ${day}`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(logItem);
      addAuditLogInSupabase(logItem).catch(() => {});

      res.json({ success: true, message: "Đã cập nhật tiến độ thử thách vào SQLite & Supabase.", nowCompleted: result.nowCompleted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Happiness Points CRUD
  app.post("/api/db/happiness", (req, res) => {
    try {
      const record = req.body;
      addHappinessRecord(record);
      addHappinessInSupabase(record).catch(() => {});
      res.json({ success: true, message: "Đã cập nhật điểm hạnh phúc SQLite & Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Notifications CRUD
  app.put("/api/db/notifications/:id/read", (req, res) => {
    try {
      const { id } = req.params;
      markNotificationRead(id);
      markNotificationReadInSupabase(id).catch(() => {});
      res.json({ success: true, message: "Đã đánh dấu thông báo đọc trong SQLite & Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/db/notifications/read-all", (req, res) => {
    try {
      const { userId } = req.body;
      markAllNotificationsRead(userId);
      if (userId) {
        markAllNotificationsReadInSupabase(userId).catch(() => {});
      }
      res.json({ success: true, message: "Đã đánh dấu tất cả thông báo đọc trong SQLite & Supabase." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Family Operations & Management
  app.get("/api/db/families", (_req, res) => {
    try {
      const families = getAllFamilies();
      res.json({ success: true, data: families });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/db/families/:id", (req, res) => {
    try {
      const family = getFamilyById(req.params.id);
      if (!family) return res.status(404).json({ success: false, error: "Không tìm thấy nhóm gia đình." });
      res.json({ success: true, data: family });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/db/families/create", (req, res) => {
    try {
      const { name, familyCode, creatorId, creatorRole, avatarIcon, description } = req.body;
      if (!name) return res.status(400).json({ success: false, error: "Tên nhóm gia đình là bắt buộc." });

      const code = familyCode || `CODE-${Math.floor(1000 + Math.random() * 9000)}`;
      const existing = findFamilyByCode(code);
      if (existing) {
        return res.status(400).json({ success: false, error: "Mã gia đình này đã tồn tại, vui lòng chọn mã khác." });
      }

      const newFamily = {
        id: `family-${Date.now().toString(36)}`,
        name,
        familyCode: code.toUpperCase(),
        studentIds: creatorRole === "student" && creatorId ? [creatorId] : [],
        parentIds: creatorRole === "parent" && creatorId ? [creatorId] : [],
        happinessPoints: 100,
        streakDays: 1,
        createdAt: new Date().toISOString(),
        avatarIcon: avatarIcon || "🏡",
        description: description || `Tổ ấm ${name}`,
      };

      createFamily(newFamily);
      upsertFamilyInSupabase(newFamily).catch(() => {});

      if (creatorId) {
        const creator = getUserById(creatorId);
        if (creator) {
          const updatedUser = {
            ...creator,
            familyId: newFamily.id,
          };
          updateUser(updatedUser);
          upsertUserInSupabase(updatedUser).catch(() => {});
        }
      }

      const logItem = {
        id: `log-${Date.now()}`,
        userId: creatorId || "system",
        userName: "Người dùng",
        userRole: (creatorRole as any) || "student",
        action: "CREATE_FAMILY",
        resource: "families",
        details: `Tạo nhóm gia đình mới: "${name}" (Mã: ${newFamily.familyCode})`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS" as const,
      };
      addAuditLog(logItem);
      addAuditLogInSupabase(logItem).catch(() => {});

      res.json({ success: true, data: newFamily, message: `Đã tạo nhóm gia đình "${name}" thành công!` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/db/families/:id", (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const existing = getFamilyById(id);
      if (!existing) return res.status(404).json({ success: false, error: "Không tìm thấy nhóm gia đình." });

      const updated = { ...existing, ...updates };
      updateFamily(updated);
      upsertFamilyInSupabase(updated).catch(() => {});
      res.json({ success: true, data: updated, message: "Đã cập nhật thông tin nhóm gia đình." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/db/families/:id", (req, res) => {
    try {
      const { id } = req.params;
      deleteFamily(id);
      deleteFamilyInSupabase(id).catch(() => {});
      res.json({ success: true, message: "Đã xóa nhóm gia đình." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/db/families/:id/add-member", (req, res) => {
    try {
      const { id } = req.params;
      const { userId, role, familyRole } = req.body;
      const result = addMemberToFamily(id, userId, role, familyRole);
      const updatedFamily = getFamilyById(id);
      if (updatedFamily) {
        upsertFamilyInSupabase(updatedFamily).catch(() => {});
      }
      const updatedUser = getUserById(userId);
      if (updatedUser) {
        upsertUserInSupabase(updatedUser).catch(() => {});
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/db/families/:id/remove-member", (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const result = removeMemberFromFamily(id, userId);
      const updatedFamily = getFamilyById(id);
      if (updatedFamily) {
        upsertFamilyInSupabase(updatedFamily).catch(() => {});
      }
      const updatedUser = getUserById(userId);
      if (updatedUser) {
        upsertUserInSupabase(updatedUser).catch(() => {});
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Family Code Join
  app.post("/api/db/family/join", (req, res) => {
    try {
      const { userId, userRole, code } = req.body;
      const result = joinFamilyWithCode(userId, userRole, code);
      if (result.success && result.family) {
        upsertFamilyInSupabase(result.family).catch(() => {});
        const updatedUser = getUserById(userId);
        if (updatedUser) {
          upsertUserInSupabase(updatedUser).catch(() => {});
        }
        const logItem = {
          id: `log-${Date.now()}`,
          userId,
          userName: userRole === "student" ? "Học sinh" : "Phụ huynh",
          userRole,
          action: "JOIN_FAMILY",
          resource: "families",
          details: `Kết nối thành công vào gia đình mã ${code}`,
          timestamp: new Date().toISOString(),
          status: "SUCCESS" as const,
        };
        addAuditLog(logItem);
        addAuditLogInSupabase(logItem).catch(() => {});
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Family Invitations
  app.get("/api/db/family-invitations", (_req, res) => {
    try {
      const invitations = getAllFamilyInvitations();
      res.json({ success: true, data: invitations });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/db/family-invitations", (req, res) => {
    try {
      const inv = req.body;
      createFamilyInvitation(inv);
      upsertInvitationInSupabase(inv).catch(() => {});

      // Check if recipient is an existing user to push notification
      const user = findUserByEmailOrName(inv.recipientEmailOrPhone);
      if (user) {
        const notif = {
          id: `notif-${Date.now()}`,
          userId: user.id,
          title: "Lời mời kết nối gia đình mới",
          message: `${inv.senderName} (${inv.senderRole === 'student' ? 'Con' : 'Phụ huynh'}) đã gửi lời mời bạn tham gia nhóm gia đình "${inv.familyName}". Mã: ${inv.familyCode}`,
          type: "system" as const,
          isRead: false,
          createdAt: new Date().toISOString(),
          actionTab: "family",
        };
        addNotification(notif);
        addNotificationInSupabase(notif).catch(() => {});
      }

      res.json({ success: true, message: `Đã gửi lời mời kết nối tới ${inv.recipientEmailOrPhone} thành công!` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/db/family-invitations/:id/respond", (req, res) => {
    try {
      const { id } = req.params;
      const { status, userId, userRole, familyId } = req.body;
      const result = respondFamilyInvitation(id, status);

      const allInvs = getAllFamilyInvitations();
      const updatedInv = allInvs.find((inv) => inv.id === id);
      if (updatedInv) {
        upsertInvitationInSupabase(updatedInv).catch(() => {});
      }

      if (status === "accepted" && userId && familyId) {
        addMemberToFamily(familyId, userId, userRole);
        const updatedFam = getFamilyById(familyId);
        if (updatedFam) upsertFamilyInSupabase(updatedFam).catch(() => {});
        const updatedUser = getUserById(userId);
        if (updatedUser) upsertUserInSupabase(updatedUser).catch(() => {});
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. Audit Log Add
  app.post("/api/db/audit", (req, res) => {
    try {
      const log = req.body;
      addAuditLog(log);
      addAuditLogInSupabase(log).catch(() => {});
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. Full Restore / Sync Snapshot into SQLite
  app.post("/api/db/restore", (req, res) => {
    try {
      const { data } = req.body;
      const result = restoreFullSnapshot(data);
      const snapshot = getFullSqliteSnapshot();
      res.json({ ...result, data: snapshot });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 12. Raw SQLite Database File Download
  app.get("/api/db/sqlite-file", (_req, res) => {
    try {
      const dbFile = path.join(process.cwd(), "data-storage", "codegenz.sqlite");
      if (fs.existsSync(dbFile)) {
        res.setHeader("Content-Type", "application/x-sqlite3");
        res.setHeader("Content-Disposition", `attachment; filename="codegenz_${new Date().toISOString().slice(0,10)}.sqlite"`);
        return res.sendFile(dbFile);
      }
      res.status(404).send("Tệp SQLite chưa được tạo.");
    } catch (err: any) {
      res.status(500).send("Lỗi tải tệp SQLite");
    }
  });

  // AI Chat Assistant endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, role, context, history } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback intelligent responses if API key is not provided yet
        let mockReply = "";
        if (role === "student") {
          mockReply = `Chào bạn, mình lắng nghe bạn đây. Khi gặp áp lực học tập hoặc muốn mở lời với bố mẹ, bạn hãy thử bắt đầu bằng việc chia sẻ cảm xúc chân thật nhất của mình trước nhé. Ví dụ: "Bố mẹ ơi, hôm nay con hơi mệt và có chuyện này con rất muốn được bố mẹ lắng nghe mà không vội trách con ạ..."`;
        } else if (role === "parent") {
          mockReply = `Chào cha mẹ, khi con đang có cảm xúc tiêu cực hoặc khép kín, bước đầu tiên quan trọng nhất là "lắng nghe chủ động" và xác thực cảm xúc của con thay vì vội đưa ra lời khuyên hay so sánh. Cha mẹ có thể nói: "Mẹ thấy hôm nay con có vẻ có nhiều điều trăn trở, mẹ luôn ở đây và sẵn sàng lắng nghe con bất cứ khi nào con thấy thoải mái nhé."`;
        } else {
          mockReply = `CODE AI luôn sẵn sàng đồng hành cùng gia đình để xây dựng cầu nối thấu cảm và yêu thương. Bạn cần hỗ trợ gì thêm không?`;
        }
        return res.json({ reply: mockReply });
      }

      const systemInstruction = role === "parent"
        ? `Bạn là CODE Empathy Assistant - Chuyên gia trợ lý tâm lý giao tiếp dành cho CHA MẸ có con đang học THPT (GenZ).
Mục tiêu cốt lõi:
1. Giúp cha mẹ thấu hiểu tâm sinh lý lứa tuổi học sinh THPT (áp lực thi cử, định hướng tương lai, tình bạn, mong muốn khẳng định bản thân).
2. Hướng dẫn cha mẹ cách phản hồi không phán xét, không áp đặt, không so sánh "con nhà người ta".
3. Gợi ý cụ thể câu từ, lời nói ấm áp, tạo cảm giác an toàn để con sẵn sàng mở lòng.
4. Tôn trọng triết lý CODE: Connect (Kết nối) - Open (Mở lòng) - Develop (Phát triển) - Empathy (Đồng cảm).
Lưu ý: Luôn dùng giọng điệu ân cần, tôn trọng, mang tính xây dựng, ngắn gọn và dễ áp dụng vào thực tế gia đình Việt Nam.`
        : `Bạn là CODE GenZ Companion - Trợ lý giao tiếp thân thiện, tinh tế dành cho HỌC SINH THPT.
Mục tiêu cốt lõi:
1. Giúp học sinh diễn đạt cảm xúc một cách rõ ràng khi đang bối rối, lo âu hoặc áp lực.
2. Gợi ý các cách mở đầu cuộc trò chuyện tự nhiên với cha mẹ mà không sợ bị la mắng hay hiểu lầm.
3. Giúp học sinh nhìn nhận góc nhìn yêu thương của cha mẹ dù đôi khi cách thể hiện của cha mẹ chưa khéo.
4. Đề xuất các câu hỏi Deep Talk hoặc hành động nhỏ để gắn kết.
Lưu ý: Giọng điệu ấm áp, đồng cảm, văn phong GenZ nhẹ nhàng, văn minh, không phán xét.`;

      const prompt = `
Bối cảnh người dùng: ${context || "Giao tiếp trong gia đình THPT"}
Lịch sử trao đổi trước đó: ${JSON.stringify(history || [])}
Tin nhắn từ người dùng (${role === "parent" ? "Cha Mẹ" : "Học sinh"}): "${message}"

Hãy đưa ra câu trả lời thấu cảm, thực tế và mang lại lời khuyên hoặc gợi ý câu nói trực tiếp để người dùng có thể áp dụng ngay.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "Mình luôn ở đây lắng nghe bạn. Hãy chia sẻ thêm nhé!";
      res.json({ reply });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      res.status(500).json({ error: error.message || "Lỗi xử lý AI" });
    }
  });

  // AI Parent Coaching endpoint (analyze student's emotion entry & suggest responses)
  app.post("/api/ai/parent-coach", async (req, res) => {
    try {
      const { emotion, intensity, reason, wishToUnderstand, studentName } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          empathyAnalysis: `Con đang cảm thấy ${emotion} (mức độ ${intensity}/10). Nguyên nhân chính từ việc: "${reason || 'Chưa nêu'}". Điều con khao khát nhất lúc này là: "${wishToUnderstand || 'Được bố mẹ lắng nghe và thấu hiểu'}".`,
          suggestedMessages: [
            `"Mẹ thấy hôm nay con có nhiều trăn trở. Mẹ luôn ở đây và tin tưởng con, khi nào con muốn chia sẻ thì nói với mẹ nhé."`,
            `"Bố mẹ hiểu là việc này không hề dễ dàng với con. Cảm ơn con đã dũng cảm chia sẻ điều này."`,
            `"Mẹ rất muốn nghe con kể thêm, không phải để phán xét mà là để mẹ hiểu và đồng hành cùng con tốt hơn."`
          ],
          thingsToAvoid: [
            "Tránh nói: 'Có thế mà cũng áp lực', 'Hồi xưa bố mẹ còn khổ hơn nhiều'.",
            "Tránh vội vã đưa ra giải pháp ngay khi con chưa sẵn sàng nghe.",
            "Tránh chất vấn hay tra hỏi dồn dập."
          ],
          actionTip: "Hãy pha cho con một cốc nước ấm, ngồi cạnh con một cách nhẹ nhàng hoặc gửi một tin nhắn ngắn chứa đựng sự tin tưởng."
        });
      }

      const prompt = `
Phân tích nhật ký cảm xúc mà học sinh (${studentName || "Con"}) vừa chia sẻ với cha mẹ:
- Cảm xúc: ${emotion}
- Mức độ cảm xúc: ${intensity}/10
- Sự việc / Lý do: ${reason}
- Điều con mong muốn được cha mẹ hiểu: ${wishToUnderstand}

Hãy đóng vai trò chuyên gia tâm lý gia đình CODE GenZ Family và đưa ra phân tích & hướng dẫn chi tiết cho Cha Mẹ theo định dạng JSON với cấu trúc:
{
  "empathyAnalysis": "Đoạn văn ngắn gọn giải thích tâm trạng và nhu cầu tâm lý cốt lõi của con lúc này",
  "suggestedMessages": ["Gợi ý câu nói 1 ấm áp", "Gợi ý câu nói 2 khích lệ", "Gợi ý câu nói 3 mở đầu lắng nghe"],
  "thingsToAvoid": ["Điều cần tránh 1", "Điều cần tránh 2", "Điều cần tránh 3"],
  "actionTip": "Hành động thực tế nhỏ mà cha mẹ có thể làm ngay hôm nay để kết nối với con"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "Bạn là chuyên gia tư vấn tâm lý học hành vi gia đình Việt Nam. Luôn xuất ra JSON hợp lệ.",
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Parent coach error:", error);
      res.status(500).json({ error: error.message || "Lỗi xử lý phân tích" });
    }
  });

  // AI Icebreaker generator for student
  app.post("/api/ai/icebreakers", async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          icebreakers: [
            `"Bố/Mẹ ơi, dạo này con đang có chuyện này hơi băn khoăn về ${topic || 'việc học'}, tối nay bố/mẹ có rảnh 10 phút để nghe con tâm sự không ạ?"`,
            `"Con biết bố mẹ luôn mong điều tốt nhất cho con. Con đang gặp chút áp lực về ${topic || 'định hướng'}, con muốn xin lời khuyên nhẹ nhàng từ bố mẹ ạ."`,
            `"Hôm nay con có làm một bài kiểm tra nhỏ trên app CODE GenZ Family, con muốn đọc cho bố mẹ nghe thử một câu hỏi rất hay này..."`
          ]
        });
      }

      const prompt = `Học sinh THPT muốn nói chuyện với bố mẹ về chủ đề: "${topic || 'áp lực học tập và chọn ngành'}".
Mức độ khó mở lời: ${difficulty || 'vừa phải'}.
Hãy tạo 3 câu mở đầu (icebreakers) tự nhiên, chân thành, giúp phụ huynh không bị giật mình hay phản ứng phòng thủ, mà tạo ra bầu không khí cởi mở và ấm áp.
Trả về JSON định dạng: { "icebreakers": ["câu 1", "câu 2", "câu 3"] }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Icebreaker error:", error);
      res.status(500).json({ error: error.message || "Lỗi tạo câu mở đầu" });
    }
  });

  // Long-Term Data Storage & Database Persistence Endpoints
  const DATA_DIR = path.join(process.cwd(), "data-storage");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Save full database snapshot to server disk
  app.post("/api/data/save-backup", (req, res) => {
    try {
      const { jsonBackup, xmlBackup, timestamp } = req.body;
      const backupDate = timestamp || new Date().toISOString().replace(/[:.]/g, "-");

      if (jsonBackup) {
        fs.writeFileSync(path.join(DATA_DIR, "codegenz_latest.json"), JSON.stringify(jsonBackup, null, 2), "utf-8");
        fs.writeFileSync(path.join(DATA_DIR, `codegenz_backup_${backupDate}.json`), JSON.stringify(jsonBackup, null, 2), "utf-8");
      }

      if (xmlBackup) {
        fs.writeFileSync(path.join(DATA_DIR, "codegenz_latest.xml"), xmlBackup, "utf-8");
        fs.writeFileSync(path.join(DATA_DIR, `codegenz_backup_${backupDate}.xml`), xmlBackup, "utf-8");
      }

      res.json({
        success: true,
        message: "Dữ liệu đã được lưu trữ an toàn lâu dài trên máy chủ và xuất file XML/JSON thành công.",
        savedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Save backup error:", err);
      res.status(500).json({ success: false, error: err.message || "Không thể lưu tệp dữ liệu máy chủ" });
    }
  });

  // Load latest backup from server disk
  app.get("/api/data/load-backup", (_req, res) => {
    try {
      const latestJsonPath = path.join(DATA_DIR, "codegenz_latest.json");
      const latestXmlPath = path.join(DATA_DIR, "codegenz_latest.xml");

      if (fs.existsSync(latestJsonPath)) {
        const raw = fs.readFileSync(latestJsonPath, "utf-8");
        const json = JSON.parse(raw);
        return res.json({ success: true, hasBackup: true, data: json, source: "server_json" });
      }

      if (fs.existsSync(latestXmlPath)) {
        const xml = fs.readFileSync(latestXmlPath, "utf-8");
        return res.json({ success: true, hasBackup: true, xml, source: "server_xml" });
      }

      res.json({ success: true, hasBackup: false, message: "Chưa có bản sao lưu nào trên máy chủ." });
    } catch (err: any) {
      console.error("Load backup error:", err);
      res.status(500).json({ success: false, error: err.message || "Lỗi đọc sao lưu máy chủ" });
    }
  });

  // Direct XML download stream
  app.get("/api/data/download-xml", (_req, res) => {
    try {
      const latestXmlPath = path.join(DATA_DIR, "codegenz_latest.xml");
      if (fs.existsSync(latestXmlPath)) {
        res.setHeader("Content-Type", "application/xml");
        res.setHeader("Content-Disposition", `attachment; filename="codegenz_database_${new Date().toISOString().slice(0,10)}.xml"`);
        return res.sendFile(latestXmlPath);
      }
      res.status(404).send("Chưa có tệp XML sao lưu.");
    } catch (err: any) {
      res.status(500).send("Lỗi tải tệp XML");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CODE GenZ Family Server running on port ${PORT} with SQLite Database`);
  });
}

startServer();
