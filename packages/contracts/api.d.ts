export interface paths {
    "/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["OperationsController_ready"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/strava/connection": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["OperationsController_connection"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccessController_register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/verify-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccessController_verify"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/resend-verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccessController_resend"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccessController_forgot"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccessController_reset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccessController_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccessController_refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccessController_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AccessController_sessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["AccessController_revoke"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/activities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ActivitiesController_list"];
        put?: never;
        post: operations["ActivitiesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/activities/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ActivitiesController_detail"];
        put?: never;
        post?: never;
        delete: operations["ActivitiesController_remove"];
        options?: never;
        head?: never;
        patch: operations["ActivitiesController_edit"];
        trace?: never;
    };
    "/v1/gear": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GearController_list"];
        put?: never;
        post: operations["GearController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/gear/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["GearController_edit"];
        trace?: never;
    };
    "/v1/goals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GoalsController_list"];
        put?: never;
        post: operations["GoalsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/goals/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["GoalsController_edit"];
        trace?: never;
    };
    "/v1/users/me/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProfileController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["ProfileController_save"];
        trace?: never;
    };
    "/v1/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["DashboardController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ConnectionStatus: {
            status: string;
            reason: string;
            aiEnabled: boolean;
        };
        RegisterDto: {
            email: string;
            password: string;
        };
        TokenDto: {
            token: string;
        };
        EmailDto: {
            email: string;
        };
        ResetDto: {
            token: string;
            password: string;
        };
        LoginDto: {
            email: string;
            password: string;
        };
        TokenPair: {
            accessToken: string;
            refreshToken: string;
            userId: string;
            expiresIn: number;
        };
        RefreshDto: {
            refreshToken: string;
        };
        SessionView: {
            id: string;
            createdAt: string;
            expiresAt: string;
            current: boolean;
        };
        PasswordDto: {
            password: string;
        };
        Object: Record<string, never>;
        ActivityView: {
            id: string;
            title: string;
            /** @enum {string} */
            sport: "run" | "trail" | "walk";
            startedAt: string;
            timezone: string;
            distanceMeters: number;
            movingSeconds: number;
            elapsedSeconds: number;
            notes?: string;
            gearId?: string | null;
            version: number;
            source: string;
            routeAvailable: boolean;
            splitsAvailable: boolean;
        };
        ActivityPage: {
            items: components["schemas"]["ActivityView"][];
            nextCursor: string | null;
        };
        ActivityInput: {
            id: string;
            title: string;
            /** @enum {string} */
            sport: "run" | "trail" | "walk";
            startedAt: string;
            timezone: string;
            distanceMeters: number;
            movingSeconds: number;
            elapsedSeconds: number;
            notes?: string;
            gearId?: string | null;
        };
        ActivityPatch: {
            title?: string;
            /** @enum {string} */
            sport?: "run" | "trail" | "walk";
            startedAt?: string;
            timezone?: string;
            distanceMeters?: number;
            movingSeconds?: number;
            elapsedSeconds?: number;
            notes?: string;
            gearId?: string | null;
            expectedVersion: number;
        };
        VersionDto: {
            expectedVersion: number;
        };
        GearView: {
            id: string;
            name: string;
            /** @enum {string} */
            type: "shoe" | "equipment";
            brand: string;
            openingMileageMeters: number;
            expectedLifeMeters?: number | null;
            version: number;
            usageMeters: number;
            retiredAt: string | null;
        };
        GearPage: {
            items: components["schemas"]["GearView"][];
            nextCursor: string | null;
        };
        GearInput: {
            id: string;
            name: string;
            /** @enum {string} */
            type: "shoe" | "equipment";
            brand: string;
            openingMileageMeters: number;
            expectedLifeMeters?: number | null;
        };
        GearPatch: {
            name?: string;
            /** @enum {string} */
            type?: "shoe" | "equipment";
            brand?: string;
            openingMileageMeters?: number;
            expectedLifeMeters?: number | null;
            expectedVersion: number;
            retiredAt?: string | null;
        };
        GoalView: {
            id: string;
            title: string;
            /** @enum {string} */
            type: "distance" | "count" | "longest";
            target: number;
            /** @enum {string} */
            period: "week" | "month" | "custom";
            timezone: string;
            startsOn: string;
            endsOn: string;
            version: number;
            progress: number;
            asOf: string;
            periodStart: string;
            periodEnd: string;
            archivedAt: string | null;
        };
        GoalPage: {
            items: components["schemas"]["GoalView"][];
            nextCursor: string | null;
        };
        GoalInput: {
            id: string;
            title: string;
            /** @enum {string} */
            type: "distance" | "count" | "longest";
            target: number;
            /** @enum {string} */
            period: "week" | "month" | "custom";
            timezone: string;
            startsOn: string;
            endsOn: string;
        };
        GoalPatch: {
            title?: string;
            /** @enum {string} */
            type?: "distance" | "count" | "longest";
            target?: number;
            /** @enum {string} */
            period?: "week" | "month" | "custom";
            timezone?: string;
            startsOn?: string;
            endsOn?: string;
            expectedVersion: number;
            archivedAt?: string | null;
        };
        ProfileView: {
            displayName: string;
            units: string;
            timezone: string;
            experience: string;
            notifications: boolean;
            version: number;
        };
        ProfileInput: {
            displayName: string;
            /** @enum {string} */
            units: "km" | "mi";
            timezone: string;
            /** @enum {string} */
            experience: "beginner" | "regular" | "experienced";
            notifications: boolean;
            expectedVersion: number;
        };
        DashboardView: {
            distanceMeters: number;
            movingSeconds: number;
            activityCount: number;
            periodStart: string;
            periodEnd: string;
            asOf: string;
            profile: components["schemas"]["ProfileView"];
            latest: components["schemas"]["ActivityView"] | null;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    OperationsController_ready: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    OperationsController_connection: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionStatus"];
                };
            };
        };
    };
    AccessController_register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccessController_verify: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TokenDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccessController_resend: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccessController_forgot: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccessController_reset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccessController_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TokenPair"];
                };
            };
        };
    };
    AccessController_refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TokenPair"];
                };
            };
        };
    };
    AccessController_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccessController_sessions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionView"][];
                };
            };
        };
    };
    AccessController_revoke: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ActivitiesController_list: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: components["schemas"]["Object"];
                search?: string;
                sport?: "run" | "trail" | "walk";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActivityPage"];
                };
            };
        };
    };
    ActivitiesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActivityInput"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActivityView"];
                };
            };
        };
    };
    ActivitiesController_detail: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActivityView"];
                };
            };
        };
    };
    ActivitiesController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ActivitiesController_edit: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActivityPatch"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActivityView"];
                };
            };
        };
    };
    GearController_list: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: components["schemas"]["Object"];
                status?: "active" | "archived" | "all";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GearPage"];
                };
            };
        };
    };
    GearController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GearInput"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GearView"];
                };
            };
        };
    };
    GearController_edit: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GearPatch"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GearView"];
                };
            };
        };
    };
    GoalsController_list: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: components["schemas"]["Object"];
                status?: "active" | "archived" | "all";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GoalPage"];
                };
            };
        };
    };
    GoalsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoalInput"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GoalView"];
                };
            };
        };
    };
    GoalsController_edit: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoalPatch"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GoalView"];
                };
            };
        };
    };
    ProfileController_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfileView"];
                };
            };
        };
    };
    ProfileController_save: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileInput"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfileView"];
                };
            };
        };
    };
    DashboardController_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DashboardView"];
                };
            };
        };
    };
}
