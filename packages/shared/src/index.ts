import { z } from 'zod';

// Tipos do Domínio/Banco (Shared com Frontend)
export type RoomStatus = 'CREATED' | 'CONNECTED' | 'EXPIRING' | 'EXPIRED' | 'CLOSED';

// Schemas DTO

// 1. Auth/Login - Somente Apelido (Anônimo)
export const LoginSchema = z.object({
  username: z.string().min(3, 'Apelido deve ter no mínimo 3 caracteres').max(30),
});
export type LoginDTO = z.infer<typeof LoginSchema>;

// Resposta Padrão do Login
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

// 2. Room/Criação - Tempos Fixos de Expiração permitidos na Skill
export const RoomDurations = [5, 15, 30, 45, 60, 120] as const;

export const CreateRoomSchema = z.object({
  // Tempo de duração em minutos
  durationMin: z.union([
    z.literal(5), 
    z.literal(15), 
    z.literal(30), 
    z.literal(45), 
    z.literal(60), 
    z.literal(120)
  ]),
});
export type CreateRoomDTO = z.infer<typeof CreateRoomSchema>;

// JWT Payload Estrutura
export interface JwtPayloadSession {
  userId: string;
  username: string;
}
