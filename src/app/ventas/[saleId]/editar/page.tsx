import Link from 'next/link'
import PosDashboard from '@/components/PosDashboard'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ saleId: string }>
}) {
  const { saleId } = await params

  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15,
    include: {
      client: true,
      items: {
        include: {
          product: true,
        },
      },
      transactions: {
        include: {
          paymentMethod: true,
        },
      },
    },
  })

  const products = await prisma.product.findMany({
    orderBy: { nombre: 'asc' },
  })

  const clients = await prisma.client.findMany({
    orderBy: { cedula: 'asc' },
  })

  const sellers = await prisma.seller.findMany({
    orderBy: { nombre: 'asc' },
  })

  const paymentMethods = await prisma.paymentMethod.findMany({
    orderBy: { nombre: 'asc' },
  })

  const admins = await prisma.admin.findMany({
    select: { id: true, nombre: true },
  })

  return (
    <main className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h1 className="title-main" style={{ margin: 0 }}>
          Editar Venta
        </h1>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', border: '1px solid currentColor', padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          Volver a Caja
        </Link>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Modifica los datos de la venta seleccionada.
      </p>

      <PosDashboard
        historicalSales={sales}
        allProducts={products}
        allClients={clients}
        allSellers={sellers}
        paymentMethods={paymentMethods}
        admins={admins}
        initialEditSaleId={saleId}
        isEditPage
      />
    </main>
  )
}
