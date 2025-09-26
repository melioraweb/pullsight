// lib/constants.ts
export const AUTH_CONSTANTS = {
    ACCESS_TOKEN: "accessToken",
};

export const ROUTE_CONSTANTS = {
    // Auth routes
    AUTH: "/auth",
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",

    // onboarding routes
    ONBOARDING: "/onboarding",
    ONBOARDING_STEP_1: "/onboarding/step-1",
    ONBOARDING_STEP_2: "/onboarding/step-2",
    ONBOARDING_STEP_3: "/onboarding/step-3",
    ONBOARDING_STEP_4: "/onboarding/step-4",
    ONBOARDING_STEP_5: "/onboarding/step-5",
    ONBOARDING_STEP_6: "/onboarding/step-6",

    // Dashboard routes
    APP: "/app",
    APP_DASHBOARD: "/app/dashboard",
    APP_REPOSITORIES: "/app/repositories",
    APP_PULL_REQUESTS: "/app/pull-requests",
    APP_PULL_REQUESTS_ISSUES: "/app/pull-requests/:id/issues",
    APP_TEAM_MEMBERS: "/app/team-members",
    APP_SETTINGS: "/app/settings",
};
