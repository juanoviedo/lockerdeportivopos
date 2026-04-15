import prisma from '@/lib/prisma'
import TransactionTable from '@/components/TransactionTable'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function TransaccionesPage({ searchParams }: PageProps) {
  const searchParamsResolved = await searchParams;
  const fechaIni = typeof searchParamsResolved.fechaIni === 'string' ? searchParamsResolved.fechaIni : undefined
  const fechaFin = typeof searchParamsResolved.fechaFin === 'string' ? searchParamsResolved.fechaFin : undefined
  const paymentMethodId = typeof searchParamsResolved.paymentMethodId === 'string' ? searchParamsResolved.paymentMethodId : undefined

  const colombiaOffset = -5 * 60 * 60 * 1000 // UTC-5
  const where: any = {}

  if (paymentMethodId) {
    where.paymentMethodId = paymentMethodId
  }

  if (fechaIni || fechaFin) {
    where.venta = {}

    if (fechaIni) {
      const rangeStart = new Date(new Date(`${fechaIni}T00:00:00Z`).getTime() - colombiaOffset)
      where.venta.fecha_venta = { ...where.venta.fecha_venta, gte: rangeStart }
    }

    if (fechaFin) {
      const rangeEnd = new Date(new Date(`${fechaFin}T00:00:00Z`).getTime() + 24 * 60 * 60 * 1000 - 1 - colombiaOffset)
      where.venta.fecha_venta = { ...where.venta.fecha_venta, lte: rangeEnd }
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      paymentMethod: true,
      venta: {
        select: {
          id: true,
          cliente_nombre: true,
          vendedor_nombre: true,
          total: true,
          createdAt: true,
          fecha_venta: true // 👈 CLAVE
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const paymentMethods = await prisma.paymentMethod.findMany({
    select: { id: true, nombre: true }
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="title-main" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Transacciones</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Visualiza las transacciones realizadas. Puedes filtrar por fechas y método de pago.
      </p>

      <TransactionTable transactions={transactions} paymentMethods={paymentMethods} />
    </div>
  );
}