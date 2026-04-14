import Link from 'next/link'
import { Suspense } from 'react'
import PosDashboard from '@/components/PosDashboard'
import prisma from '@/lib/prisma'
import { SkeletonTable } from '@/components/Skeleton'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidar cada 5 minutos para datos del POS

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  // Parse dates from search params or default to today in Colombia timezone (UTC-5)
  const now = new Date()
  const colombiaOffset = -5 * 60 * 60 * 1000 // UTC-5 in milliseconds
  const colombiaNow = new Date(now.getTime() + colombiaOffset)
  
  const defaultStartDate = new Date(colombiaNow.getFullYear(), colombiaNow.getMonth(), colombiaNow.getDate())
  const defaultEndDate = new Date(defaultStartDate.getTime() + 24 * 60 * 60 * 1000 - 1)
  
  const startDateParam = searchParams?.startDate as string
  const endDateParam = searchParams?.endDate as string
  const startDate = startDateParam ? new Date(startDateParam) : defaultStartDate
  const endDate = endDateParam ? new Date(new Date(endDateParam).getTime() + 24 * 60 * 60 * 1000 - 1) : defaultEndDate

  // Convert dates from Colombia time to UTC for database query
  // Notice that new Date('YYYY-MM-DD') creates a date at midnight UTC.
  // We subtract the Colombia offset to effectively treat that midnight as Colombia midnight, converting it to UTC database time.
  const utcStartDate = new Date(startDate.getTime() - colombiaOffset)
  const utcEndDate = new Date(endDate.getTime() - colombiaOffset)

  const sales = await prisma.sale.findMany({
    where: {
      OR: [
        {
          fecha_venta: {
            gte: utcStartDate,
            lte: utcEndDate,
          },
        },
        {
          AND: [
            { fecha_venta: { equals: null } },
            {
              createdAt: {
                gte: utcStartDate,
                lte: utcEndDate,
              },
            },
          ],
        },
      ],
    },
    orderBy: [
      { fecha_venta: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 50, // Increased limit for filtered results
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
          Locker Deportivo POS
        </h1>
        <Link href="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none', border: '1px solid currentColor', padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', transition: 'all 0.2s' }}>
          Gestión Admin
        </Link>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Gestión Rápida de Ventas
      </p>

      <PosDashboard
        historicalSales={sales}
        allProducts={products}
        allClients={clients}
        allSellers={sellers}
        paymentMethods={paymentMethods}
        admins={admins}
        startDate={startDate}
        endDate={endDate}
      />
    </main>
  )
}
