import ProductCrud from '@/components/ProductCrud'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });
  const admins = await prisma.admin.findMany({ select: { id: true, nombre: true } });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="title-main" style={{ marginBottom: '0.5rem', fontSize: '2rem', color: 'var(--accent-secondary)' }}>Catálogo de Productos</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Edita o elimina los nombres de los productos guardados automáticamente.
      </p>
      
      <ProductCrud products={products} admins={admins} />
    </div>
  );
}
