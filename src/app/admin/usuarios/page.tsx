import prisma from "@/lib/prisma"
import AdminCrud from "@/components/AdminCrud"
import ChangePasswordForm from "@/components/ChangePasswordForm"
import { checkAuth } from "@/app/auth.actions"

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Obtener el correo del admin logueado actual para que no se borre a si mismo por accidente
  const auth = await checkAuth()
  let currentUserEmail = ""

  if (auth && auth.userId) {
     const me = await prisma.admin.findUnique({ where: { id: auth.userId as string } })
     if (me) currentUserEmail = me.email
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="title-main" style={{ fontSize: '2rem' }}>Perfiles de Administrador</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Aquí puedes otorgar o revocar accesos al sistema maestro. Se requiere nombre, correo y contraseña.
        </p>
      </div>

      <ChangePasswordForm currentUserEmail={currentUserEmail} />

      <AdminCrud data={admins} currentUserEmail={currentUserEmail} />
    </div>
  )
}
