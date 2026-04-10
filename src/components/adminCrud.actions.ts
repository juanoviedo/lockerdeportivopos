'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { checkAuth } from "@/app/auth.actions"

async function getAdminId() {
  const auth = await checkAuth()
  return auth?.userId as string | undefined || null
}

export async function createAdmin(formData: FormData) {
  const adminId = await getAdminId()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre = formData.get('nombre') as string

  if (!email || !password || !nombre) {
    return { error: 'Revisa que todos los campos estén llenos.' }
  }

  const existing = await prisma.admin.findUnique({ where: { email } })
  if (existing) {
    return { error: 'Ese correo ya fue registrado como administrador.' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  
  await prisma.admin.create({
    data: {
      nombre,
      email,
      password: hashedPassword,
      createdBy: adminId,
      updatedBy: adminId
    }
  })

  revalidatePath('/admin/usuarios')
}

export async function deleteAdmin(id: string) {
  await prisma.admin.delete({ where: { id } })
  revalidatePath('/admin/usuarios')
}

export async function changeOwnPassword(formData: FormData) {
  const adminId = await getAdminId()
  if (!adminId) return { error: "No autorizado." }

  const currentPass = formData.get('currentPassword') as string
  const newPass = formData.get('newPassword') as string

  if (!currentPass || !newPass) return { error: "Completa ambas contraseñas." }

  const me = await prisma.admin.findUnique({ where: { id: adminId } })
  if (!me) return { error: "Administrador no encontrado." }

  const isValid = await bcrypt.compare(currentPass, me.password)
  if (!isValid) return { error: "La contraseña actual es incorrecta." }

  const newHashed = await bcrypt.hash(newPass, 10)
  await prisma.admin.update({
    where: { id: adminId },
    data: { password: newHashed, updatedBy: adminId }
  })

  // We could force logout here, but we simply return success.
  return { success: true }
}
