'use server'

import prisma from "@/lib/prisma"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-pos-123')

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const cookieStore = await cookies()

  const session = await new SignJWT({ userId, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  cookieStore.set('admin_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  })
}

export async function seedAdmin() {
  const existingAdmin = await prisma.admin.findFirst()
  if (!existingAdmin) {
    const defaultPassword = await bcrypt.hash('123456', 10)
    await prisma.admin.create({
      data: {
        nombre: 'Admin Principal',
        email: 'admin@pos.com',
        password: defaultPassword
      }
    })
    console.log("Seeded default admin: admin@pos.com / 123456")
  }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) return { error: "Todos los campos son requeridos" }

  await seedAdmin() // seed si es necesario en primer arranque

  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) return { error: "Credenciales inválidas" }

  const isValid = await bcrypt.compare(password, admin.password)
  if (!isValid) return { error: "Credenciales inválidas" }

  await createSession(admin.id)
  redirect('/admin')
}

export async function logout() {
  (await cookies()).delete('admin_session')
  redirect('/login')
}

export async function checkAuth() {
    const session = (await cookies()).get('admin_session')?.value
    if(!session) return null
    try {
        const payload = await jwtVerify(session, JWT_SECRET)
        return payload.payload
    } catch {
        return null
    }
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: "Correo requerido" }

  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) return { error: "Si el correo está registrado, se enviará el token" }

  // Generate 6 digit pin
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

  await prisma.admin.update({
    where: { id: admin.id },
    data: { resetToken: token, resetTokenExpiry: expiry }
  })

  // Try real email, fallback to console
  if (process.env.EMAIL_SERVER_HOST) {
    try {
        const tr = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD
            }
        })
        await tr.sendMail({
            from: process.env.EMAIL_FROM || '"Deportes POS" <noreply@pos.com>',
            to: email,
            subject: 'Recuperación de Contraseña - POS',
            text: `Su código de recuperación de 6 dígitos es: ${token}`
        })
    } catch(e) {
        console.error("Nodemailer falló. Verifique su .env", e)
        console.log(`\n\n=== [LOCAL DEV OVERRIDE] ===\nPassword Reset Token for ${email}: ${token}\n============================\n`)
    }
  } else {
    // If no config, always print to console
    console.log(`\n\n=== [LOCAL DEV OVERRIDE] ===\nConfig SMTP pendiente en .env.\nAquí está su token de reseteo para ${email} (válido 15 min): ${token}\n============================\n`)
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  const newPassword = formData.get('newPassword') as string

  if (!email || !token || !newPassword) return { error: "Todos los campos son requeridos" }

  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) return { error: "Datos incorrectos" }

  if (admin.resetToken !== token || !admin.resetTokenExpiry || admin.resetTokenExpiry < new Date()) {
    return { error: "El token es inválido o ha expirado" }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
  })

  return { success: true }
}
