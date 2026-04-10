import ClientCrud from '@/components/ClientCrud'
import { PrismaClient } from '@prisma/client'

// En desarrollo crear múltiples instancias arroja warning, 
// pero se sigue la convención actual del proyecto
const prisma = new PrismaClient()

export default async function AdminClientesPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });
  const admins = await prisma.admin.findMany({ select: { id: true, nombre: true } });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="title-main" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Gestión de Clientes</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Visualiza, audita, edita o elimina la información de tus clientes.
      </p>
      
      <ClientCrud clients={clients} admins={admins} />
    </div>
  );
}
