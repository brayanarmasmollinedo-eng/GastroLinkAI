import { z } from "zod";
import {
  businessTypes,
  purchaseVolumes,
  supplierCertifications,
} from "./types";
z.config(z.locales.es());
export const requestSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().finite().positive().max(1000000),
  city: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100),
  requiredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((v) => {
      const d = new Date(v + "T23:59:59");
      return (
        Number.isFinite(d.getTime()) &&
        new Date(v).toISOString().slice(0, 10) === v &&
        d > new Date()
      );
    }, "Elige una fecha futura."),
  comments: z.string().trim().max(2000),
});
export const offerSchema = z.object({
  price: z.coerce.number().finite().positive().max(100000),
  leadDays: z.coerce.number().int().min(1).max(365),
  minimum: z.coerce.number().positive().max(1000000),
  validDays: z.coerce.number().int().min(1).max(90),
  presentation: z.string().trim().min(2).max(120),
  conditions: z.string().trim().min(3).max(2000),
});
export const productSchema = z.object({
  name: z.string().trim().min(3).max(120),
  categoryId: z.string().min(1),
  description: z.string().trim().min(10).max(3000),
  region: z.string().trim().min(2).max(100),
  presentation: z.string().trim().min(3).max(120),
  price: z.coerce.number().finite().positive().max(100000),
  minimum: z.coerce.number().positive().max(1000000),
  stock: z.coerce.number().nonnegative().max(10000000),
  capacity: z.coerce.number().positive().max(10000000),
  leadDays: z.coerce.number().int().min(1).max(365),
  image: z
    .string()
    .max(400000, "La imagen es demasiado pesada.")
    .refine(
      (v) =>
        v === "" ||
        /^(\/images\/[\w.-]+|data:image\/(jpeg|png|webp);base64,[\w+/=]+)$/.test(
          v,
        ),
      "Imagen no válida.",
    )
    .optional(),
});
const text = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label}: mínimo ${min} caracteres.`)
    .max(max, `${label}: máximo ${max} caracteres.`);
export const companyDetailsSchema = z.object({
  name: text("Nombre comercial", 3, 100),
  legalName: text("Razón social", 3, 150),
  taxId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9-]{8,15}$/,
      "Identificación fiscal: entre 8 y 15 letras o números (RUC, NIF o CIF).",
    ),
  country: text("País", 2, 100),
  city: text("Ciudad", 2, 100),
  address: text("Dirección", 5, 200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Teléfono de empresa no válido."),
  website: z
    .string()
    .trim()
    .max(200)
    .refine(
      (v) => !v || /^https?:\/\/[^\s.]+\.[^\s]+$/.test(v),
      "Web: usa una dirección completa, p. ej. https://miempresa.com.",
    ),
  description: z
    .string()
    .trim()
    .max(2000, "Descripción: máximo 2000 caracteres."),
});
export const buyerProfileSchema = z.object({
  businessType: z.enum(businessTypes, "Elige el tipo de negocio."),
  purchaseVolume: z.enum(
    purchaseVolumes,
    "Elige el volumen de compra estimado.",
  ),
});
export const supplierProfileSchema = z.object({
  categoryIds: z
    .array(z.string())
    .min(1, "Elige al menos una categoría de producto.")
    .max(8),
  monthlyCapacityKg: z.coerce
    .number("Capacidad mensual no válida.")
    .int("Capacidad mensual: usa un número entero de kg.")
    .min(1, "Capacidad mensual: debe ser mayor que 0.")
    .max(10_000_000, "Capacidad mensual demasiado alta."),
  certifications: z.array(z.enum(supplierCertifications)).max(5),
  years: z.coerce
    .number("Años de experiencia no válidos.")
    .int()
    .min(0, "Años de experiencia no válidos.")
    .max(150, "Años de experiencia no válidos."),
});
export const contactSchema = z.object({
  contactName: text("Nombre de contacto", 3, 100),
  position: text("Cargo", 2, 100),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Teléfono de contacto no válido."),
});
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Correo electrónico no válido."));
/** Reglas de contraseña aplicadas antes de calcular el hash. */
export function passwordProblem(password: string, confirm?: string) {
  if (password.length < 8)
    return "La contraseña debe tener al menos 8 caracteres.";
  if (password.length > 128) return "La contraseña es demasiado larga.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    return "La contraseña debe combinar letras y números.";
  if (confirm !== undefined && password !== confirm)
    return "Las contraseñas no coinciden.";
  return null;
}
export type CompanyDetailsInput = z.input<typeof companyDetailsSchema>;
export type BuyerProfileInput = z.input<typeof buyerProfileSchema>;
export type SupplierProfileInput = z.input<typeof supplierProfileSchema>;
export type ContactInput = z.input<typeof contactSchema>;
export type RequestInput = z.input<typeof requestSchema>;
export type OfferInput = z.input<typeof offerSchema>;
export type ProductInput = z.input<typeof productSchema>;
export function errorMessage(error: unknown) {
  if (error instanceof z.ZodError)
    return error.issues.map((i) => i.message).join(" ");
  return error instanceof Error
    ? error.message
    : "No se pudo completar la operación.";
}
