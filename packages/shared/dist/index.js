"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyRoomKeySchema = exports.CreateRoomSchema = exports.RoomDurations = exports.RegisterSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
// Schemas DTO
// 1. Auth/Login e Registro - Com Senha
exports.LoginSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Apelido deve ter no mínimo 3 caracteres').max(30),
    password: zod_1.z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});
exports.RegisterSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Apelido deve ter no mínimo 3 caracteres').max(30),
    password: zod_1.z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: zod_1.z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});
// 2. Room/Criação - Tempos Fixos de Expiração permitidos na Skill
exports.RoomDurations = [5, 15, 30, 45, 60, 120];
exports.CreateRoomSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Nome da sala deve ter no mínimo 3 caracteres').max(50),
    receiverEmail: zod_1.z.string().email('E-mail do destinatário inválido').optional(),
    secret: zod_1.z.string().min(4, 'A palavra-passe deve ter no mínimo 4 caracteres'),
    // Tempo de duração em minutos
    durationMin: zod_1.z.union([
        zod_1.z.literal(5),
        zod_1.z.literal(15),
        zod_1.z.literal(30),
        zod_1.z.literal(45),
        zod_1.z.literal(60),
        zod_1.z.literal(120)
    ]),
});
exports.VerifyRoomKeySchema = zod_1.z.object({
    secret: zod_1.z.string().min(4, 'A palavra-passe deve ter no mínimo 4 caracteres'),
});
