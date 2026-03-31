import { z } from 'zod';
export type RoomStatus = 'CREATED' | 'CONNECTED' | 'EXPIRING' | 'EXPIRED' | 'CLOSED';
export declare const LoginSchema: z.ZodObject<{
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
}, {
    username: string;
}>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
    };
}
export declare const RoomDurations: readonly [5, 15, 30, 45, 60, 120];
export declare const CreateRoomSchema: z.ZodObject<{
    durationMin: z.ZodUnion<[z.ZodLiteral<5>, z.ZodLiteral<15>, z.ZodLiteral<30>, z.ZodLiteral<45>, z.ZodLiteral<60>, z.ZodLiteral<120>]>;
}, "strip", z.ZodTypeAny, {
    durationMin: 30 | 5 | 15 | 45 | 60 | 120;
}, {
    durationMin: 30 | 5 | 15 | 45 | 60 | 120;
}>;
export type CreateRoomDTO = z.infer<typeof CreateRoomSchema>;
export interface JwtPayloadSession {
    userId: string;
    username: string;
}
