import { z } from 'zod';
export type RoomStatus = 'CREATED' | 'CONNECTED' | 'EXPIRING' | 'EXPIRED' | 'CLOSED';
export declare const LoginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export declare const RegisterSchema: z.ZodEffects<z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    confirmPassword: string;
}, {
    username: string;
    password: string;
    confirmPassword: string;
}>, {
    username: string;
    password: string;
    confirmPassword: string;
}, {
    username: string;
    password: string;
    confirmPassword: string;
}>;
export type RegisterDTO = z.infer<typeof RegisterSchema>;
export interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
    };
}
export declare const RoomDurations: readonly [5, 15, 30, 45, 60, 120];
export declare const CreateRoomSchema: z.ZodObject<{
    name: z.ZodString;
    receiverEmail: z.ZodOptional<z.ZodString>;
    secret: z.ZodString;
    durationMin: z.ZodUnion<[z.ZodLiteral<5>, z.ZodLiteral<15>, z.ZodLiteral<30>, z.ZodLiteral<45>, z.ZodLiteral<60>, z.ZodLiteral<120>]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    secret: string;
    durationMin: 30 | 5 | 15 | 45 | 60 | 120;
    receiverEmail?: string | undefined;
}, {
    name: string;
    secret: string;
    durationMin: 30 | 5 | 15 | 45 | 60 | 120;
    receiverEmail?: string | undefined;
}>;
export type CreateRoomDTO = z.infer<typeof CreateRoomSchema>;
export declare const VerifyRoomKeySchema: z.ZodObject<{
    secret: z.ZodString;
}, "strip", z.ZodTypeAny, {
    secret: string;
}, {
    secret: string;
}>;
export type VerifyRoomKeyDTO = z.infer<typeof VerifyRoomKeySchema>;
export interface JwtPayloadSession {
    userId: string;
    username: string;
}
