import { useEffect, useState } from "react";

export type LanguageCode = "en" | "vi";

export type I18nKey =
  | "app.brand"
  | "role.admin"
  | "role.teacher"
  | "role.student"
  | "nav.dashboard"
  | "nav.users"
  | "nav.analytics"
  | "nav.exams"
  | "nav.questionBank"
  | "nav.classes"
  | "nav.assignments"
  | "nav.students"
  | "nav.myClasses"
  | "nav.myResults"
  | "nav.settings"
  | "nav.antiCheating"
  | "nav.examInProgress"
  | "common.all"
  | "common.searchPlaceholderTeacher"
  | "common.searchPlaceholderAdmin"
  | "common.searchPlaceholderStudent"
  | "common.createExam"
  | "common.signOut"
  | "common.save"
  | "common.saving"
  | "common.cancel"
  | "common.refresh"
  | "common.loading"
  | "common.viewAll"
  | "common.add"
  | "common.edit"
  | "common.delete"
  | "common.remove"
  | "common.status.active"
  | "common.status.inactive"
  | "common.status.draft"
  | "common.status.published"
  | "common.roleLabel"
  | "common.name"
  | "common.email"
  | "common.role"
  | "common.user"
  | "common.actions"
  | "common.type"
  | "common.status"
  | "common.searchByNameOrEmail"
  | "common.avatarAlt"
  | "common.notifications"
  | "common.pagination"
  | "common.pagination.previous"
  | "common.pagination.next"
  | "common.pagination.morePages"
  | "common.pagination.goToPreviousPage"
  | "common.pagination.goToNextPage"
  | "common.close"
  | "common.more"
  | "common.breadcrumb"
  | "common.sidebar.toggle"
  | "router.preparingWorkspace"
  | "router.loadingResources"
  | "router.loadingSession"
  | "router.loadingLandingPage"
  | "router.permissionDenied"
  | "settings.profile.fullName"
  | "settings.profile.email"
  | "settings.profile.school"
  | "settings.profile.schoolPlaceholder"
  | "settings.profile.subject"
  | "settings.profile.subjectPlaceholder"
  | "settings.profile.changePhoto"
  | "settings.profile.saveSuccess"
  | "settings.profile.avatarUpdated"
  | "settings.profile.uploadFailed"
  | "settings.security.currentPassword"
  | "settings.security.newPassword"
  | "settings.security.confirmPassword"
  | "settings.security.minimumLength"
  | "settings.security.updatePassword"
  | "settings.security.minLengthError"
  | "settings.security.confirmMismatch"
  | "settings.security.updated"
  | "settings.security.mvpNote"
  | "settings.language.english"
  | "settings.language.vietnamese"
  | "settings.language.timezone.hcm"
  | "settings.language.timezone.tokyo"
  | "settings.language.timezone.newYork"
  | "settings.language.saved"
  | "settings.button.saveChanges"
  | "adminUsers.loadFailed"
  | "adminUsers.createSuccess"
  | "adminUsers.createFailed"
  | "adminUsers.updateStatusSuccess"
  | "adminUsers.updateStatusFailed"
  | "adminUsers.updateSuccess"
  | "adminUsers.updateFailed"
  | "adminUsers.passwordMinLength"
  | "adminUsers.passwordMismatch"
  | "adminUsers.passwordResetSuccess"
  | "adminUsers.passwordResetFailed"
  | "adminUsers.deleteSuccess"
  | "adminUsers.deleteFailed"
  | "adminUsers.loading"
  | "adminUsers.title"
  | "adminUsers.subtitle"
  | "adminUsers.createUser"
  | "adminUsers.managementTitle"
  | "adminUsers.empty"
  | "adminUsers.searchPlaceholder"
  | "adminUsers.totalUsers"
  | "adminUsers.deactivateConfirm"
  | "adminUsers.activateConfirm"
  | "adminUsers.deleteConfirm"
  | "adminUsers.createDialogTitle"
  | "adminUsers.fullNamePlaceholder"
  | "adminUsers.passwordHint"
  | "adminUsers.createAccount"
  | "adminUsers.creating"
  | "adminUsers.editDialogTitle"
  | "adminUsers.resetPassword"
  | "adminUsers.deactivate"
  | "adminUsers.activate"
  | "adminUsers.passwordDialogTitle"
  | "adminUsers.passwordDialogDescription"
  | "adminUsers.newPassword"
  | "adminUsers.confirmNewPassword"
  | "questionBank.loadFailed"
  | "questionBank.loadQuestionFailed"
  | "questionBank.requiredQuestionText"
  | "questionBank.requiredOptions"
  | "questionBank.singleChoiceValidation"
  | "questionBank.multipleChoiceValidation"
  | "questionBank.saveFailed"
  | "questionBank.deleteFailed"
  | "questionBank.title"
  | "questionBank.totalQuestions"
  | "questionBank.newQuestion"
  | "questionBank.searchPlaceholder"
  | "questionBank.empty"
  | "questionBank.question"
  | "questionBank.type"
  | "questionBank.singleChoice"
  | "questionBank.multipleChoice"
  | "questionBank.difficulty"
  | "questionBank.tags"
  | "questionBank.single"
  | "questionBank.multiple"
  | "questionBank.deleteConfirm"
  | "questionBank.editor.newTitle"
  | "questionBank.editor.editTitle"
  | "questionBank.editor.description"
  | "questionBank.editor.questionText"
  | "questionBank.editor.explanation"
  | "questionBank.editor.answerOptions"
  | "questionBank.editor.addOption"
  | "questionBank.editor.removeOption"
  | "questionBank.editor.optionPlaceholder"
  | "questionBank.editor.type"
  | "questionBank.editor.singleChoice"
  | "questionBank.editor.multipleChoice"
  | "questionBank.difficulty.easy"
  | "questionBank.difficulty.medium"
  | "questionBank.difficulty.hard"
  | "questionBank.editor.status"
  | "questionBank.editor.tags"
  | "questionBank.editor.tagsPlaceholder"
  | "examEditor.step.basicInfo"
  | "examEditor.step.questions"
  | "examEditor.step.review"
  | "examEditor.title"
  | "examEditor.titlePlaceholder"
  | "examEditor.description"
  | "examEditor.descriptionPlaceholder"
  | "examEditor.questionCount"
  | "examEditor.addFromBank"
  | "examEditor.addQuestion"
  | "examEditor.empty"
  | "examEditor.questionTitle"
  | "examEditor.questionTextPlaceholder"
  | "examEditor.questionAria"
  | "examEditor.answerOptions"
  | "examEditor.markCorrect"
  | "examEditor.optionPlaceholder"
  | "examEditor.removeOption"
  | "examEditor.addOption"
  | "examEditor.readyToSave"
  | "examEditor.reviewMessage"
  | "examEditor.reviewTitle"
  | "examEditor.publishImmediately"
  | "examEditor.previous"
  | "examEditor.next"
  | "classDetail.loadFailed"
  | "classDetail.notFound"
  | "classDetail.backToClasses"
  | "classDetail.membersCount"
  | "classDetail.primaryTeacher"
  | "classDetail.classTeachers"
  | "classDetail.classTeachersDescription"
  | "classDetail.addTeacher"
  | "classDetail.noTeachers"
  | "classDetail.primary"
  | "classDetail.removeTeacherConfirm"
  | "classDetail.reassignPrimaryTeacherFirst"
  | "classDetail.removeFromClass"
  | "classDetail.inviteCode"
  | "classDetail.copied"
  | "classDetail.copyCode"
  | "classDetail.copyInviteLink"
  | "classDetail.members"
  | "classDetail.totalMembers"
  | "classDetail.noMembers"
  | "classDetail.removeMemberConfirm"
  | "classDetail.thisUser"
  | "classDetail.addTeacherDialogTitle"
  | "classDetail.addTeacherDialogDescription"
  | "classDetail.alreadyAdded"
  | "classDetail.addTeacherSuccess"
  | "classDetail.addTeacherFailed"
  | "classDetail.removeTeacherSuccess"
  | "classDetail.removeTeacherFailed"
  | "teacherDashboard.title"
  | "teacherDashboard.welcome"
  | "teacherDashboard.myStudents"
  | "teacherDashboard.myExams"
  | "teacherDashboard.submissions"
  | "teacherDashboard.avgScore"
  | "teacherDashboard.calculatingStats"
  | "teacherDashboard.recentExams"
  | "teacherDashboard.recentExamsDescription"
  | "teacherDashboard.noExams"
  | "teacherDashboard.quickLinks"
  | "teacherDashboard.quickLinksDescription"
  | "teacherDashboard.newAssignment"
  | "teacherDashboard.newClass"
  | "teacherDashboard.classes"
  | "teacherDashboard.assignments"
  | "teacherDashboard.students"
  | "antiCheat.loadFailed"
  | "antiCheat.title"
  | "antiCheat.subtitle"
  | "antiCheat.totalStudents"
  | "antiCheat.activeNow"
  | "antiCheat.suspicious"
  | "antiCheat.submitted"
  | "antiCheat.searchPlaceholder"
  | "antiCheat.allStudents"
  | "antiCheat.suspiciousOnly"
  | "antiCheat.noStudents"
  | "antiCheat.student"
  | "antiCheat.examClass"
  | "antiCheat.events"
  | "antiCheat.lastEvent"
  | "assignmentList.failed"
  | "assignmentList.title"
  | "assignmentList.subtitle"
  | "assignmentList.new"
  | "assignmentList.searchPlaceholder"
  | "assignmentList.empty"
  | "assignmentList.viewReport"
  | "classList.failed"
  | "classList.title"
  | "classList.adminSubtitle"
  | "classList.teacherSubtitle"
  | "classList.new"
  | "classList.searchPlaceholder"
  | "classList.empty"
  | "classList.noDescription"
  | "examList.failed"
  | "examList.title"
  | "examList.subtitle"
  | "examList.searchPlaceholder"
  | "examList.empty"
  | "teacherStudents.failed"
  | "teacherStudents.title"
  | "teacherStudents.loadingClasses"
  | "teacherStudents.summary"
  | "teacherStudents.searchPlaceholder"
  | "teacherStudents.empty"
  | "teacherStudents.joined"
  | "teacherStudents.classCount"
  | "adminOverview.failed"
  | "adminOverview.loading"
  | "adminOverview.title"
  | "adminOverview.subtitle"
  | "adminOverview.assignments"
  | "adminOverview.assignedStudents"
  | "adminOverview.averageScore"
  | "adminOverview.scoreDistribution"
  | "adminDashboard.failed"
  | "adminDashboard.validation"
  | "adminDashboard.createFailed"
  | "adminDashboard.title"
  | "adminDashboard.subtitle"
  | "adminDashboard.totalUsers"
  | "adminDashboard.totalExams"
  | "adminDashboard.joined"
  | "teacherAnalytics.failed"
  | "teacherAnalytics.title"
  | "teacherAnalytics.subtitle"
  | "teacherAnalytics.info"
  | "studentDashboard.greeting"
  | "studentDashboard.subtitle"
  | "studentDashboard.upcoming"
  | "studentDashboard.upcomingAssignments"
  | "studentDashboard.noUpcomingAssignments"
  | "studentDashboard.recentResults"
  | "studentDashboard.noSubmissions"
  | "studentDashboard.inProgress"
  | "assignmentReport.invalid"
  | "assignmentReport.failed"
  | "assignmentReport.loading"
  | "assignmentReport.class"
  | "assignmentReport.totalStudents"
  | "assignmentReport.notSubmitted"
  | "assignmentReport.averageScore"
  | "assignmentReport.scoreDistribution"
  | "login.welcomeBack"
  | "login.subtitle"
  | "login.failed"
  | "login.emailPlaceholder"
  | "login.password"
  | "login.showPassword"
  | "login.hidePassword"
  | "login.rememberMe"
  | "login.backToHome"
  | "login.signingIn"
  | "login.signIn"
  | "login.needAccount"
  | "login.contactAdmin"
  | "myClasses.failed"
  | "myClasses.title"
  | "myClasses.subtitle"
  | "myClasses.empty"
  | "myClasses.emptyHint"
  | "myClasses.noDescription"
  | "createClass.failed"
  | "createClass.title"
  | "createClass.name"
  | "createClass.description"
  | "createClass.create"
  | "createClass.creating"
  | "studentResults.failed"
  | "studentResults.title"
  | "studentResults.subtitle"
  | "studentResults.retry"
  | "studentResults.empty"
  | "studentResults.emptyHint"
  | "studentResults.score"
  | "studentResults.correct"
  | "studentResults.wrong"
  | "studentResults.total"
  | "studentResults.summary"
  | "studentResults.open"
  | "studentResults.view"
  | "myAssignments.failed"
  | "myAssignments.title"
  | "myAssignments.subtitle"
  | "myAssignments.empty"
  | "myAssignments.upcoming"
  | "myAssignments.open"
  | "myAssignments.closed"
  | "myAssignments.enterExam"
  | "adminClasses.failed"
  | "adminClasses.requiredName"
  | "adminClasses.created"
  | "adminClasses.createFailed"
  | "adminClasses.management"
  | "adminClasses.empty"
  | "adminClasses.open"
  | "adminClasses.createTitle"
  | "adminClasses.className"
  | "adminClasses.classNamePlaceholder"
  | "adminClasses.descriptionPlaceholder"
  | "adminClasses.createClass"
  | "adminAssignments.info"
  | "adminExams.info"
  | "createAssignment.failedLoad"
  | "createAssignment.selectExamClass"
  | "createAssignment.setTime"
  | "createAssignment.invalidRange"
  | "createAssignment.invalidDuration"
  | "createAssignment.title"
  | "createAssignment.exam"
  | "createAssignment.selectExam"
  | "createAssignment.class"
  | "createAssignment.selectClass"
  | "createAssignment.startTime"
  | "createAssignment.endTime"
  | "createAssignment.duration"
  | "createAssignment.assign"
  | "submissionResult.invalid"
  | "submissionResult.failed"
  | "submissionResult.loading"
  | "submissionResult.submittedAt"
  | "submissionResult.outOf100"
  | "submissionResult.questions"
  | "submissionResult.question"
  | "submissionResult.yourAnswer"
  | "submissionResult.correctAnswer"
  | "submissionResult.aiExplanation"
  | "submissionResult.back"
  | "examRoom.submitFailed"
  | "examRoom.invalidAssignment"
  | "examRoom.failedStart"
  | "examRoom.loading"
  | "examRoom.alreadySubmitted"
  | "examRoom.unableToStart"
  | "examRoom.alreadySubmittedDesc"
  | "examRoom.backToAssignments"
  | "examRoom.viewResult"
  | "examRoom.fullscreenHint"
  | "examRoom.startTitle"
  | "examRoom.startDescription"
  | "examRoom.enterFullscreen"
  | "examRoom.submitting"
  | "examRoom.submit"
  | "examRoom.back"
  | "examRoom.warningTitle"
  | "examRoom.understand"
  | "examRoom.violationMessage"
  | "examRoom.question"
  | "studentClass.failed"
  | "studentClass.notFound"
  | "studentClass.back"
  | "studentClass.teacher"
  | "joinClassPage.failed"
  | "joinClassPage.title"
  | "joinClassPage.subtitle"
  | "joinClassPage.inviteCode"
  | "joinClassPage.placeholder"
  | "joinClassPage.join"
  | "editExam.failedLoad"
  | "editExam.failedBankLoad"
  | "editExam.failedImport"
  | "editExam.failedSave"
  | "editExam.loading"
  | "editExam.back"
  | "editExam.title"
  | "editExam.save"
  | "editExam.bankTitle"
  | "editExam.bankSubtitle"
  | "editExam.adding"
  | "editExam.addCount"
  | "editExam.searchBank"
  | "editExam.noQuestions"
  | "profile.account"
  | "profile.hello"
  | "profile.welcome"
  | "profile.infoTitle"
  | "profile.infoSubtitle"
  | "profile.displayName"
  | "profile.createdAt"
  | "landing.nav.features"
  | "landing.nav.how"
  | "landing.nav.pricing"
  | "landing.nav.faq"
  | "landing.nav.login"
  | "landing.nav.getStarted"
  | "landing.hero.badge"
  | "landing.hero.titlePrefix"
  | "landing.hero.titleHighlight"
  | "landing.hero.titleSuffix"
  | "landing.hero.subtitle"
  | "landing.hero.ctaPrimary"
  | "landing.hero.ctaSecondary"
  | "landing.hero.noCard"
  | "landing.hero.freePlan"
  | "landing.hero.secure"
  | "landing.hero.weeklySubmissions"
  | "landing.trusted.title"
  | "landing.trusted.logo1"
  | "landing.trusted.logo2"
  | "landing.trusted.logo3"
  | "landing.trusted.logo4"
  | "landing.trusted.logo5"
  | "landing.features.badge"
  | "landing.features.title"
  | "landing.features.subtitle"
  | "landing.features.items.create.title"
  | "landing.features.items.create.desc"
  | "landing.features.items.bank.title"
  | "landing.features.items.bank.desc"
  | "landing.features.items.grading.title"
  | "landing.features.items.grading.desc"
  | "landing.features.items.monitoring.title"
  | "landing.features.items.monitoring.desc"
  | "landing.features.items.integrity.title"
  | "landing.features.items.integrity.desc"
  | "landing.features.items.analytics.title"
  | "landing.features.items.analytics.desc"
  | "landing.how.badge"
  | "landing.how.title"
  | "landing.how.step"
  | "landing.how.items.create.title"
  | "landing.how.items.create.desc"
  | "landing.how.items.share.title"
  | "landing.how.items.share.desc"
  | "landing.how.items.take.title"
  | "landing.how.items.take.desc"
  | "landing.how.items.results.title"
  | "landing.how.items.results.desc"
  | "landing.grading.badge"
  | "landing.grading.title"
  | "landing.grading.titleHighlight"
  | "landing.grading.subtitle"
  | "landing.grading.header"
  | "landing.grading.gradedIn"
  | "landing.grading.performance"
  | "landing.grading.correctCount"
  | "landing.grading.sample1"
  | "landing.grading.sample2"
  | "landing.grading.sample3"
  | "landing.grading.sample4"
  | "landing.grading.sample5"
  | "landing.grading.point1"
  | "landing.grading.point2"
  | "landing.grading.point3"
  | "landing.grading.point4"
  | "landing.grading.cta"
  | "landing.analytics.badge"
  | "landing.analytics.title"
  | "landing.analytics.titleHighlight"
  | "landing.analytics.subtitle"
  | "landing.analytics.header"
  | "landing.analytics.average"
  | "landing.analytics.item1.title"
  | "landing.analytics.item1.desc"
  | "landing.analytics.item2.title"
  | "landing.analytics.item2.desc"
  | "landing.analytics.item3.title"
  | "landing.analytics.item3.desc"
  | "landing.analytics.avgScore"
  | "landing.analytics.passRate"
  | "landing.analytics.students"
  | "landing.analytics.exams"
  | "landing.analytics.submissions"
  | "landing.integrity.badge"
  | "landing.integrity.title"
  | "landing.integrity.titleHighlight"
  | "landing.integrity.subtitle"
  | "landing.integrity.header"
  | "landing.integrity.studentsActive"
  | "landing.integrity.complete"
  | "landing.integrity.clean"
  | "landing.integrity.warnings"
  | "landing.integrity.flagged"
  | "landing.integrity.item1.title"
  | "landing.integrity.item1.desc"
  | "landing.integrity.item2.title"
  | "landing.integrity.item2.desc"
  | "landing.integrity.item3.title"
  | "landing.integrity.item3.desc"
  | "landing.pricing.badge"
  | "landing.pricing.title"
  | "landing.pricing.subtitle"
  | "landing.pricing.popular"
  | "landing.pricing.shared.perMonth"
  | "landing.pricing.free.name"
  | "landing.pricing.free.period"
  | "landing.pricing.free.desc"
  | "landing.pricing.free.feature1"
  | "landing.pricing.free.feature2"
  | "landing.pricing.free.feature3"
  | "landing.pricing.free.feature4"
  | "landing.pricing.free.feature5"
  | "landing.pricing.free.cta"
  | "landing.pricing.pro.name"
  | "landing.pricing.pro.desc"
  | "landing.pricing.pro.feature1"
  | "landing.pricing.pro.feature2"
  | "landing.pricing.pro.feature3"
  | "landing.pricing.pro.feature4"
  | "landing.pricing.pro.feature5"
  | "landing.pricing.pro.feature6"
  | "landing.pricing.pro.cta"
  | "landing.pricing.school.name"
  | "landing.pricing.school.desc"
  | "landing.pricing.school.feature1"
  | "landing.pricing.school.feature2"
  | "landing.pricing.school.feature3"
  | "landing.pricing.school.feature4"
  | "landing.pricing.school.feature5"
  | "landing.pricing.school.feature6"
  | "landing.pricing.school.cta"
  | "landing.customization.badge"
  | "landing.customization.title"
  | "landing.customization.subtitle"
  | "landing.customization.theme"
  | "landing.customization.preferences"
  | "landing.customization.pref1"
  | "landing.customization.pref2"
  | "landing.customization.pref3"
  | "landing.customization.item1.title"
  | "landing.customization.item1.desc"
  | "landing.customization.item2.title"
  | "landing.customization.item2.desc"
  | "landing.customization.item3.title"
  | "landing.customization.item3.desc"
  | "landing.testimonials.badge"
  | "landing.testimonials.title"
  | "landing.testimonials.items.1.quote"
  | "landing.testimonials.items.1.role"
  | "landing.testimonials.items.2.quote"
  | "landing.testimonials.items.2.role"
  | "landing.testimonials.items.3.quote"
  | "landing.testimonials.items.3.role"
  | "landing.faq.badge"
  | "landing.faq.title"
  | "landing.faq.items.1.q"
  | "landing.faq.items.1.a"
  | "landing.faq.items.2.q"
  | "landing.faq.items.2.a"
  | "landing.faq.items.3.q"
  | "landing.faq.items.3.a"
  | "landing.faq.items.4.q"
  | "landing.faq.items.4.a"
  | "landing.faq.items.5.q"
  | "landing.faq.items.5.a"
  | "landing.faq.items.6.q"
  | "landing.faq.items.6.a"
  | "landing.cta.title"
  | "landing.cta.subtitle"
  | "landing.cta.button"
  | "landing.footer.tagline"
  | "landing.footer.product"
  | "landing.footer.resources"
  | "landing.footer.company"
  | "landing.footer.legal"
  | "landing.footer.link.features"
  | "landing.footer.link.pricing"
  | "landing.footer.link.integrations"
  | "landing.footer.link.changelog"
  | "landing.footer.link.documentation"
  | "landing.footer.link.blog"
  | "landing.footer.link.tutorials"
  | "landing.footer.link.api"
  | "landing.footer.link.about"
  | "landing.footer.link.careers"
  | "landing.footer.link.contact"
  | "landing.footer.link.press"
  | "landing.footer.link.terms"
  | "landing.footer.link.privacy"
  | "landing.footer.link.security"
  | "landing.footer.link.gdpr"
  | "landing.footer.link.support"
  | "landing.footer.copyright"
  | "joinClass.title"
  | "joinClass.description"
  | "joinClass.helper"
  | "joinClass.emptyCode"
  | "joinClass.success"
  | "joinClass.failed"
  | "joinClass.joining"
  | "joinClass.join"
  | "scoreChart.empty"
  | "settings.title"
  | "settings.subtitle"
  | "settings.tab.profile"
  | "settings.tab.notifications"
  | "settings.tab.security"
  | "settings.tab.appearance"
  | "settings.tab.language"
  | "settings.appearance.theme.light"
  | "settings.appearance.theme.dark"
  | "settings.appearance.theme.system"
  | "settings.panel.profile"
  | "settings.panel.notifications"
  | "settings.panel.security"
  | "settings.panel.appearance"
  | "settings.panel.language"
  | "settings.language.title"
  | "settings.language.timezone"
  | "settings.theme.light"
  | "settings.theme.dark"
  | "settings.theme.system"
  | "settings.theme.title"
  | "settings.themeColor.title"
  | "settings.layoutDensity.title"
  | "settings.layoutDensity.comfortable"
  | "settings.layoutDensity.comfortable.desc"
  | "settings.layoutDensity.compact"
  | "settings.layoutDensity.compact.desc"
  | "settings.sidebar.expanded"
  | "settings.sidebar.collapsed"
  | "settings.sidebar.auto"
  | "settings.sidebar.title"
  | "settings.examSubmissions"
  | "settings.examSubmissionsDesc"
  | "settings.newStudent"
  | "settings.newStudentDesc"
  | "settings.antiCheatAlerts"
  | "settings.antiCheatAlertsDesc"
  | "settings.weeklyReports"
  | "settings.weeklyReportsDesc"
  | "settings.systemUpdates"
  | "settings.systemUpdatesDesc";
const dict: Record<LanguageCode, Record<I18nKey, string>> = {
  en: {
    "app.brand": "EduFlow",
    "role.admin": "Admin",
    "role.teacher": "Teacher",
    "role.student": "Student",
    "nav.dashboard": "Dashboard",
    "nav.users": "Users",
    "nav.analytics": "Analytics",
    "nav.exams": "Exams",
    "nav.questionBank": "Question Bank",
    "nav.classes": "Classes",
    "nav.assignments": "Assignments",
    "nav.students": "Students",
    "nav.myClasses": "My Classes",
    "nav.myResults": "My Results",
    "nav.settings": "Settings",
    "nav.antiCheating": "Anti-cheating",
    "nav.examInProgress": "Exam in progress",
    "common.all": "All",
    "common.searchPlaceholderTeacher": "Search exams, students, classes...",
    "common.searchPlaceholderAdmin": "Search exams, students, classes...",
    "common.searchPlaceholderStudent": "Search exams, classes...",
    "common.createExam": "Create Exam",
    "common.signOut": "Sign out",
    "common.save": "Save",
    "common.saving": "Saving...",
    "common.cancel": "Cancel",
    "common.refresh": "Refresh",
    "common.loading": "Loading...",
    "common.viewAll": "View all",
    "common.add": "Add",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.remove": "Remove",
    "common.status.active": "Active",
    "common.status.inactive": "Inactive",
    "common.status.draft": "Draft",
    "common.status.published": "Published",
    "common.roleLabel": "Role",
    "common.name": "Name",
    "common.email": "Email",
    "common.role": "Role",
    "common.user": "User",
    "common.actions": "Actions",
    "common.type": "Type",
    "common.status": "Status",
    "common.searchByNameOrEmail": "Search by name or email...",
    "common.avatarAlt": "Avatar",
    "common.notifications": "Notifications",
    "common.pagination": "Pagination",
    "common.pagination.previous": "Previous",
    "common.pagination.next": "Next",
    "common.pagination.morePages": "More pages",
    "common.pagination.goToPreviousPage": "Go to previous page",
    "common.pagination.goToNextPage": "Go to next page",
    "common.close": "Close",
    "common.more": "More",
    "common.breadcrumb": "breadcrumb",
    "common.sidebar.toggle": "Toggle sidebar",
    "router.preparingWorkspace": "Preparing your workspace",
    "router.loadingResources": "Azota is loading resources...",
    "router.loadingSession": "Loading session...",
    "router.loadingLandingPage": "Loading landing page...",
    "router.permissionDenied": "You do not have permission to view this page.",
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account and preferences.",
    "settings.tab.profile": "Profile",
    "settings.tab.notifications": "Notifications",
    "settings.tab.security": "Security",
    "settings.tab.appearance": "Appearance",
    "settings.tab.language": "Language",
    "settings.panel.profile": "Profile Information",
    "settings.panel.notifications": "Notification Preferences",
    "settings.panel.security": "Security Settings",
    "settings.panel.appearance": "Choose your preferred theme",
    "settings.panel.language": "Language & Region",
    "settings.language.title": "Language",
    "settings.language.timezone": "Timezone",
    "settings.profile.fullName": "Full Name",
    "settings.profile.email": "Email",
    "settings.profile.school": "School",
    "settings.profile.schoolPlaceholder": "e.g. Ha Noi High School",
    "settings.profile.subject": "Subject",
    "settings.profile.subjectPlaceholder": "e.g. Mathematics",
    "settings.profile.changePhoto": "Change Photo",
    "settings.profile.saveSuccess": "Saved changes (local preferences).",
    "settings.profile.avatarUpdated": "Avatar updated.",
    "settings.profile.uploadFailed": "Upload failed",
    "settings.security.currentPassword": "Current Password",
    "settings.security.newPassword": "New Password",
    "settings.security.confirmPassword": "Confirm Password",
    "settings.security.minimumLength": "Minimum 6 characters",
    "settings.security.updatePassword": "Update Password",
    "settings.security.minLengthError": "New password must be at least 6 characters.",
    "settings.security.confirmMismatch": "Password confirmation does not match.",
    "settings.security.updated": "Password updated (saved locally for MVP UI).",
    "settings.security.mvpNote": "MVP note: This tab is UI-ready. If you want real password update, we'll add a backend endpoint later.",
    "settings.language.english": "English",
    "settings.language.vietnamese": "Vietnamese",
    "settings.language.timezone.hcm": "Asia/Ho_Chi_Minh (UTC+7)",
    "settings.language.timezone.tokyo": "Asia/Tokyo (UTC+9)",
    "settings.language.timezone.newYork": "America/New_York (UTC-5)",
    "settings.language.saved": "Language settings saved (local preferences).",
    "settings.button.saveChanges": "Save Changes",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.theme.system": "System",
    "settings.theme.title": "Theme",
    "settings.themeColor.title": "Theme Color",
    "settings.layoutDensity.title": "Layout Density",
    "settings.layoutDensity.comfortable": "Comfortable",
    "settings.layoutDensity.comfortable.desc": "More spacing, larger elements",
    "settings.layoutDensity.compact": "Compact",
    "settings.layoutDensity.compact.desc": "Tighter spacing, more content",
    "settings.sidebar.expanded": "Expanded",
    "settings.sidebar.collapsed": "Collapsed",
    "settings.sidebar.auto": "Auto",
    "settings.sidebar.title": "Sidebar Mode",
    "settings.examSubmissions": "Exam submissions",
    "settings.examSubmissionsDesc": "Get notified when students submit exams",
    "settings.newStudent": "New student registration",
    "settings.newStudentDesc": "Alert when new students join your class",
    "settings.antiCheatAlerts": "Anti-cheating alerts",
    "settings.antiCheatAlertsDesc": "Real-time alerts for suspicious activity",
    "settings.weeklyReports": "Weekly reports",
    "settings.weeklyReportsDesc": "Weekly reports for your class",
    "settings.systemUpdates": "System updates",
    "settings.systemUpdatesDesc": "Get notified when new system updates are available",
    "adminUsers.loadFailed": "Failed to load users",
    "adminUsers.createSuccess": "User created successfully.",
    "adminUsers.createFailed": "Failed to create user",
    "adminUsers.updateStatusSuccess": "Updated user status successfully.",
    "adminUsers.updateStatusFailed": "Failed to update user status.",
    "adminUsers.updateSuccess": "User updated successfully.",
    "adminUsers.updateFailed": "Failed to update user.",
    "adminUsers.passwordMinLength": "Password must be at least 6 characters.",
    "adminUsers.passwordMismatch": "Password confirmation does not match.",
    "adminUsers.passwordResetSuccess": "Password reset successfully.",
    "adminUsers.passwordResetFailed": "Failed to reset password.",
    "adminUsers.deleteSuccess": "User deleted (deactivated) successfully.",
    "adminUsers.deleteFailed": "Failed to delete user.",
    "adminUsers.loading": "Loading users...",
    "adminUsers.title": "Users",
    "adminUsers.subtitle": "Manage accounts, roles and access.",
    "adminUsers.createUser": "Create User",
    "adminUsers.managementTitle": "User Management",
    "adminUsers.empty": "No users found.",
    "adminUsers.searchPlaceholder": "Search by name or email...",
    "adminUsers.totalUsers": "Total users",
    "adminUsers.deactivateConfirm": "Are you sure you want to deactivate {{name}} ({{email}})?",
    "adminUsers.activateConfirm": "Are you sure you want to activate {{name}} ({{email}})?",
    "adminUsers.deleteConfirm": "This will deactivate {{name}} ({{email}}). The user will not be able to login.",
    "adminUsers.createDialogTitle": "Create New User",
    "adminUsers.fullNamePlaceholder": "e.g. John Doe",
    "adminUsers.passwordHint": "Min 6 characters",
    "adminUsers.createAccount": "Create Account",
    "adminUsers.creating": "Creating...",
    "adminUsers.editDialogTitle": "Edit user",
    "adminUsers.resetPassword": "Reset password",
    "adminUsers.deactivate": "Deactivate",
    "adminUsers.activate": "Activate",
    "adminUsers.passwordDialogTitle": "Reset password",
    "adminUsers.passwordDialogDescription": "Set a new password for {{email}}.",
    "adminUsers.newPassword": "New password",
    "adminUsers.confirmNewPassword": "Confirm new password",
    "questionBank.loadFailed": "Failed to load question bank",
    "questionBank.loadQuestionFailed": "Failed to load question",
    "questionBank.requiredQuestionText": "Question text is required.",
    "questionBank.requiredOptions": "At least 2 answer options are required.",
    "questionBank.singleChoiceValidation": "Single choice must have exactly 1 correct option.",
    "questionBank.multipleChoiceValidation": "Multiple choice must have at least 1 correct option.",
    "questionBank.saveFailed": "Failed to save",
    "questionBank.deleteFailed": "Failed to delete",
    "questionBank.title": "Question Bank",
    "questionBank.totalQuestions": "{{count}} questions total",
    "questionBank.newQuestion": "New Question",
    "questionBank.searchPlaceholder": "Search questions...",
    "questionBank.empty": "No questions found.",
    "questionBank.question": "Question",
    "questionBank.type": "Type",
    "questionBank.singleChoice": "Single",
    "questionBank.multipleChoice": "Multiple",
    "questionBank.difficulty": "Difficulty",
    "questionBank.tags": "Tags",
    "questionBank.single": "Single",
    "questionBank.multiple": "Multiple",
    "questionBank.deleteConfirm": "Delete question?\n\nThis will permanently remove the question from your bank.",
    "questionBank.editor.newTitle": "New question",
    "questionBank.editor.editTitle": "Edit question #{{id}}",
    "questionBank.editor.description": "Changes are saved to your personal question bank.",
    "questionBank.editor.questionText": "Question text *",
    "questionBank.editor.explanation": "Explanation (optional)",
    "questionBank.editor.answerOptions": "Answer options",
    "questionBank.editor.addOption": "Add option",
    "questionBank.editor.removeOption": "Remove",
    "questionBank.editor.optionPlaceholder": "Option {{number}}",
    "questionBank.editor.type": "Type",
    "questionBank.editor.singleChoice": "Single choice",
    "questionBank.editor.multipleChoice": "Multiple choice",
    "questionBank.difficulty.easy": "Easy",
    "questionBank.difficulty.medium": "Medium",
    "questionBank.difficulty.hard": "Hard",
    "questionBank.editor.status": "Status",
    "questionBank.editor.tags": "Tags (comma separated)",
    "questionBank.editor.tagsPlaceholder": "e.g. algebra, grade 9",
    "examEditor.step.basicInfo": "Basic Info",
    "examEditor.step.questions": "Questions",
    "examEditor.step.review": "Review",
    "examEditor.title": "Exam Title *",
    "examEditor.titlePlaceholder": "e.g. Math Final Exam",
    "examEditor.description": "Description",
    "examEditor.descriptionPlaceholder": "Brief description...",
    "examEditor.questionCount": "{{count}} question(s)",
    "examEditor.addFromBank": "Add from bank",
    "examEditor.addQuestion": "Add Question",
    "examEditor.empty": "No questions yet. Click \"Add Question\" to start.",
    "examEditor.questionTitle": "Question {{number}}",
    "examEditor.questionTextPlaceholder": "Question text...",
    "examEditor.questionAria": "Question {{number}} text",
    "examEditor.answerOptions": "Answer Options",
    "examEditor.markCorrect": "mark correct",
    "examEditor.optionPlaceholder": "Option {{number}}",
    "examEditor.removeOption": "Remove",
    "examEditor.addOption": "Add option",
    "examEditor.readyToSave": "Ready to Save",
    "examEditor.reviewMessage": "Review your exam details before saving.",
    "examEditor.reviewTitle": "Title",
    "examEditor.publishImmediately": "Publish immediately (not draft)",
    "examEditor.previous": "Previous",
    "examEditor.next": "Next",
    "classDetail.loadFailed": "Failed",
    "classDetail.notFound": "Not found",
    "classDetail.backToClasses": "Back to classes",
    "classDetail.membersCount": "Members: {{count}}",
    "classDetail.primaryTeacher": "Primary teacher:",
    "classDetail.classTeachers": "Class teachers",
    "classDetail.classTeachersDescription": "Manage the list of teachers (role=teacher) assigned to this class.",
    "classDetail.addTeacher": "Add teacher",
    "classDetail.noTeachers": "No teachers assigned to this class.",
    "classDetail.primary": "Primary",
    "classDetail.removeTeacherConfirm": "Remove {{name}} ({{email}}) from this class?",
    "classDetail.reassignPrimaryTeacherFirst": "Reassign primary teacher first",
    "classDetail.removeFromClass": "Remove from class",
    "classDetail.inviteCode": "Invite code:",
    "classDetail.copied": "Copied!",
    "classDetail.copyCode": "Copy code",
    "classDetail.copyInviteLink": "Copy invite link",
    "classDetail.members": "Members",
    "classDetail.totalMembers": "Total: {{count}}",
    "classDetail.noMembers": "No members yet.",
    "classDetail.removeMemberConfirm": "Remove {{name}} from this class?",
    "classDetail.thisUser": "this user",
    "classDetail.addTeacherDialogTitle": "Add teacher to class",
    "classDetail.addTeacherDialogDescription": "Select one or more teachers (role=teacher). The system will automatically skip teachers already in the class.",
    "classDetail.alreadyAdded": "Added",
    "classDetail.addTeacherSuccess": "Added teacher(s) successfully.",
    "classDetail.addTeacherFailed": "Failed to add teachers.",
    "classDetail.removeTeacherSuccess": "Removed teacher successfully.",
    "classDetail.removeTeacherFailed": "Failed to remove teacher.",
    "teacherDashboard.title": "Dashboard",
    "teacherDashboard.welcome": "Welcome back, {{name}}. Here's your overview.",
    "teacherDashboard.myStudents": "My Students",
    "teacherDashboard.myExams": "My Exams",
    "teacherDashboard.submissions": "Submissions",
    "teacherDashboard.avgScore": "Avg Score",
    "teacherDashboard.calculatingStats": "Calculating stats...",
    "teacherDashboard.recentExams": "Recent Exams",
    "teacherDashboard.recentExamsDescription": "Quick access to your latest work.",
    "teacherDashboard.noExams": "No exams yet. Create your first exam to get started.",
    "teacherDashboard.quickLinks": "Quick Links",
    "teacherDashboard.quickLinksDescription": "Common teacher actions.",
    "teacherDashboard.newAssignment": "New Assignment",
    "teacherDashboard.newClass": "New Class",
    "teacherDashboard.classes": "Classes",
    "teacherDashboard.assignments": "Assignments",
    "teacherDashboard.students": "Students",
    "antiCheat.loadFailed": "Failed to load monitor",
    "antiCheat.title": "Anti-Cheating Monitor",
    "antiCheat.subtitle": "Event-based monitoring powered by anti-cheat logs.",
    "antiCheat.totalStudents": "Total Students",
    "antiCheat.activeNow": "Active Now",
    "antiCheat.suspicious": "Suspicious",
    "antiCheat.submitted": "Submitted",
    "antiCheat.searchPlaceholder": "Search students...",
    "antiCheat.allStudents": "All Students",
    "antiCheat.suspiciousOnly": "Suspicious Only",
    "antiCheat.noStudents": "No students found.",
    "antiCheat.student": "Student",
    "antiCheat.examClass": "Exam / Class",
    "antiCheat.events": "Events",
    "antiCheat.lastEvent": "Last event",
    "assignmentList.failed": "Failed",
    "assignmentList.title": "Assignments",
    "assignmentList.subtitle": "Schedule exams to classes with time windows.",
    "assignmentList.new": "New Assignment",
    "assignmentList.searchPlaceholder": "Search assignments...",
    "assignmentList.empty": "No assignments yet.",
    "assignmentList.viewReport": "View report",
    "classList.failed": "Failed",
    "classList.title": "Classes",
    "classList.adminSubtitle": "Manage all classes in the system.",
    "classList.teacherSubtitle": "Manage classes, members, and teacher assignments.",
    "classList.new": "New Class",
    "classList.searchPlaceholder": "Search classes...",
    "classList.empty": "No classes found.",
    "classList.noDescription": "No description",
    "examList.failed": "Failed",
    "examList.title": "Exams",
    "examList.subtitle": "Manage and create exams for your classes.",
    "examList.searchPlaceholder": "Search exams...",
    "examList.empty": "No exams found.",
    "teacherStudents.failed": "Failed to load classes",
    "teacherStudents.title": "Students",
    "teacherStudents.loadingClasses": "Loading classes...",
    "teacherStudents.summary": "{{memberships}} student memberships across classes - {{students}} unique students.",
    "teacherStudents.searchPlaceholder": "Search students...",
    "teacherStudents.empty": "No students found.",
    "teacherStudents.joined": "Joined",
    "teacherStudents.classCount": "{{count}} class",
    "adminOverview.failed": "Failed to load overview",
    "adminOverview.loading": "Loading overview...",
    "adminOverview.title": "System overview",
    "adminOverview.subtitle": "High-level statistics for all assignments in the system.",
    "adminOverview.assignments": "Assignments",
    "adminOverview.assignedStudents": "Assigned students",
    "adminOverview.averageScore": "Average score",
    "adminOverview.scoreDistribution": "Score distribution",
    "adminDashboard.failed": "Failed to load users",
    "adminDashboard.validation": "Please enter full name, email and a password (min 6 chars).",
    "adminDashboard.createFailed": "Failed to create user.",
    "adminDashboard.title": "Admin Dashboard",
    "adminDashboard.subtitle": "Platform overview and user management.",
    "adminDashboard.totalUsers": "Total Users",
    "adminDashboard.totalExams": "Total Exams",
    "adminDashboard.joined": "Joined",
    "teacherAnalytics.failed": "Failed to load analytics",
    "teacherAnalytics.title": "Analytics",
    "teacherAnalytics.subtitle": "Performance overview and insights.",
    "teacherAnalytics.info": "This tab currently uses existing endpoints (classes + assignments reports). A dedicated analytics backend can be added later for charts, trends, and time-series.",
    "studentDashboard.greeting": "Hello, {{name}}",
    "studentDashboard.subtitle": "Here's your learning overview.",
    "studentDashboard.upcoming": "Upcoming",
    "studentDashboard.upcomingAssignments": "Upcoming Assignments",
    "studentDashboard.noUpcomingAssignments": "No upcoming assignments. Check \"Assignments\" to see all assigned exams.",
    "studentDashboard.recentResults": "Recent Results",
    "studentDashboard.noSubmissions": "No submissions yet.",
    "studentDashboard.inProgress": "In progress",
    "assignmentReport.invalid": "Invalid assignment",
    "assignmentReport.failed": "Failed to load report",
    "assignmentReport.loading": "Loading report...",
    "assignmentReport.class": "Class",
    "assignmentReport.totalStudents": "Total students",
    "assignmentReport.notSubmitted": "Not submitted",
    "assignmentReport.averageScore": "Average score",
    "assignmentReport.scoreDistribution": "Score distribution",
    "login.welcomeBack": "Welcome back",
    "login.subtitle": "Sign in to your Azota account",
    "login.failed": "Login failed",
    "login.emailPlaceholder": "you@school.edu",
    "login.password": "Password",
    "login.showPassword": "Show password",
    "login.hidePassword": "Hide password",
    "login.rememberMe": "Remember me",
    "login.backToHome": "Back to home",
    "login.signingIn": "Signing in...",
    "login.signIn": "Sign In",
    "login.needAccount": "Need an account?",
    "login.contactAdmin": "Contact admin",
    "myClasses.failed": "Failed",
    "myClasses.title": "My Classes",
    "myClasses.subtitle": "View your enrolled classes or join a new one.",
    "myClasses.empty": "You haven't joined any classes yet.",
    "myClasses.emptyHint": "Use an invite code above to join one.",
    "myClasses.noDescription": "No description",
    "createClass.failed": "Failed",
    "createClass.title": "Create class",
    "createClass.name": "Name",
    "createClass.description": "Description (optional)",
    "createClass.create": "Create",
    "createClass.creating": "Creating...",
    "studentResults.failed": "Failed to load results",
    "studentResults.title": "My Results",
    "studentResults.subtitle": "Review your exam submissions and scores.",
    "studentResults.retry": "Retry",
    "studentResults.empty": "No submissions yet.",
    "studentResults.emptyHint": "Your results will appear here after you submit an exam.",
    "studentResults.score": "Score",
    "studentResults.correct": "Correct",
    "studentResults.wrong": "Wrong",
    "studentResults.total": "Total",
    "studentResults.summary": "Summary",
    "studentResults.open": "Open",
    "studentResults.view": "View",
    "myAssignments.failed": "Failed",
    "myAssignments.title": "Assigned exams",
    "myAssignments.subtitle": "Exams that have been assigned to your classes.",
    "myAssignments.empty": "No assigned exams. Join a class to see assignments.",
    "myAssignments.upcoming": "Upcoming",
    "myAssignments.open": "Open",
    "myAssignments.closed": "Closed",
    "myAssignments.enterExam": "Enter exam",
    "adminClasses.failed": "Failed to load classes",
    "adminClasses.requiredName": "Class name is required.",
    "adminClasses.created": "Class created successfully.",
    "adminClasses.createFailed": "Failed to create class.",
    "adminClasses.management": "Class Management",
    "adminClasses.empty": "No classes yet.",
    "adminClasses.open": "Open",
    "adminClasses.createTitle": "Create New Class",
    "adminClasses.className": "Class Name",
    "adminClasses.classNamePlaceholder": "e.g. Class 10A",
    "adminClasses.descriptionPlaceholder": "Optional description...",
    "adminClasses.createClass": "Create Class",
    "adminAssignments.info": "This page is UI-ready. Assignment flows are available in teacher dashboard for this MVP.",
    "adminExams.info": "This page is UI-ready. Exam management is currently available for teachers in this MVP.",
    "createAssignment.failedLoad": "Failed to load",
    "createAssignment.selectExamClass": "Please select exam and class",
    "createAssignment.setTime": "Please set start and end time",
    "createAssignment.invalidRange": "Start time must be before end time",
    "createAssignment.invalidDuration": "Duration must be between 1 and 600 minutes",
    "createAssignment.title": "Assign exam to class",
    "createAssignment.exam": "Exam",
    "createAssignment.selectExam": "-- Select exam --",
    "createAssignment.class": "Class",
    "createAssignment.selectClass": "-- Select class --",
    "createAssignment.startTime": "Start time",
    "createAssignment.endTime": "End time",
    "createAssignment.duration": "Duration (minutes)",
    "createAssignment.assign": "Assign",
    "submissionResult.invalid": "Invalid submission",
    "submissionResult.failed": "Failed to load",
    "submissionResult.loading": "Loading result...",
    "submissionResult.submittedAt": "Submitted at",
    "submissionResult.outOf100": "0-100",
    "submissionResult.questions": "questions",
    "submissionResult.question": "Question {{number}}",
    "submissionResult.yourAnswer": "Your answer",
    "submissionResult.correctAnswer": "Correct answer",
    "submissionResult.aiExplanation": "AI explanation",
    "submissionResult.back": "Back",
    "examRoom.submitFailed": "Submit failed",
    "examRoom.invalidAssignment": "Invalid assignment",
    "examRoom.failedStart": "Failed to start",
    "examRoom.loading": "Loading exam...",
    "examRoom.alreadySubmitted": "Already submitted",
    "examRoom.unableToStart": "Unable to start exam",
    "examRoom.alreadySubmittedDesc": "You have already submitted this exam. You can go back or view your result.",
    "examRoom.backToAssignments": "Back to assignments",
    "examRoom.viewResult": "View result",
    "examRoom.fullscreenHint": "Please stay in fullscreen and do not switch tabs while taking the exam.",
    "examRoom.startTitle": "Start exam",
    "examRoom.startDescription": "The system will enable fullscreen mode. If you exit fullscreen or switch tabs 3 times, the exam will be submitted automatically.",
    "examRoom.enterFullscreen": "Enter fullscreen and start",
    "examRoom.submitting": "Submitting...",
    "examRoom.submit": "Submit",
    "examRoom.back": "Back",
    "examRoom.warningTitle": "Anti-cheating warning",
    "examRoom.understand": "I understand",
    "examRoom.violationMessage": "You exited fullscreen or switched tabs. If this happens 3 times, the exam will be submitted automatically.",
    "examRoom.question": "Question {{number}}",
    "studentClass.failed": "Failed",
    "studentClass.notFound": "Not found",
    "studentClass.back": "Back to my classes",
    "studentClass.teacher": "Teacher",
    "joinClassPage.failed": "Failed to join",
    "joinClassPage.title": "Join a class",
    "joinClassPage.subtitle": "Enter the invite code from your teacher or use an invite link.",
    "joinClassPage.inviteCode": "Invite code",
    "joinClassPage.placeholder": "e.g. abc12XYZ",
    "joinClassPage.join": "Join class",
    "editExam.failedLoad": "Failed to load",
    "editExam.failedBankLoad": "Failed to load question bank",
    "editExam.failedImport": "Failed to import questions",
    "editExam.failedSave": "Failed to save",
    "editExam.loading": "Loading...",
    "editExam.back": "Back to exams",
    "editExam.title": "Edit exam",
    "editExam.save": "Save exam",
    "editExam.bankTitle": "Add from Question Bank",
    "editExam.bankSubtitle": "Select questions to copy into this exam (snapshot).",
    "editExam.adding": "Adding...",
    "editExam.addCount": "Add ({{count}})",
    "editExam.searchBank": "Search bank questions...",
    "editExam.noQuestions": "No questions found.",
    "profile.account": "Account profile",
    "profile.hello": "Hello, {{name}}!",
    "profile.welcome": "Welcome back to Azota Basic.",
    "profile.infoTitle": "Profile information",
    "profile.infoSubtitle": "Information is loaded from the current account in the system.",
    "profile.displayName": "Display name",
    "profile.createdAt": "Account created at",
    "landing.nav.features": "Features",
    "landing.nav.how": "How it works",
    "landing.nav.pricing": "Pricing",
    "landing.nav.faq": "FAQ",
    "landing.nav.login": "Log in",
    "landing.nav.getStarted": "Get started",
    "landing.hero.badge": "Trusted by 10,000+ educators worldwide",
    "landing.hero.titlePrefix": "Create, manage, and",
    "landing.hero.titleHighlight": "grade exams",
    "landing.hero.titleSuffix": "online effortlessly",
    "landing.hero.subtitle": "An all-in-one platform for teachers to create tests, monitor exams, and analyze student performance — saving hours every week.",
    "landing.hero.ctaPrimary": "Start for free",
    "landing.hero.ctaSecondary": "Watch demo",
    "landing.hero.noCard": "No credit card",
    "landing.hero.freePlan": "Free forever plan",
    "landing.hero.secure": "SOC 2 compliant",
    "landing.hero.weeklySubmissions": "Weekly Submissions",
    "landing.trusted.title": "Trusted by leading educational institutions",
    "landing.trusted.logo1": "University of Science",
    "landing.trusted.logo2": "Tech Academy",
    "landing.trusted.logo3": "Global Institute",
    "landing.trusted.logo4": "Metro School",
    "landing.trusted.logo5": "EduPrime",
    "landing.features.badge": "Features",
    "landing.features.title": "Everything you need to run exams online",
    "landing.features.subtitle": "From exam creation to analytics — all the tools teachers need, in one platform.",
    "landing.features.items.create.title": "Create exams in minutes",
    "landing.features.items.create.desc": "Intuitive drag-and-drop exam builder with multiple question types, auto-save, and templates. Import questions directly from PDF or Word documents.",
    "landing.features.items.bank.title": "Question bank management",
    "landing.features.items.bank.desc": "Organize thousands of questions by subject, difficulty, and tags. Reuse across exams effortlessly.",
    "landing.features.items.grading.title": "Automatic grading",
    "landing.features.items.grading.desc": "Exams are graded the moment students submit — multiple choice, fill-in-the-blank, and matching questions scored instantly with zero manual effort.",
    "landing.features.items.monitoring.title": "Real-time monitoring",
    "landing.features.items.monitoring.desc": "Watch students take exams live. See progress, time remaining, and submission status in real time.",
    "landing.features.items.integrity.title": "Anti-cheating technology",
    "landing.features.items.integrity.desc": "Multi-layered exam integrity: tab switch detection flags wandering students, fullscreen mode locks the browser, and optional webcam monitoring ensures identity verification.",
    "landing.features.items.analytics.title": "Advanced analytics",
    "landing.features.items.analytics.desc": "Visualize score distributions, compare class performance side-by-side, and drill into per-question difficulty — all in interactive, exportable dashboards.",
    "landing.how.badge": "How it works",
    "landing.how.title": "Get started in 4 simple steps",
    "landing.how.step": "Step",
    "landing.how.items.create.title": "Create your exam",
    "landing.how.items.create.desc": "Use our intuitive builder to craft exams with multiple question types.",
    "landing.how.items.share.title": "Share with students",
    "landing.how.items.share.desc": "Send an exam link or code. Students join with one click.",
    "landing.how.items.take.title": "Students take the exam",
    "landing.how.items.take.desc": "Secure, timed testing with anti-cheating features.",
    "landing.how.items.results.title": "Instant results",
    "landing.how.items.results.desc": "Students see their score, correct answers, and detailed feedback the second they submit.",
    "landing.grading.badge": "Grading & Results",
    "landing.grading.title": "Auto-grade exams.",
    "landing.grading.titleHighlight": "Deliver results instantly.",
    "landing.grading.subtitle": "No more hours spent grading papers. The platform scores every submission the moment it's turned in — students see their results, correct answers, and performance breakdown immediately.",
    "landing.grading.header": "Exam Results",
    "landing.grading.gradedIn": "Graded in 0.3s",
    "landing.grading.performance": "Excellent Performance!",
    "landing.grading.correctCount": "23 of 25 questions correct",
    "landing.grading.sample1": "Q1. What is photosynthesis?",
    "landing.grading.sample2": "Q2. Newton's second law states...",
    "landing.grading.sample3": "Q3. The capital of France is...",
    "landing.grading.sample4": "Q4. Which element has atomic number 6?",
    "landing.grading.sample5": "Q5. Solve: 2x + 5 = 15",
    "landing.grading.point1": "Scores calculated in under a second",
    "landing.grading.point2": "Students see results immediately after submitting",
    "landing.grading.point3": "Question-by-question breakdown with correct answers",
    "landing.grading.point4": "Teachers get class-wide score summaries automatically",
    "landing.grading.cta": "Try automatic grading",
    "landing.analytics.badge": "Analytics & Insights",
    "landing.analytics.title": "Data-driven teaching,",
    "landing.analytics.titleHighlight": "effortless insights",
    "landing.analytics.subtitle": "Every exam generates rich analytics automatically. Spot struggling students, identify tricky questions, and track class progress over time — all without spreadsheets.",
    "landing.analytics.header": "Analytics Dashboard",
    "landing.analytics.average": "Avg",
    "landing.analytics.item1.title": "Score distribution",
    "landing.analytics.item1.desc": "See how scores spread across your class with bell-curve visualizations. Instantly identify outliers and adjust grading curves.",
    "landing.analytics.item2.title": "Class performance",
    "landing.analytics.item2.desc": "Compare performance across classes and subjects. Track improvement over time with trend lines and cohort analysis.",
    "landing.analytics.item3.title": "Detailed analytics",
    "landing.analytics.item3.desc": "Drill into per-question difficulty, time-spent analysis, and student-level breakdowns. Export everything as PDF or CSV.",
    "landing.analytics.avgScore": "Avg Score",
    "landing.analytics.passRate": "Pass Rate",
    "landing.analytics.students": "Students",
    "landing.analytics.exams": "Exams",
    "landing.analytics.submissions": "Submissions",
    "landing.integrity.badge": "Exam Integrity",
    "landing.integrity.title": "Keep exams",
    "landing.integrity.titleHighlight": "fair and secure",
    "landing.integrity.subtitle": "Three layers of protection work together to ensure every exam is taken honestly — without disrupting the student experience.",
    "landing.integrity.header": "Live Monitoring",
    "landing.integrity.studentsActive": "28 students active",
    "landing.integrity.complete": "complete",
    "landing.integrity.clean": "Clean",
    "landing.integrity.warnings": "Warnings",
    "landing.integrity.flagged": "Flagged",
    "landing.integrity.item1.title": "Tab switching detection",
    "landing.integrity.item1.desc": "Instantly detects when students navigate away from the exam. Every switch is logged with a timestamp and flagged for teacher review.",
    "landing.integrity.item2.title": "Fullscreen exam mode",
    "landing.integrity.item2.desc": "Locks the browser into fullscreen during the exam. Attempts to exit are recorded and can trigger automatic warnings.",
    "landing.integrity.item3.title": "Webcam monitoring",
    "landing.integrity.item3.desc": "Optional webcam proctoring verifies student identity and flags suspicious behavior like looking away or multiple faces detected.",
    "landing.pricing.badge": "Pricing",
    "landing.pricing.title": "Simple, transparent pricing",
    "landing.pricing.subtitle": "Start free. Upgrade when you need more.",
    "landing.pricing.popular": "Most popular",
    "landing.pricing.shared.perMonth": "/month",
    "landing.pricing.free.name": "Free",
    "landing.pricing.free.period": "forever",
    "landing.pricing.free.desc": "For individual teachers getting started.",
    "landing.pricing.free.feature1": "Up to 30 students",
    "landing.pricing.free.feature2": "5 exams per month",
    "landing.pricing.free.feature3": "Basic question types",
    "landing.pricing.free.feature4": "Auto grading",
    "landing.pricing.free.feature5": "Email support",
    "landing.pricing.free.cta": "Start free",
    "landing.pricing.pro.name": "Pro",
    "landing.pricing.pro.desc": "For teachers who need more power.",
    "landing.pricing.pro.feature1": "Unlimited students",
    "landing.pricing.pro.feature2": "Unlimited exams",
    "landing.pricing.pro.feature3": "All question types",
    "landing.pricing.pro.feature4": "Anti-cheating tools",
    "landing.pricing.pro.feature5": "Advanced analytics",
    "landing.pricing.pro.feature6": "Priority support",
    "landing.pricing.pro.cta": "Start free trial",
    "landing.pricing.school.name": "School",
    "landing.pricing.school.desc": "For schools and training centers.",
    "landing.pricing.school.feature1": "Everything in Pro",
    "landing.pricing.school.feature2": "Unlimited teachers",
    "landing.pricing.school.feature3": "Admin dashboard",
    "landing.pricing.school.feature4": "Custom branding",
    "landing.pricing.school.feature5": "API access",
    "landing.pricing.school.feature6": "Dedicated support",
    "landing.pricing.school.cta": "Contact sales",
    "landing.customization.badge": "Customization",
    "landing.customization.title": "Make it yours — every detail",
    "landing.customization.subtitle": "Language switching, theme preferences, and UI settings that let every user feel at home.",
    "landing.customization.theme": "Theme",
    "landing.customization.preferences": "Preferences",
    "landing.customization.pref1": "Compact sidebar",
    "landing.customization.pref2": "Show exam timer",
    "landing.customization.pref3": "Sound notifications",
    "landing.customization.item1.title": "Language switching",
    "landing.customization.item1.desc": "Seamlessly switch between Vietnamese, English, Japanese, and more. The entire interface adapts instantly — menus, labels, notifications, and exam content.",
    "landing.customization.item2.title": "Theme & appearance",
    "landing.customization.item2.desc": "Choose Light, Dark, or System themes. Each theme is carefully crafted for readability and comfort during long grading or exam sessions.",
    "landing.customization.item3.title": "User UI preferences",
    "landing.customization.item3.desc": "Customize sidebar layout, notification sounds, timer visibility, and display density. Your preferences sync across all devices automatically.",
    "landing.testimonials.badge": "Testimonials",
    "landing.testimonials.title": "Loved by educators everywhere",
    "landing.testimonials.items.1.quote": "This platform cut my exam grading time by 90%. I can now focus on actually teaching instead of paper management.",
    "landing.testimonials.items.1.role": "Mathematics Teacher, Hanoi",
    "landing.testimonials.items.2.quote": "The anti-cheating features give me confidence that exam results are fair. The real-time monitoring is a game changer.",
    "landing.testimonials.items.2.role": "Physics Teacher, HCMC",
    "landing.testimonials.items.3.quote": "We deployed this across 12 departments. The admin dashboard makes managing 200+ teachers seamless.",
    "landing.testimonials.items.3.role": "Director, ABC Training Center",
    "landing.faq.badge": "FAQ",
    "landing.faq.title": "Frequently asked questions",
    "landing.faq.items.1.q": "Is there a free plan?",
    "landing.faq.items.1.a": "Yes! Our free plan lets you create up to 5 exams per month with 30 students. No credit card required.",
    "landing.faq.items.2.q": "Do students need to install anything?",
    "landing.faq.items.2.a": "No. Students access exams through any web browser on desktop, tablet, or mobile. No app download needed.",
    "landing.faq.items.3.q": "How does the anti-cheating system work?",
    "landing.faq.items.3.a": "We use multiple layers: tab switch detection, fullscreen enforcement, webcam monitoring, copy-paste prevention, and AI-powered behavioral analysis.",
    "landing.faq.items.4.q": "Can I import existing questions?",
    "landing.faq.items.4.a": "Yes, you can import questions from Excel, CSV, or Word documents. We also support bulk import with automatic formatting.",
    "landing.faq.items.5.q": "Is my data secure?",
    "landing.faq.items.5.a": "Absolutely. All data is encrypted at rest and in transit. We comply with GDPR and maintain SOC 2 certification.",
    "landing.faq.items.6.q": "Can I customize the exam interface?",
    "landing.faq.items.6.a": "Pro and School plans include custom branding options — add your logo, colors, and custom domain.",
    "landing.cta.title": "Start creating exams today",
    "landing.cta.subtitle": "Join thousands of educators who save hours every week with EduFlow.",
    "landing.cta.button": "Get started free",
    "landing.footer.tagline": "Modern online exam and learning management for educators.",
    "landing.footer.product": "Product",
    "landing.footer.resources": "Resources",
    "landing.footer.company": "Company",
    "landing.footer.legal": "Legal",
    "landing.footer.link.features": "Features",
    "landing.footer.link.pricing": "Pricing",
    "landing.footer.link.integrations": "Integrations",
    "landing.footer.link.changelog": "Changelog",
    "landing.footer.link.documentation": "Documentation",
    "landing.footer.link.blog": "Blog",
    "landing.footer.link.tutorials": "Tutorials",
    "landing.footer.link.api": "API",
    "landing.footer.link.about": "About",
    "landing.footer.link.careers": "Careers",
    "landing.footer.link.contact": "Contact",
    "landing.footer.link.press": "Press",
    "landing.footer.link.terms": "Terms",
    "landing.footer.link.privacy": "Privacy",
    "landing.footer.link.security": "Security",
    "landing.footer.link.gdpr": "GDPR",
    "landing.footer.link.support": "Support",
    "landing.footer.copyright": "© 2026 EduFlow. All rights reserved.",
    "joinClass.title": "Join a Class",
    "joinClass.description": "Enter class invite code...",
    "joinClass.helper": "Use an invite code from your teacher.",
    "joinClass.emptyCode": "Please enter an invite code.",
    "joinClass.success": "Joined class successfully.",
    "joinClass.failed": "Failed to join class.",
    "joinClass.joining": "Joining...",
    "joinClass.join": "Join",
    "scoreChart.empty": "No score data yet.",
    "settings.appearance.theme.light": "Light",
    "settings.appearance.theme.dark": "Dark",
    "settings.appearance.theme.system": "System",
  },
  vi: {
    "app.brand": "EduFlow",
    "role.admin": "Quản trị",
    "role.teacher": "Giáo viên",
    "role.student": "Học sinh",
    "nav.dashboard": "Tổng quan",
    "nav.users": "Người dùng",
    "nav.analytics": "Phân tích",
    "nav.exams": "Đề thi",
    "nav.questionBank": "Ngân hàng câu hỏi",
    "nav.classes": "Lớp học",
    "nav.assignments": "Bài tập",
    "nav.students": "Học sinh",
    "nav.myClasses": "Lớp của tôi",
    "nav.myResults": "Kết quả",
    "nav.settings": "Cài đặt",
    "nav.antiCheating": "Chống gian lận",
    "nav.examInProgress": "Bài thi đang diễn ra",
    "common.all": "Tất cả",
    "common.searchPlaceholderTeacher": "Tìm đề thi, học sinh, lớp học...",
    "common.searchPlaceholderAdmin": "Tìm đề thi, học sinh, lớp học...",
    "common.searchPlaceholderStudent": "Tìm đề thi, lớp học...",
    "common.createExam": "Tạo đề thi",
    "common.signOut": "Đăng xuất",
    "common.save": "Lưu",
    "common.saving": "Đang lưu...",
    "common.cancel": "Hủy",
    "common.refresh": "Làm mới",
    "common.loading": "Đang tải...",
    "common.viewAll": "Xem tất cả",
    "common.add": "Thêm",
    "common.edit": "Chỉnh sửa",
    "common.delete": "Xóa",
    "common.remove": "Gỡ",
    "common.status.active": "Đang hoạt động",
    "common.status.inactive": "Ngừng hoạt động",
    "common.status.draft": "Bản nháp",
    "common.status.published": "Đã xuất bản",
    "common.roleLabel": "Vai trò",
    "common.name": "Tên",
    "common.email": "Email",
    "common.role": "Vai trò",
    "common.user": "Người dùng",
    "common.actions": "Thao tác",
    "common.type": "Loại",
    "common.status": "Trạng thái",
    "common.searchByNameOrEmail": "Tìm theo tên hoặc email...",
    "common.avatarAlt": "Ảnh đại diện",
    "common.notifications": "Thông báo",
    "common.pagination": "Phân trang",
    "common.pagination.previous": "Trang trước",
    "common.pagination.next": "Trang sau",
    "common.pagination.morePages": "Nhiều trang hơn",
    "common.pagination.goToPreviousPage": "Đi tới trang trước",
    "common.pagination.goToNextPage": "Đi tới trang sau",
    "common.close": "Đóng",
    "common.more": "Thêm",
    "common.breadcrumb": "đường dẫn điều hướng",
    "common.sidebar.toggle": "Bật tắt thanh bên",
    "router.preparingWorkspace": "Đang chuẩn bị không gian làm việc",
    "router.loadingResources": "Azota đang tải tài nguyên...",
    "router.loadingSession": "Đang tải phiên đăng nhập...",
    "router.loadingLandingPage": "Đang tải trang chào mừng...",
    "router.permissionDenied": "Bạn không có quyền xem trang này.",
    "settings.title": "Cài đặt",
    "settings.subtitle": "Quản lý tài khoản và tuỳ chọn.",
    "settings.tab.profile": "Hồ sơ",
    "settings.tab.notifications": "Thông báo",
    "settings.tab.security": "Bảo mật",
    "settings.tab.appearance": "Giao diện",
    "settings.tab.language": "Ngôn ngữ",
    "settings.panel.profile": "Thông tin hồ sơ",
    "settings.panel.notifications": "Tuỳ chọn thông báo",
    "settings.panel.security": "Cài đặt bảo mật",
    "settings.panel.appearance": "Chọn giao diện ưa thích",
    "settings.panel.language": "Ngôn ngữ & Khu vực",
    "settings.language.title": "Ngôn ngữ",
    "settings.language.timezone": "Múi giờ",
    "settings.profile.fullName": "Họ và tên",
    "settings.profile.email": "Email",
    "settings.profile.school": "Trường học",
    "settings.profile.schoolPlaceholder": "ví dụ: THPT Hà Nội",
    "settings.profile.subject": "Môn học",
    "settings.profile.subjectPlaceholder": "ví dụ: Toán học",
    "settings.profile.changePhoto": "Đổi ảnh",
    "settings.profile.saveSuccess": "Đã lưu thay đổi (tuỳ chọn cục bộ).",
    "settings.profile.avatarUpdated": "Đã cập nhật ảnh đại diện.",
    "settings.profile.uploadFailed": "Tải ảnh lên thất bại",
    "settings.security.currentPassword": "Mật khẩu hiện tại",
    "settings.security.newPassword": "Mật khẩu mới",
    "settings.security.confirmPassword": "Xác nhận mật khẩu",
    "settings.security.minimumLength": "Tối thiểu 6 ký tự",
    "settings.security.updatePassword": "Cập nhật mật khẩu",
    "settings.security.minLengthError": "Mật khẩu mới phải có ít nhất 6 ký tự.",
    "settings.security.confirmMismatch": "Xác nhận mật khẩu không khớp.",
    "settings.security.updated": "Đã cập nhật mật khẩu (lưu cục bộ cho bản MVP UI).",
    "settings.security.mvpNote": "Ghi chú MVP: Tab này đã sẵn sàng về giao diện. Nếu bạn muốn cập nhật mật khẩu thật, chúng ta sẽ thêm endpoint backend sau.",
    "settings.language.english": "Tiếng Anh",
    "settings.language.vietnamese": "Tiếng Việt",
    "settings.language.timezone.hcm": "Asia/Ho_Chi_Minh (UTC+7)",
    "settings.language.timezone.tokyo": "Asia/Tokyo (UTC+9)",
    "settings.language.timezone.newYork": "America/New_York (UTC-5)",
    "settings.language.saved": "Đã lưu cài đặt ngôn ngữ (tuỳ chọn cục bộ).",
    "settings.button.saveChanges": "Lưu thay đổi",
    "settings.theme.light": "Sáng",
    "settings.theme.dark": "Tối",
    "settings.theme.system": "Hệ thống",
    "settings.theme.title": "Giao diện",
    "settings.themeColor.title": "Màu sắc giao diện",
    "settings.layoutDensity.title": "Mật độ giao diện",
    "settings.layoutDensity.comfortable": "Tiện lợi",
    "settings.layoutDensity.comfortable.desc": "Không gian rộng, phù hợp với nhiều nội dung",
    "settings.layoutDensity.compact": "Tiết kiệm",
    "settings.layoutDensity.compact.desc": "Không gian hẹp, phù hợp với ít nội dung",
    "settings.sidebar.expanded": "Mở rộng",
    "settings.sidebar.collapsed": "Thu gọn",
    "settings.sidebar.auto": "Tự động",
    "settings.sidebar.title": "Chế độ thanh bên",
    "settings.examSubmissions": "Đề thi được gửi",
    "settings.examSubmissionsDesc": "Nhận thông báo khi học sinh gửi đề thi",
    "settings.newStudent": "Đăng ký học sinh mới",
    "settings.newStudentDesc": "Thông báo khi học sinh mới đăng ký",
    "settings.antiCheatAlerts": "Cảnh báo chống gian lận",
    "settings.antiCheatAlertsDesc": "Thông báo thực tế cho hoạt động bất thường",
    "settings.weeklyReports": "Báo cáo tuần",
    "settings.weeklyReportsDesc": "Báo cáo tuần cho lớp học của bạn",
    "settings.systemUpdates": "Cập nhật hệ thống",
    "settings.systemUpdatesDesc": "Nhận thông báo khi có cập nhật hệ thống mới",
    "adminUsers.loadFailed": "Không thể tải danh sách người dùng",
    "adminUsers.createSuccess": "Tạo người dùng thành công.",
    "adminUsers.createFailed": "Tạo người dùng thất bại",
    "adminUsers.updateStatusSuccess": "Cập nhật trạng thái người dùng thành công.",
    "adminUsers.updateStatusFailed": "Cập nhật trạng thái người dùng thất bại.",
    "adminUsers.updateSuccess": "Cập nhật người dùng thành công.",
    "adminUsers.updateFailed": "Cập nhật người dùng thất bại.",
    "adminUsers.passwordMinLength": "Mật khẩu phải có ít nhất 6 ký tự.",
    "adminUsers.passwordMismatch": "Xác nhận mật khẩu không khớp.",
    "adminUsers.passwordResetSuccess": "Đặt lại mật khẩu thành công.",
    "adminUsers.passwordResetFailed": "Đặt lại mật khẩu thất bại.",
    "adminUsers.deleteSuccess": "Đã xóa người dùng (vô hiệu hóa) thành công.",
    "adminUsers.deleteFailed": "Xóa người dùng thất bại.",
    "adminUsers.loading": "Đang tải người dùng...",
    "adminUsers.title": "Người dùng",
    "adminUsers.subtitle": "Quản lý tài khoản, vai trò và quyền truy cập.",
    "adminUsers.createUser": "Tạo người dùng",
    "adminUsers.managementTitle": "Quản lý người dùng",
    "adminUsers.empty": "Không tìm thấy người dùng.",
    "adminUsers.searchPlaceholder": "Tìm theo tên hoặc email...",
    "adminUsers.totalUsers": "Tổng người dùng",
    "adminUsers.deactivateConfirm": "Bạn có chắc muốn vô hiệu hóa {{name}} ({{email}}) không?",
    "adminUsers.activateConfirm": "Bạn có chắc muốn kích hoạt {{name}} ({{email}}) không?",
    "adminUsers.deleteConfirm": "Thao tác này sẽ vô hiệu hóa {{name}} ({{email}}). Người dùng sẽ không thể đăng nhập.",
    "adminUsers.createDialogTitle": "Tạo người dùng mới",
    "adminUsers.fullNamePlaceholder": "ví dụ: Nguyễn Văn A",
    "adminUsers.passwordHint": "Tối thiểu 6 ký tự",
    "adminUsers.createAccount": "Tạo tài khoản",
    "adminUsers.creating": "Đang tạo...",
    "adminUsers.editDialogTitle": "Chỉnh sửa người dùng",
    "adminUsers.resetPassword": "Đặt lại mật khẩu",
    "adminUsers.deactivate": "Vô hiệu hóa",
    "adminUsers.activate": "Kích hoạt",
    "adminUsers.passwordDialogTitle": "Đặt lại mật khẩu",
    "adminUsers.passwordDialogDescription": "Đặt mật khẩu mới cho {{email}}.",
    "adminUsers.newPassword": "Mật khẩu mới",
    "adminUsers.confirmNewPassword": "Xác nhận mật khẩu mới",
    "questionBank.loadFailed": "Không thể tải ngân hàng câu hỏi",
    "questionBank.loadQuestionFailed": "Không thể tải câu hỏi",
    "questionBank.requiredQuestionText": "Nội dung câu hỏi là bắt buộc.",
    "questionBank.requiredOptions": "Cần ít nhất 2 đáp án.",
    "questionBank.singleChoiceValidation": "Câu hỏi một đáp án phải có đúng 1 đáp án đúng.",
    "questionBank.multipleChoiceValidation": "Câu hỏi nhiều đáp án phải có ít nhất 1 đáp án đúng.",
    "questionBank.saveFailed": "Lưu thất bại",
    "questionBank.deleteFailed": "Xóa thất bại",
    "questionBank.title": "Ngân hàng câu hỏi",
    "questionBank.totalQuestions": "Tổng cộng {{count}} câu hỏi",
    "questionBank.newQuestion": "Câu hỏi mới",
    "questionBank.searchPlaceholder": "Tìm câu hỏi...",
    "questionBank.empty": "Không tìm thấy câu hỏi.",
    "questionBank.question": "Câu hỏi",
    "questionBank.type": "Loại",
    "questionBank.singleChoice": "Một đáp án",
    "questionBank.multipleChoice": "Nhiều đáp án",
    "questionBank.difficulty": "Độ khó",
    "questionBank.tags": "Thẻ",
    "questionBank.single": "Một đáp án",
    "questionBank.multiple": "Nhiều đáp án",
    "questionBank.deleteConfirm": "Xóa câu hỏi?\n\nThao tác này sẽ xóa vĩnh viễn câu hỏi khỏi ngân hàng của bạn.",
    "questionBank.editor.newTitle": "Câu hỏi mới",
    "questionBank.editor.editTitle": "Chỉnh sửa câu hỏi #{{id}}",
    "questionBank.editor.description": "Các thay đổi sẽ được lưu vào ngân hàng câu hỏi cá nhân của bạn.",
    "questionBank.editor.questionText": "Nội dung câu hỏi *",
    "questionBank.editor.explanation": "Giải thích (không bắt buộc)",
    "questionBank.editor.answerOptions": "Danh sách đáp án",
    "questionBank.editor.addOption": "Thêm đáp án",
    "questionBank.editor.removeOption": "Xóa",
    "questionBank.editor.optionPlaceholder": "Đáp án {{number}}",
    "questionBank.editor.type": "Loại",
    "questionBank.editor.singleChoice": "Một đáp án",
    "questionBank.editor.multipleChoice": "Nhiều đáp án",
    "questionBank.difficulty.easy": "Dễ",
    "questionBank.difficulty.medium": "Trung bình",
    "questionBank.difficulty.hard": "Khó",
    "questionBank.editor.status": "Trạng thái",
    "questionBank.editor.tags": "Thẻ (phân tách bằng dấu phẩy)",
    "questionBank.editor.tagsPlaceholder": "ví dụ: đại số, lớp 9",
    "examEditor.step.basicInfo": "Thông tin cơ bản",
    "examEditor.step.questions": "Câu hỏi",
    "examEditor.step.review": "Xem lại",
    "examEditor.title": "Tên đề thi *",
    "examEditor.titlePlaceholder": "ví dụ: Đề thi cuối kỳ môn Toán",
    "examEditor.description": "Mô tả",
    "examEditor.descriptionPlaceholder": "Mô tả ngắn...",
    "examEditor.questionCount": "{{count}} câu hỏi",
    "examEditor.addFromBank": "Thêm từ ngân hàng",
    "examEditor.addQuestion": "Thêm câu hỏi",
    "examEditor.empty": "Chưa có câu hỏi nào. Hãy bấm \"Thêm câu hỏi\" để bắt đầu.",
    "examEditor.questionTitle": "Câu hỏi {{number}}",
    "examEditor.questionTextPlaceholder": "Nhập nội dung câu hỏi...",
    "examEditor.questionAria": "Nội dung câu hỏi {{number}}",
    "examEditor.answerOptions": "Các đáp án",
    "examEditor.markCorrect": "đánh dấu đáp án đúng",
    "examEditor.optionPlaceholder": "Đáp án {{number}}",
    "examEditor.removeOption": "Xóa",
    "examEditor.addOption": "Thêm đáp án",
    "examEditor.readyToSave": "Sẵn sàng lưu",
    "examEditor.reviewMessage": "Kiểm tra lại thông tin đề thi trước khi lưu.",
    "examEditor.reviewTitle": "Tiêu đề",
    "examEditor.publishImmediately": "Xuất bản ngay (không lưu nháp)",
    "examEditor.previous": "Trước",
    "examEditor.next": "Tiếp theo",
    "classDetail.loadFailed": "Tải dữ liệu thất bại",
    "classDetail.notFound": "Không tìm thấy",
    "classDetail.backToClasses": "Quay lại danh sách lớp",
    "classDetail.membersCount": "Thành viên: {{count}}",
    "classDetail.primaryTeacher": "Giáo viên chính:",
    "classDetail.classTeachers": "Giáo viên của lớp",
    "classDetail.classTeachersDescription": "Quản lý danh sách giáo viên (role=teacher) được gán cho lớp này.",
    "classDetail.addTeacher": "Thêm giáo viên",
    "classDetail.noTeachers": "Chưa có giáo viên nào được gán cho lớp này.",
    "classDetail.primary": "Chính",
    "classDetail.removeTeacherConfirm": "Gỡ {{name}} ({{email}}) khỏi lớp này?",
    "classDetail.reassignPrimaryTeacherFirst": "Hãy đổi giáo viên chính trước",
    "classDetail.removeFromClass": "Gỡ khỏi lớp",
    "classDetail.inviteCode": "Mã mời:",
    "classDetail.copied": "Đã sao chép!",
    "classDetail.copyCode": "Sao chép mã",
    "classDetail.copyInviteLink": "Sao chép liên kết mời",
    "classDetail.members": "Thành viên",
    "classDetail.totalMembers": "Tổng: {{count}}",
    "classDetail.noMembers": "Chưa có thành viên nào.",
    "classDetail.removeMemberConfirm": "Gỡ {{name}} khỏi lớp này?",
    "classDetail.thisUser": "người dùng này",
    "classDetail.addTeacherDialogTitle": "Thêm giáo viên vào lớp",
    "classDetail.addTeacherDialogDescription": "Chọn một hoặc nhiều giáo viên (role=teacher). Hệ thống sẽ tự động bỏ qua giáo viên đã có trong lớp.",
    "classDetail.alreadyAdded": "Đã thêm",
    "classDetail.addTeacherSuccess": "Thêm giáo viên thành công.",
    "classDetail.addTeacherFailed": "Thêm giáo viên thất bại.",
    "classDetail.removeTeacherSuccess": "Gỡ giáo viên thành công.",
    "classDetail.removeTeacherFailed": "Gỡ giáo viên thất bại.",
    "teacherDashboard.title": "Tổng quan",
    "teacherDashboard.welcome": "Chào mừng quay lại, {{name}}. Đây là tổng quan của bạn.",
    "teacherDashboard.myStudents": "Học sinh của tôi",
    "teacherDashboard.myExams": "Đề thi của tôi",
    "teacherDashboard.submissions": "Lượt nộp bài",
    "teacherDashboard.avgScore": "Điểm trung bình",
    "teacherDashboard.calculatingStats": "Đang tính thống kê...",
    "teacherDashboard.recentExams": "Đề thi gần đây",
    "teacherDashboard.recentExamsDescription": "Truy cập nhanh tới các công việc mới nhất của bạn.",
    "teacherDashboard.noExams": "Chưa có đề thi nào. Hãy tạo đề thi đầu tiên để bắt đầu.",
    "teacherDashboard.quickLinks": "Liên kết nhanh",
    "teacherDashboard.quickLinksDescription": "Các thao tác giáo viên thường dùng.",
    "teacherDashboard.newAssignment": "Bài tập mới",
    "teacherDashboard.newClass": "Lớp mới",
    "teacherDashboard.classes": "Lớp học",
    "teacherDashboard.assignments": "Bài tập",
    "teacherDashboard.students": "Học sinh",
    "antiCheat.loadFailed": "Không thể tải màn hình giám sát",
    "antiCheat.title": "Giám sát chống gian lận",
    "antiCheat.subtitle": "Theo dõi theo sự kiện dựa trên nhật ký chống gian lận.",
    "antiCheat.totalStudents": "Tổng học sinh",
    "antiCheat.activeNow": "Đang hoạt động",
    "antiCheat.suspicious": "Nghi ngờ",
    "antiCheat.submitted": "Đã nộp",
    "antiCheat.searchPlaceholder": "Tìm học sinh...",
    "antiCheat.allStudents": "Tất cả học sinh",
    "antiCheat.suspiciousOnly": "Chỉ nghi ngờ",
    "antiCheat.noStudents": "Không tìm thấy học sinh.",
    "antiCheat.student": "Học sinh",
    "antiCheat.examClass": "Đề thi / Lớp",
    "antiCheat.events": "Sự kiện",
    "antiCheat.lastEvent": "Sự kiện gần nhất",
    "assignmentList.failed": "Tải dữ liệu thất bại",
    "assignmentList.title": "Bài tập",
    "assignmentList.subtitle": "Lập lịch đề thi cho lớp với các khung thời gian.",
    "assignmentList.new": "Bài tập mới",
    "assignmentList.searchPlaceholder": "Tìm bài tập...",
    "assignmentList.empty": "Chưa có bài tập nào.",
    "assignmentList.viewReport": "Xem báo cáo",
    "classList.failed": "Tải dữ liệu thất bại",
    "classList.title": "Lớp học",
    "classList.adminSubtitle": "Quản lý toàn bộ lớp học trong hệ thống.",
    "classList.teacherSubtitle": "Quản lý lớp học, thành viên và phân công giáo viên.",
    "classList.new": "Lớp mới",
    "classList.searchPlaceholder": "Tìm lớp học...",
    "classList.empty": "Không tìm thấy lớp học.",
    "classList.noDescription": "Chưa có mô tả",
    "examList.failed": "Tải dữ liệu thất bại",
    "examList.title": "Đề thi",
    "examList.subtitle": "Quản lý và tạo đề thi cho các lớp của bạn.",
    "examList.searchPlaceholder": "Tìm đề thi...",
    "examList.empty": "Không tìm thấy đề thi.",
    "teacherStudents.failed": "Không thể tải danh sách lớp",
    "teacherStudents.title": "Học sinh",
    "teacherStudents.loadingClasses": "Đang tải lớp học...",
    "teacherStudents.summary": "{{memberships}} lượt tham gia lớp của học sinh - {{students}} học sinh duy nhất.",
    "teacherStudents.searchPlaceholder": "Tìm học sinh...",
    "teacherStudents.empty": "Không tìm thấy học sinh.",
    "teacherStudents.joined": "Ngày tham gia",
    "teacherStudents.classCount": "{{count}} lớp",
    "adminOverview.failed": "Không thể tải tổng quan",
    "adminOverview.loading": "Đang tải tổng quan...",
    "adminOverview.title": "Tổng quan hệ thống",
    "adminOverview.subtitle": "Thống kê cấp cao cho toàn bộ bài tập trong hệ thống.",
    "adminOverview.assignments": "Bài tập",
    "adminOverview.assignedStudents": "Học sinh được giao",
    "adminOverview.averageScore": "Điểm trung bình",
    "adminOverview.scoreDistribution": "Phân bố điểm",
    "adminDashboard.failed": "Không thể tải danh sách người dùng",
    "adminDashboard.validation": "Vui lòng nhập họ tên, email và mật khẩu (ít nhất 6 ký tự).",
    "adminDashboard.createFailed": "Tạo người dùng thất bại.",
    "adminDashboard.title": "Bảng điều khiển quản trị",
    "adminDashboard.subtitle": "Tổng quan nền tảng và quản lý người dùng.",
    "adminDashboard.totalUsers": "Tổng người dùng",
    "adminDashboard.totalExams": "Tổng đề thi",
    "adminDashboard.joined": "Ngày tham gia",
    "teacherAnalytics.failed": "Không thể tải dữ liệu phân tích",
    "teacherAnalytics.title": "Phân tích",
    "teacherAnalytics.subtitle": "Tổng quan hiệu suất và các chỉ số.",
    "teacherAnalytics.info": "Tab này hiện đang dùng các endpoint sẵn có (lớp học + báo cáo bài tập). Có thể bổ sung backend analytics riêng sau cho biểu đồ, xu hướng và chuỗi thời gian.",
    "studentDashboard.greeting": "Xin chào, {{name}}",
    "studentDashboard.subtitle": "Đây là tổng quan học tập của bạn.",
    "studentDashboard.upcoming": "Sắp tới",
    "studentDashboard.upcomingAssignments": "Bài tập sắp tới",
    "studentDashboard.noUpcomingAssignments": "Không có bài tập sắp tới. Hãy vào \"Bài tập\" để xem tất cả bài thi được giao.",
    "studentDashboard.recentResults": "Kết quả gần đây",
    "studentDashboard.noSubmissions": "Chưa có lượt nộp nào.",
    "studentDashboard.inProgress": "Đang diễn ra",
    "assignmentReport.invalid": "Bài tập không hợp lệ",
    "assignmentReport.failed": "Không thể tải báo cáo",
    "assignmentReport.loading": "Đang tải báo cáo...",
    "assignmentReport.class": "Lớp",
    "assignmentReport.totalStudents": "Tổng học sinh",
    "assignmentReport.notSubmitted": "Chưa nộp",
    "assignmentReport.averageScore": "Điểm trung bình",
    "assignmentReport.scoreDistribution": "Phân bố điểm",
    "login.welcomeBack": "Chào mừng quay lại",
    "login.subtitle": "Đăng nhập vào tài khoản Azota của bạn",
    "login.failed": "Đăng nhập thất bại",
    "login.emailPlaceholder": "ban@truonghoc.edu",
    "login.password": "Mật khẩu",
    "login.showPassword": "Hiện mật khẩu",
    "login.hidePassword": "Ẩn mật khẩu",
    "login.rememberMe": "Ghi nhớ đăng nhập",
    "login.backToHome": "Quay lại trang chủ",
    "login.signingIn": "Đang đăng nhập...",
    "login.signIn": "Đăng nhập",
    "login.needAccount": "Cần tài khoản?",
    "login.contactAdmin": "Liên hệ quản trị viên",
    "myClasses.failed": "Tải dữ liệu thất bại",
    "myClasses.title": "Lớp của tôi",
    "myClasses.subtitle": "Xem các lớp đã tham gia hoặc tham gia lớp mới.",
    "myClasses.empty": "Bạn chưa tham gia lớp nào.",
    "myClasses.emptyHint": "Hãy dùng mã mời ở trên để tham gia một lớp.",
    "myClasses.noDescription": "Chưa có mô tả",
    "createClass.failed": "Tạo lớp thất bại",
    "createClass.title": "Tạo lớp",
    "createClass.name": "Tên lớp",
    "createClass.description": "Mô tả (không bắt buộc)",
    "createClass.create": "Tạo",
    "createClass.creating": "Đang tạo...",
    "studentResults.failed": "Không thể tải kết quả",
    "studentResults.title": "Kết quả của tôi",
    "studentResults.subtitle": "Xem lại bài nộp và điểm số của bạn.",
    "studentResults.retry": "Thử lại",
    "studentResults.empty": "Chưa có bài nộp nào.",
    "studentResults.emptyHint": "Kết quả sẽ xuất hiện ở đây sau khi bạn nộp bài thi.",
    "studentResults.score": "Điểm",
    "studentResults.correct": "Đúng",
    "studentResults.wrong": "Sai",
    "studentResults.total": "Tổng",
    "studentResults.summary": "Tóm tắt",
    "studentResults.open": "Mở",
    "studentResults.view": "Xem",
    "myAssignments.failed": "Tải dữ liệu thất bại",
    "myAssignments.title": "Bài thi được giao",
    "myAssignments.subtitle": "Các bài thi đã được giao cho lớp của bạn.",
    "myAssignments.empty": "Chưa có bài thi nào được giao. Hãy tham gia lớp để xem bài tập.",
    "myAssignments.upcoming": "Sắp tới",
    "myAssignments.open": "Đang mở",
    "myAssignments.closed": "Đã đóng",
    "myAssignments.enterExam": "Vào thi",
    "adminClasses.failed": "Không thể tải danh sách lớp",
    "adminClasses.requiredName": "Tên lớp là bắt buộc.",
    "adminClasses.created": "Tạo lớp thành công.",
    "adminClasses.createFailed": "Tạo lớp thất bại.",
    "adminClasses.management": "Quản lý lớp học",
    "adminClasses.empty": "Chưa có lớp nào.",
    "adminClasses.open": "Mở",
    "adminClasses.createTitle": "Tạo lớp mới",
    "adminClasses.className": "Tên lớp",
    "adminClasses.classNamePlaceholder": "ví dụ: Lớp 10A",
    "adminClasses.descriptionPlaceholder": "Mô tả tùy chọn...",
    "adminClasses.createClass": "Tạo lớp",
    "adminAssignments.info": "Trang này đã sẵn sàng về giao diện. Luồng bài tập hiện khả dụng trong bảng điều khiển giáo viên ở bản MVP này.",
    "adminExams.info": "Trang này đã sẵn sàng về giao diện. Quản lý đề thi hiện khả dụng cho giáo viên ở bản MVP này.",
    "createAssignment.failedLoad": "Không thể tải dữ liệu",
    "createAssignment.selectExamClass": "Vui lòng chọn đề thi và lớp học",
    "createAssignment.setTime": "Vui lòng chọn thời gian bắt đầu và kết thúc",
    "createAssignment.invalidRange": "Thời gian bắt đầu phải trước thời gian kết thúc",
    "createAssignment.invalidDuration": "Thời lượng phải trong khoảng từ 1 đến 600 phút",
    "createAssignment.title": "Giao đề thi cho lớp",
    "createAssignment.exam": "Đề thi",
    "createAssignment.selectExam": "-- Chọn đề thi --",
    "createAssignment.class": "Lớp học",
    "createAssignment.selectClass": "-- Chọn lớp --",
    "createAssignment.startTime": "Thời gian bắt đầu",
    "createAssignment.endTime": "Thời gian kết thúc",
    "createAssignment.duration": "Thời lượng (phút)",
    "createAssignment.assign": "Giao bài",
    "submissionResult.invalid": "Bài nộp không hợp lệ",
    "submissionResult.failed": "Không thể tải kết quả",
    "submissionResult.loading": "Đang tải kết quả...",
    "submissionResult.submittedAt": "Nộp lúc",
    "submissionResult.outOf100": "0-100",
    "submissionResult.questions": "câu hỏi",
    "submissionResult.question": "Câu hỏi {{number}}",
    "submissionResult.yourAnswer": "Câu trả lời của bạn",
    "submissionResult.correctAnswer": "Đáp án đúng",
    "submissionResult.aiExplanation": "Giải thích từ AI",
    "submissionResult.back": "Quay lại",
    "examRoom.submitFailed": "Nộp bài thất bại",
    "examRoom.invalidAssignment": "Bài tập không hợp lệ",
    "examRoom.failedStart": "Không thể bắt đầu",
    "examRoom.loading": "Đang tải bài thi...",
    "examRoom.alreadySubmitted": "Đã nộp bài",
    "examRoom.unableToStart": "Không thể bắt đầu bài thi",
    "examRoom.alreadySubmittedDesc": "Bạn đã nộp bài thi này. Bạn có thể quay lại hoặc xem kết quả.",
    "examRoom.backToAssignments": "Quay lại bài tập",
    "examRoom.viewResult": "Xem kết quả",
    "examRoom.fullscreenHint": "Vui lòng giữ chế độ toàn màn hình và không chuyển tab trong khi làm bài.",
    "examRoom.startTitle": "Bắt đầu làm bài",
    "examRoom.startDescription": "Hệ thống sẽ bật chế độ toàn màn hình. Nếu bạn thoát toàn màn hình hoặc chuyển tab 3 lần, bài sẽ tự động được nộp.",
    "examRoom.enterFullscreen": "Vào toàn màn hình và bắt đầu",
    "examRoom.submitting": "Đang nộp...",
    "examRoom.submit": "Nộp bài",
    "examRoom.back": "Quay lại",
    "examRoom.warningTitle": "Cảnh báo chống gian lận",
    "examRoom.understand": "Tôi hiểu",
    "examRoom.violationMessage": "Bạn vừa thoát toàn màn hình hoặc chuyển tab. Nếu điều này xảy ra 3 lần, hệ thống sẽ tự động nộp bài.",
    "examRoom.question": "Câu hỏi {{number}}",
    "studentClass.failed": "Tải dữ liệu thất bại",
    "studentClass.notFound": "Không tìm thấy",
    "studentClass.back": "Quay lại lớp của tôi",
    "studentClass.teacher": "Giáo viên",
    "joinClassPage.failed": "Tham gia lớp thất bại",
    "joinClassPage.title": "Tham gia lớp học",
    "joinClassPage.subtitle": "Nhập mã mời từ giáo viên hoặc dùng liên kết mời.",
    "joinClassPage.inviteCode": "Mã mời",
    "joinClassPage.placeholder": "ví dụ: abc12XYZ",
    "joinClassPage.join": "Tham gia lớp",
    "editExam.failedLoad": "Không thể tải dữ liệu",
    "editExam.failedBankLoad": "Không thể tải ngân hàng câu hỏi",
    "editExam.failedImport": "Không thể nhập câu hỏi",
    "editExam.failedSave": "Không thể lưu",
    "editExam.loading": "Đang tải...",
    "editExam.back": "Quay lại danh sách đề thi",
    "editExam.title": "Chỉnh sửa đề thi",
    "editExam.save": "Lưu đề thi",
    "editExam.bankTitle": "Thêm từ ngân hàng câu hỏi",
    "editExam.bankSubtitle": "Chọn câu hỏi để sao chép vào đề thi này (snapshot).",
    "editExam.adding": "Đang thêm...",
    "editExam.addCount": "Thêm ({{count}})",
    "editExam.searchBank": "Tìm câu hỏi trong ngân hàng...",
    "editExam.noQuestions": "Không tìm thấy câu hỏi.",
    "profile.account": "Hồ sơ tài khoản",
    "profile.hello": "Xin chào, {{name}}!",
    "profile.welcome": "Chào mừng bạn quay lại Azota Basic.",
    "profile.infoTitle": "Thông tin hồ sơ",
    "profile.infoSubtitle": "Thông tin được lấy từ tài khoản hiện tại trong hệ thống.",
    "profile.displayName": "Tên hiển thị",
    "profile.createdAt": "Ngày tạo tài khoản",
    "landing.nav.features": "Tính năng",
    "landing.nav.how": "Cách hoạt động",
    "landing.nav.pricing": "Bảng giá",
    "landing.nav.faq": "FAQ",
    "landing.nav.login": "Đăng nhập",
    "landing.nav.getStarted": "Bắt đầu",
    "landing.hero.badge": "Được hơn 10.000 nhà giáo tin dùng trên toàn thế giới",
    "landing.hero.titlePrefix": "Tạo, quản lý và",
    "landing.hero.titleHighlight": "chấm thi",
    "landing.hero.titleSuffix": "trực tuyến thật dễ dàng",
    "landing.hero.subtitle": "Nền tảng tất cả trong một dành cho giáo viên để tạo bài kiểm tra, giám sát kỳ thi và phân tích kết quả học sinh, giúp tiết kiệm hàng giờ mỗi tuần.",
    "landing.hero.ctaPrimary": "Bắt đầu miễn phí",
    "landing.hero.ctaSecondary": "Xem demo",
    "landing.hero.noCard": "Không cần thẻ tín dụng",
    "landing.hero.freePlan": "Gói miễn phí vĩnh viễn",
    "landing.hero.secure": "Tuân thủ SOC 2",
    "landing.hero.weeklySubmissions": "Bài nộp theo tuần",
    "landing.trusted.title": "Được các tổ chức giáo dục hàng đầu tin dùng",
    "landing.trusted.logo1": "Đại học Khoa học",
    "landing.trusted.logo2": "Học viện Công nghệ",
    "landing.trusted.logo3": "Viện Toàn cầu",
    "landing.trusted.logo4": "Trường Metro",
    "landing.trusted.logo5": "EduPrime",
    "landing.features.badge": "Tính năng",
    "landing.features.title": "Mọi thứ bạn cần để tổ chức thi trực tuyến",
    "landing.features.subtitle": "Từ tạo đề thi đến phân tích kết quả, tất cả công cụ giáo viên cần đều có trên một nền tảng.",
    "landing.features.items.create.title": "Tạo đề thi trong vài phút",
    "landing.features.items.create.desc": "Trình tạo đề thi kéo thả trực quan với nhiều loại câu hỏi, tự động lưu và mẫu sẵn có. Nhập câu hỏi trực tiếp từ tệp PDF hoặc Word.",
    "landing.features.items.bank.title": "Quản lý ngân hàng câu hỏi",
    "landing.features.items.bank.desc": "Tổ chức hàng nghìn câu hỏi theo môn học, độ khó và thẻ. Tái sử dụng giữa các đề thi một cách dễ dàng.",
    "landing.features.items.grading.title": "Chấm điểm tự động",
    "landing.features.items.grading.desc": "Bài thi được chấm ngay khi học sinh nộp. Câu hỏi trắc nghiệm, điền khuyết và nối cặp được chấm tức thì mà không cần thao tác thủ công.",
    "landing.features.items.monitoring.title": "Giám sát thời gian thực",
    "landing.features.items.monitoring.desc": "Theo dõi học sinh làm bài trực tiếp. Xem tiến độ, thời gian còn lại và trạng thái nộp bài theo thời gian thực.",
    "landing.features.items.integrity.title": "Công nghệ chống gian lận",
    "landing.features.items.integrity.desc": "Nhiều lớp bảo vệ tính trung thực của bài thi: phát hiện chuyển tab, khóa trình duyệt ở chế độ toàn màn hình và tùy chọn giám sát webcam để xác minh danh tính.",
    "landing.features.items.analytics.title": "Phân tích nâng cao",
    "landing.features.items.analytics.desc": "Trực quan hóa phân bố điểm, so sánh kết quả giữa các lớp và đi sâu vào độ khó từng câu hỏi trong các dashboard tương tác có thể xuất ra file.",
    "landing.how.badge": "Cách hoạt động",
    "landing.how.title": "Bắt đầu với 4 bước đơn giản",
    "landing.how.step": "Bước",
    "landing.how.items.create.title": "Tạo đề thi",
    "landing.how.items.create.desc": "Dùng trình tạo trực quan để xây dựng đề thi với nhiều dạng câu hỏi.",
    "landing.how.items.share.title": "Chia sẻ với học sinh",
    "landing.how.items.share.desc": "Gửi liên kết hoặc mã bài thi. Học sinh tham gia chỉ với một lần nhấp.",
    "landing.how.items.take.title": "Học sinh làm bài",
    "landing.how.items.take.desc": "Làm bài bảo mật, có giới hạn thời gian và tính năng chống gian lận.",
    "landing.how.items.results.title": "Kết quả tức thì",
    "landing.how.items.results.desc": "Học sinh thấy điểm số, đáp án đúng và phản hồi chi tiết ngay sau khi nộp bài.",
    "landing.grading.badge": "Chấm điểm & Kết quả",
    "landing.grading.title": "Chấm thi tự động.",
    "landing.grading.titleHighlight": "Trả kết quả tức thì.",
    "landing.grading.subtitle": "Không còn mất hàng giờ để chấm giấy. Nền tảng chấm mọi bài nộp ngay khi được gửi lên. Học sinh xem ngay kết quả, đáp án đúng và phân tích hiệu suất.",
    "landing.grading.header": "Kết quả bài thi",
    "landing.grading.gradedIn": "Chấm trong 0,3 giây",
    "landing.grading.performance": "Kết quả xuất sắc!",
    "landing.grading.correctCount": "Đúng 23 trên 25 câu",
    "landing.grading.sample1": "C1. Quang hợp là gì?",
    "landing.grading.sample2": "C2. Định luật II Newton phát biểu rằng...",
    "landing.grading.sample3": "C3. Thủ đô của Pháp là...",
    "landing.grading.sample4": "C4. Nguyên tố nào có số hiệu nguyên tử là 6?",
    "landing.grading.sample5": "C5. Giải: 2x + 5 = 15",
    "landing.grading.point1": "Điểm được tính trong chưa đầy một giây",
    "landing.grading.point2": "Học sinh xem kết quả ngay sau khi nộp",
    "landing.grading.point3": "Phân tích từng câu hỏi cùng đáp án đúng",
    "landing.grading.point4": "Giáo viên tự động có tổng quan điểm cả lớp",
    "landing.grading.cta": "Thử chấm điểm tự động",
    "landing.analytics.badge": "Phân tích & Insights",
    "landing.analytics.title": "Giảng dạy dựa trên dữ liệu,",
    "landing.analytics.titleHighlight": "insight thật dễ dàng",
    "landing.analytics.subtitle": "Mỗi bài thi đều tạo ra hệ phân tích phong phú một cách tự động. Nhanh chóng phát hiện học sinh gặp khó khăn, câu hỏi khó và theo dõi tiến bộ lớp học theo thời gian mà không cần bảng tính.",
    "landing.analytics.header": "Bảng điều khiển phân tích",
    "landing.analytics.average": "TB",
    "landing.analytics.item1.title": "Phân bố điểm",
    "landing.analytics.item1.desc": "Xem cách điểm số phân bố trong lớp bằng biểu đồ trực quan. Nhanh chóng nhận diện ngoại lệ và điều chỉnh cách chấm.",
    "landing.analytics.item2.title": "Hiệu suất lớp học",
    "landing.analytics.item2.desc": "So sánh kết quả giữa các lớp và môn học. Theo dõi sự cải thiện theo thời gian với đường xu hướng và phân tích nhóm.",
    "landing.analytics.item3.title": "Phân tích chi tiết",
    "landing.analytics.item3.desc": "Đi sâu vào độ khó từng câu, thời gian làm bài và phân tích theo từng học sinh. Xuất toàn bộ dưới dạng PDF hoặc CSV.",
    "landing.analytics.avgScore": "Điểm TB",
    "landing.analytics.passRate": "Tỷ lệ đạt",
    "landing.analytics.students": "Học sinh",
    "landing.analytics.exams": "Đề thi",
    "landing.analytics.submissions": "Bài nộp",
    "landing.integrity.badge": "Tính liêm chính kỳ thi",
    "landing.integrity.title": "Giữ kỳ thi",
    "landing.integrity.titleHighlight": "công bằng và an toàn",
    "landing.integrity.subtitle": "Ba lớp bảo vệ phối hợp để đảm bảo mỗi bài thi đều được thực hiện trung thực, mà không làm gián đoạn trải nghiệm của học sinh.",
    "landing.integrity.header": "Giám sát trực tiếp",
    "landing.integrity.studentsActive": "28 học sinh đang hoạt động",
    "landing.integrity.complete": "hoàn thành",
    "landing.integrity.clean": "Bình thường",
    "landing.integrity.warnings": "Cảnh báo",
    "landing.integrity.flagged": "Bị gắn cờ",
    "landing.integrity.item1.title": "Phát hiện chuyển tab",
    "landing.integrity.item1.desc": "Phát hiện ngay khi học sinh rời khỏi bài thi. Mỗi lần chuyển được ghi log theo thời gian và gắn cờ để giáo viên xem lại.",
    "landing.integrity.item2.title": "Chế độ thi toàn màn hình",
    "landing.integrity.item2.desc": "Khóa trình duyệt ở chế độ toàn màn hình trong suốt bài thi. Mọi nỗ lực thoát ra đều được ghi nhận và có thể kích hoạt cảnh báo tự động.",
    "landing.integrity.item3.title": "Giám sát webcam",
    "landing.integrity.item3.desc": "Tùy chọn giám sát webcam để xác minh danh tính học sinh và phát hiện hành vi đáng ngờ như nhìn ra chỗ khác hoặc xuất hiện nhiều khuôn mặt.",
    "landing.pricing.badge": "Bảng giá",
    "landing.pricing.title": "Bảng giá đơn giản, minh bạch",
    "landing.pricing.subtitle": "Bắt đầu miễn phí. Nâng cấp khi bạn cần nhiều hơn.",
    "landing.pricing.popular": "Phổ biến nhất",
    "landing.pricing.shared.perMonth": "/tháng",
    "landing.pricing.free.name": "Miễn phí",
    "landing.pricing.free.period": "vĩnh viễn",
    "landing.pricing.free.desc": "Dành cho giáo viên cá nhân mới bắt đầu.",
    "landing.pricing.free.feature1": "Tối đa 30 học sinh",
    "landing.pricing.free.feature2": "5 đề thi mỗi tháng",
    "landing.pricing.free.feature3": "Loại câu hỏi cơ bản",
    "landing.pricing.free.feature4": "Chấm tự động",
    "landing.pricing.free.feature5": "Hỗ trợ email",
    "landing.pricing.free.cta": "Bắt đầu miễn phí",
    "landing.pricing.pro.name": "Pro",
    "landing.pricing.pro.desc": "Dành cho giáo viên cần nhiều sức mạnh hơn.",
    "landing.pricing.pro.feature1": "Không giới hạn học sinh",
    "landing.pricing.pro.feature2": "Không giới hạn đề thi",
    "landing.pricing.pro.feature3": "Tất cả loại câu hỏi",
    "landing.pricing.pro.feature4": "Công cụ chống gian lận",
    "landing.pricing.pro.feature5": "Phân tích nâng cao",
    "landing.pricing.pro.feature6": "Hỗ trợ ưu tiên",
    "landing.pricing.pro.cta": "Bắt đầu dùng thử",
    "landing.pricing.school.name": "Trường học",
    "landing.pricing.school.desc": "Dành cho trường học và trung tâm đào tạo.",
    "landing.pricing.school.feature1": "Bao gồm mọi thứ trong Pro",
    "landing.pricing.school.feature2": "Không giới hạn giáo viên",
    "landing.pricing.school.feature3": "Bảng điều khiển quản trị",
    "landing.pricing.school.feature4": "Tùy biến thương hiệu",
    "landing.pricing.school.feature5": "Truy cập API",
    "landing.pricing.school.feature6": "Hỗ trợ chuyên biệt",
    "landing.pricing.school.cta": "Liên hệ kinh doanh",
    "landing.customization.badge": "Tùy chỉnh",
    "landing.customization.title": "Biến nó thành của bạn, từng chi tiết",
    "landing.customization.subtitle": "Chuyển đổi ngôn ngữ, giao diện và cài đặt UI để mọi người dùng đều cảm thấy quen thuộc.",
    "landing.customization.theme": "Giao diện",
    "landing.customization.preferences": "Tùy chọn",
    "landing.customization.pref1": "Thanh bên thu gọn",
    "landing.customization.pref2": "Hiển thị đồng hồ bài thi",
    "landing.customization.pref3": "Âm thanh thông báo",
    "landing.customization.item1.title": "Chuyển đổi ngôn ngữ",
    "landing.customization.item1.desc": "Chuyển đổi liền mạch giữa tiếng Việt, tiếng Anh, tiếng Nhật và nhiều ngôn ngữ khác. Toàn bộ giao diện thích ứng ngay lập tức, từ menu, nhãn, thông báo đến nội dung bài thi.",
    "landing.customization.item2.title": "Giao diện & hiển thị",
    "landing.customization.item2.desc": "Chọn chế độ Sáng, Tối hoặc Theo hệ thống. Mỗi giao diện đều được tối ưu cho khả năng đọc và sự thoải mái trong các phiên chấm bài hoặc thi kéo dài.",
    "landing.customization.item3.title": "Tùy chọn giao diện người dùng",
    "landing.customization.item3.desc": "Tùy chỉnh bố cục thanh bên, âm thanh thông báo, khả năng hiển thị đồng hồ và mật độ giao diện. Tùy chọn của bạn sẽ đồng bộ trên mọi thiết bị.",
    "landing.testimonials.badge": "Đánh giá",
    "landing.testimonials.title": "Được nhà giáo yêu thích ở khắp nơi",
    "landing.testimonials.items.1.quote": "Nền tảng này giúp tôi giảm 90% thời gian chấm bài. Giờ tôi có thể tập trung vào việc giảng dạy thay vì quản lý giấy tờ.",
    "landing.testimonials.items.1.role": "Giáo viên Toán, Hà Nội",
    "landing.testimonials.items.2.quote": "Các tính năng chống gian lận giúp tôi yên tâm rằng kết quả thi là công bằng. Phần giám sát thời gian thực thực sự tạo khác biệt.",
    "landing.testimonials.items.2.role": "Giáo viên Vật lý, TP.HCM",
    "landing.testimonials.items.3.quote": "Chúng tôi đã triển khai cho 12 bộ môn. Bảng điều khiển quản trị giúp việc quản lý hơn 200 giáo viên trở nên rất trơn tru.",
    "landing.testimonials.items.3.role": "Giám đốc, Trung tâm đào tạo ABC",
    "landing.faq.badge": "FAQ",
    "landing.faq.title": "Câu hỏi thường gặp",
    "landing.faq.items.1.q": "Có gói miễn phí không?",
    "landing.faq.items.1.a": "Có. Gói miễn phí cho phép bạn tạo tối đa 5 đề thi mỗi tháng với 30 học sinh. Không cần thẻ tín dụng.",
    "landing.faq.items.2.q": "Học sinh có cần cài đặt gì không?",
    "landing.faq.items.2.a": "Không. Học sinh truy cập bài thi qua bất kỳ trình duyệt web nào trên máy tính, máy tính bảng hoặc điện thoại. Không cần tải ứng dụng.",
    "landing.faq.items.3.q": "Hệ thống chống gian lận hoạt động thế nào?",
    "landing.faq.items.3.a": "Chúng tôi dùng nhiều lớp bảo vệ: phát hiện chuyển tab, ép toàn màn hình, giám sát webcam, ngăn sao chép - dán và phân tích hành vi bằng AI.",
    "landing.faq.items.4.q": "Tôi có thể nhập câu hỏi sẵn có không?",
    "landing.faq.items.4.a": "Có, bạn có thể nhập câu hỏi từ Excel, CSV hoặc Word. Chúng tôi cũng hỗ trợ nhập hàng loạt với định dạng tự động.",
    "landing.faq.items.5.q": "Dữ liệu của tôi có an toàn không?",
    "landing.faq.items.5.a": "Hoàn toàn an toàn. Mọi dữ liệu đều được mã hóa khi lưu trữ và truyền tải. Chúng tôi tuân thủ GDPR và duy trì chứng nhận SOC 2.",
    "landing.faq.items.6.q": "Tôi có thể tùy chỉnh giao diện bài thi không?",
    "landing.faq.items.6.a": "Các gói Pro và Trường học bao gồm tùy chọn thương hiệu riêng như logo, màu sắc và tên miền tùy chỉnh.",
    "landing.cta.title": "Bắt đầu tạo đề thi ngay hôm nay",
    "landing.cta.subtitle": "Tham gia cùng hàng nghìn nhà giáo tiết kiệm nhiều giờ mỗi tuần với EduFlow.",
    "landing.cta.button": "Bắt đầu miễn phí",
    "landing.footer.tagline": "Quản lý thi trực tuyến và học tập hiện đại dành cho nhà giáo.",
    "landing.footer.product": "Sản phẩm",
    "landing.footer.resources": "Tài nguyên",
    "landing.footer.company": "Công ty",
    "landing.footer.legal": "Pháp lý",
    "landing.footer.link.features": "Tính năng",
    "landing.footer.link.pricing": "Bảng giá",
    "landing.footer.link.integrations": "Tích hợp",
    "landing.footer.link.changelog": "Nhật ký thay đổi",
    "landing.footer.link.documentation": "Tài liệu",
    "landing.footer.link.blog": "Blog",
    "landing.footer.link.tutorials": "Hướng dẫn",
    "landing.footer.link.api": "API",
    "landing.footer.link.about": "Giới thiệu",
    "landing.footer.link.careers": "Tuyển dụng",
    "landing.footer.link.contact": "Liên hệ",
    "landing.footer.link.press": "Báo chí",
    "landing.footer.link.terms": "Điều khoản",
    "landing.footer.link.privacy": "Quyền riêng tư",
    "landing.footer.link.security": "Bảo mật",
    "landing.footer.link.gdpr": "GDPR",
    "landing.footer.link.support": "Hỗ trợ",
    "landing.footer.copyright": "© 2026 EduFlow. Đã đăng ký bản quyền.",
    "joinClass.title": "Tham gia lớp học",
    "joinClass.description": "Nhập mã mời của lớp...",
    "joinClass.helper": "Sử dụng mã mời từ giáo viên của bạn.",
    "joinClass.emptyCode": "Vui lòng nhập mã mời.",
    "joinClass.success": "Tham gia lớp thành công.",
    "joinClass.failed": "Tham gia lớp thất bại.",
    "joinClass.joining": "Đang tham gia...",
    "joinClass.join": "Tham gia",
    "scoreChart.empty": "Chưa có dữ liệu điểm.",
    "settings.appearance.theme.light": "Sáng",
    "settings.appearance.theme.dark": "Tối",
    "settings.appearance.theme.system": "Theo hệ thống",
  },
};

const LANGUAGE_EVENT = "app:language-changed";

export function getStoredLanguage(): LanguageCode {
  try {
    const raw = localStorage.getItem("settings.language");
    if (!raw) return "en";
    const obj = JSON.parse(raw) as { language?: LanguageCode };
    return obj.language === "vi" ? "vi" : "en";
  } catch {
    return "en";
  }
}

export function t(key: I18nKey, lang?: LanguageCode): string {
  const l = lang ?? getStoredLanguage();
  return dict[l][key] ?? dict.en[key] ?? key;
}

export function notifyLanguageChanged(lang: LanguageCode) {
  if (typeof window === "undefined") return;
  const ev = new CustomEvent<LanguageCode>(LANGUAGE_EVENT, { detail: lang });
  window.dispatchEvent(ev);
}

export function useLanguage(): LanguageCode {
  const [lang, setLang] = useState<LanguageCode>(() => getStoredLanguage());

  useEffect(() => {
    const sync = (next?: LanguageCode) => {
      if (next) setLang(next);
      else setLang(getStoredLanguage());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "settings.language") sync();
    };
    const onLangEvent = (e: Event) => {
      const ce = e as CustomEvent<LanguageCode>;
      sync(ce.detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(LANGUAGE_EVENT, onLangEvent);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LANGUAGE_EVENT, onLangEvent);
    };
  }, []);

  return lang;
}

