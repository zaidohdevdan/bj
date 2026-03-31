"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoomSchema = exports.RoomDurations = exports.LoginSchema = void 0;
const zod_1 = require("zod");
// Schemas DTO
// 1. Auth/Login - Somente Apelido (Anônimo)
exports.LoginSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Apelido deve ter no mínimo 3 caracteres').max(30),
});
// 2. Room/Criação - Tempos Fixos de Expiração permitidos na Skill
exports.RoomDurations = [5, 15, 30, 45, 60, 120];
exports.CreateRoomSchema = zod_1.z.object({
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
