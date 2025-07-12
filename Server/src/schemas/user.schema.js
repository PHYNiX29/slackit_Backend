import {z} from "zod";

export const userRegistrationSchema = z.object({
    username: z.string().min(7).max(20),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["admin", "maintainer", "team_leader", "team_member"]),
    teamName: z.string().min(7).max(20)
});

export const userLoginSchema = z.object({
    username: z.string().min(7).max(20),
    password: z.string().min(8),
});