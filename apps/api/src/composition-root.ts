/**
 * Composition root: single place where repositories, providers and use cases are instantiated.
 * Controllers receive use cases via request.server.useCases (decorated in app.ts).
 */

import { GenerateWorkoutPlanWithAIUseCase } from "./application/ai/generate-workout-plan-with-ai.use-case.js";
import { GetUserInsightsUseCase } from "./application/ai/get-user-insights.use-case.js";
import { ListUserChatsUseCase } from "./application/ai/list-user-chats.use-case.js";
import { SendChatMessageUseCase } from "./application/ai/send-chat-message.use-case.js";
import { CreatePhysicalAssessmentUseCase } from "./application/assessment/create-physical-assessment.use-case.js";
import { GetPhysicalAssessmentByIdUseCase } from "./application/assessment/get-physical-assessment-by-id.use-case.js";
import { ListPhysicalAssessmentsByUserUseCase } from "./application/assessment/list-physical-assessments-by-user.use-case.js";
import { AcceptGymInviteUseCase } from "./application/gym/accept-gym-invite.use-case.js";
import { CreateGymUseCase } from "./application/gym/create-gym.use-case.js";
import { GetGymByIdUseCase } from "./application/gym/get-gym-by-id.use-case.js";
import { InviteInstructorUseCase } from "./application/gym/invite-instructor.use-case.js";
import { ListGymMembersUseCase } from "./application/gym/list-gym-members.use-case.js";
import { RemoveInstructorUseCase } from "./application/gym/remove-instructor.use-case.js";
import { UpdateGymUseCase } from "./application/gym/update-gym.use-case.js";
import { AcceptPtInviteUseCase } from "./application/pt-invite/accept-pt-invite.use-case.js";
import { ListPtInvitesUseCase } from "./application/pt-invite/list-pt-invites.use-case.js";
import { RevokePtInviteUseCase } from "./application/pt-invite/revoke-pt-invite.use-case.js";
import { SendPtInviteUseCase } from "./application/pt-invite/send-pt-invite.use-case.js";
import { CreateCheckoutSessionUseCase } from "./application/subscription/create-checkout-session.use-case.js";
import { CreatePortalSessionUseCase } from "./application/subscription/create-portal-session.use-case.js";
import { GetSubscriptionStatusUseCase } from "./application/subscription/get-subscription-status.use-case.js";
import { HandleStripeWebhookUseCase } from "./application/subscription/handle-stripe-webhook.use-case.js";
import { GetUserProfileUseCase } from "./application/user/get-user-profile.use-case.js";
import { ActivateWorkoutPlanUseCase } from "./application/workout/activate-workout-plan.use-case.js";
import { DeleteWorkoutPlanUseCase } from "./application/workout/delete-workout-plan.use-case.js";
import { CompleteWorkoutSessionUseCase } from "./application/workout/complete-workout-session.use-case.js";
import { CreateWorkoutDayUseCase } from "./application/workout/create-workout-day.use-case.js";
import { CreateWorkoutExerciseUseCase } from "./application/workout/create-workout-exercise.use-case.js";
import { CreateWorkoutPlanUseCase } from "./application/workout/create-workout-plan.use-case.js";
import { DeleteWorkoutDayUseCase } from "./application/workout/delete-workout-day.use-case.js";
import { DeleteWorkoutExerciseUseCase } from "./application/workout/delete-workout-exercise.use-case.js";
import { GetSessionHistoryUseCase } from "./application/workout/get-session-history.use-case.js";
import { GetStreakUseCase } from "./application/workout/get-streak.use-case.js";
import { GetWorkoutPlanByIdUseCase } from "./application/workout/get-workout-plan-by-id.use-case.js";
import { ListWorkoutDaysUseCase } from "./application/workout/list-workout-days.use-case.js";
import { ListWorkoutExercisesUseCase } from "./application/workout/list-workout-exercises.use-case.js";
import { ListWorkoutPlansUseCase } from "./application/workout/list-workout-plans.use-case.js";
import { ReorderWorkoutExercisesUseCase } from "./application/workout/reorder-workout-exercises.use-case.js";
import { StartWorkoutSessionUseCase } from "./application/workout/start-workout-session.use-case.js";
import { UpdateWorkoutDayUseCase } from "./application/workout/update-workout-day.use-case.js";
import { UpdateWorkoutPlanUseCase } from "./application/workout/update-workout-plan.use-case.js";
import { UpdateWorkoutExerciseUseCase } from "./application/workout/update-workout-exercise.use-case.js";
import { InMemoryUserProfileCache } from "./infrastructure/cache/in-memory-user-profile-cache.js";
import { PrismaAIChatRepository } from "./infrastructure/database/prisma/repositories/prisma-ai-chat.repository.js";
import { PrismaAIChatMessageRepository } from "./infrastructure/database/prisma/repositories/prisma-ai-chat-message.repository.js";
import { PrismaGymRepository } from "./infrastructure/database/prisma/repositories/prisma-gym.repository.js";
import { PrismaGymInstructorRepository } from "./infrastructure/database/prisma/repositories/prisma-gym-instructor.repository.js";
import { PrismaGymStudentLinkRepository } from "./infrastructure/database/prisma/repositories/prisma-gym-student-link.repository.js";
import { PrismaPhysicalAssessmentRepository } from "./infrastructure/database/prisma/repositories/prisma-physical-assessment.repository.js";
import { PrismaPtStudentLinkRepository } from "./infrastructure/database/prisma/repositories/prisma-pt-student-link.repository.js";
import { PrismaSubscriptionRepository } from "./infrastructure/database/prisma/repositories/prisma-subscription.repository.js";
import { PrismaUserRepository } from "./infrastructure/database/prisma/repositories/prisma-user.repository.js";
import { PrismaWorkoutDayRepository } from "./infrastructure/database/prisma/repositories/prisma-workout-day.repository.js";
import { PrismaWorkoutExerciseRepository } from "./infrastructure/database/prisma/repositories/prisma-workout-exercise.repository.js";
import { PrismaWorkoutPlanRepository } from "./infrastructure/database/prisma/repositories/prisma-workout-plan.repository.js";
import { PrismaWorkoutSessionRepository } from "./infrastructure/database/prisma/repositories/prisma-workout-session.repository.js";
import { OpenAIPlanProviderImpl } from "./infrastructure/providers/openai-provider.js";
import { StripeProviderImpl } from "./infrastructure/providers/stripe-provider.js";
import { runTransaction } from "./lib/db.js";

// Repositories
const userRepository = new PrismaUserRepository();
const workoutPlanRepository = new PrismaWorkoutPlanRepository();
const workoutDayRepository = new PrismaWorkoutDayRepository();
const workoutExerciseRepository = new PrismaWorkoutExerciseRepository();
const workoutSessionRepository = new PrismaWorkoutSessionRepository();
const physicalAssessmentRepository = new PrismaPhysicalAssessmentRepository();
const gymRepository = new PrismaGymRepository();
const gymInstructorRepository = new PrismaGymInstructorRepository();
const gymStudentLinkRepository = new PrismaGymStudentLinkRepository();
const ptStudentLinkRepository = new PrismaPtStudentLinkRepository();
const subscriptionRepository = new PrismaSubscriptionRepository();
const aiChatRepository = new PrismaAIChatRepository();
const aiChatMessageRepository = new PrismaAIChatMessageRepository();

// Cache
const userProfileCache = new InMemoryUserProfileCache();

// Providers
const stripeProvider = new StripeProviderImpl();
const openAIPlanProvider = new OpenAIPlanProviderImpl();

// Use cases
const createWorkoutPlan = new CreateWorkoutPlanUseCase(workoutPlanRepository);
const listWorkoutPlans = new ListWorkoutPlansUseCase(
  workoutPlanRepository,
  userRepository,
);
const getWorkoutPlanById = new GetWorkoutPlanByIdUseCase(workoutPlanRepository);
const updateWorkoutPlan = new UpdateWorkoutPlanUseCase(workoutPlanRepository);
const deleteWorkoutPlan = new DeleteWorkoutPlanUseCase(workoutPlanRepository);
const activateWorkoutPlan = new ActivateWorkoutPlanUseCase(
  workoutPlanRepository,
);

const createWorkoutDay = new CreateWorkoutDayUseCase(
  workoutPlanRepository,
  workoutDayRepository,
);
const listWorkoutDays = new ListWorkoutDaysUseCase(
  workoutPlanRepository,
  workoutDayRepository,
);
const updateWorkoutDay = new UpdateWorkoutDayUseCase(
  workoutPlanRepository,
  workoutDayRepository,
);
const deleteWorkoutDay = new DeleteWorkoutDayUseCase(
  workoutPlanRepository,
  workoutDayRepository,
);

const createWorkoutExercise = new CreateWorkoutExerciseUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutExerciseRepository,
);
const listWorkoutExercises = new ListWorkoutExercisesUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutExerciseRepository,
);
const updateWorkoutExercise = new UpdateWorkoutExerciseUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutExerciseRepository,
);
const deleteWorkoutExercise = new DeleteWorkoutExerciseUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutExerciseRepository,
);
const reorderWorkoutExercises = new ReorderWorkoutExercisesUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutExerciseRepository,
);

const startWorkoutSession = new StartWorkoutSessionUseCase(
  workoutPlanRepository,
  workoutDayRepository,
  workoutSessionRepository,
);
const completeWorkoutSession = new CompleteWorkoutSessionUseCase(
  workoutSessionRepository,
);
const getSessionHistory = new GetSessionHistoryUseCase(
  workoutSessionRepository,
);
const getStreak = new GetStreakUseCase(workoutSessionRepository);

const getUserProfile = new GetUserProfileUseCase(
  userRepository,
  userProfileCache,
);

const listPhysicalAssessmentsByUser = new ListPhysicalAssessmentsByUserUseCase(
  physicalAssessmentRepository,
);
const getPhysicalAssessmentById = new GetPhysicalAssessmentByIdUseCase(
  physicalAssessmentRepository,
);
const createPhysicalAssessment = new CreatePhysicalAssessmentUseCase(
  physicalAssessmentRepository,
);

const acceptGymInvite = new AcceptGymInviteUseCase(gymStudentLinkRepository);
const createGym = new CreateGymUseCase(gymRepository);
const getGymById = new GetGymByIdUseCase(gymRepository);
const updateGym = new UpdateGymUseCase(gymRepository);
const listGymMembers = new ListGymMembersUseCase(
  gymRepository,
  gymInstructorRepository,
);
const inviteInstructor = new InviteInstructorUseCase(
  gymRepository,
  gymInstructorRepository,
);
const removeInstructor = new RemoveInstructorUseCase(
  gymRepository,
  gymInstructorRepository,
);

const sendPtInvite = new SendPtInviteUseCase(ptStudentLinkRepository);
const listPtInvites = new ListPtInvitesUseCase(ptStudentLinkRepository);
const revokePtInvite = new RevokePtInviteUseCase(ptStudentLinkRepository);
const acceptPtInvite = new AcceptPtInviteUseCase(ptStudentLinkRepository);

const createCheckoutSession = new CreateCheckoutSessionUseCase(stripeProvider);
const createPortalSession = new CreatePortalSessionUseCase(
  userRepository,
  stripeProvider,
);
const getSubscriptionStatus = new GetSubscriptionStatusUseCase(
  subscriptionRepository,
);
const transactionRunner = { run: runTransaction };
const handleStripeWebhook = new HandleStripeWebhookUseCase(
  stripeProvider,
  subscriptionRepository,
  userRepository,
  transactionRunner,
  userProfileCache,
);

const generateWorkoutPlanWithAI = new GenerateWorkoutPlanWithAIUseCase(
  openAIPlanProvider,
  workoutPlanRepository,
);
const listUserChats = new ListUserChatsUseCase(aiChatRepository);
const sendChatMessage = new SendChatMessageUseCase(
  aiChatRepository,
  aiChatMessageRepository,
  openAIPlanProvider,
);
const getUserInsights = new GetUserInsightsUseCase(openAIPlanProvider);

export {
  aiChatMessageRepository,
  gymInstructorRepository,
  gymRepository,
  gymStudentLinkRepository,
  userRepository,
};

export const useCases = {
  createWorkoutPlan,
  listWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  activateWorkoutPlan,
  createWorkoutDay,
  listWorkoutDays,
  updateWorkoutDay,
  deleteWorkoutDay,
  createWorkoutExercise,
  listWorkoutExercises,
  updateWorkoutExercise,
  deleteWorkoutExercise,
  reorderWorkoutExercises,
  startWorkoutSession,
  completeWorkoutSession,
  getSessionHistory,
  getStreak,
  getUserProfile,
  listPhysicalAssessmentsByUser,
  getPhysicalAssessmentById,
  createPhysicalAssessment,
  acceptGymInvite,
  createGym,
  getGymById,
  updateGym,
  listGymMembers,
  inviteInstructor,
  removeInstructor,
  sendPtInvite,
  listPtInvites,
  revokePtInvite,
  acceptPtInvite,
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  handleStripeWebhook,
  generateWorkoutPlanWithAI,
  listUserChats,
  sendChatMessage,
  getUserInsights,
};

export type UseCases = typeof useCases;
