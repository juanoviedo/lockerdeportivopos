import SellerCrud from '@/components/SellerCrud'
import { PrismaClient } from '@prisma/client'

// ISR: Revalidar cada 30 minutos (1800 segundos)
// La lista de vendedores no cambia cada segundo, así que puede servirse en caché
export const revalidate = 1800

const prisma = new PrismaClient()

export default async function AdminSellersPage() {
  const sellers = await prisma.seller.findMany({
    orderBy: { createdAt: 'desc' }
  });
  const admins = await prisma.admin.findMany({ select: { id: true, nombre: true } });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="title-main" style={{ marginBottom: '0.5rem', fontSize: '2rem', color: '#ffb86c' }}>Gestión de Vendedores</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Visualiza, edita o elimina a los vendedores que pueden registrar ventas.
      </p>
      
      <SellerCrud sellers={sellers} admins={admins} />
    </div>
  );
}
