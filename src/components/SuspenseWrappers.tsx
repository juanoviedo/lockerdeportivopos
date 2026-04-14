import { Suspense } from 'react'
import { SkeletonTable, SkeletonDashboardMetrics } from './Skeleton'

interface AdminReportProps {
  children: React.ReactNode
  isMetrics?: boolean
}

/**
 * Componente que envuelve reportes pesados con Suspense.
 * Permite que el resto de la página cargue mientras se procesan los datos.
 */
export function AdminReportSuspense({ children, isMetrics = false }: AdminReportProps) {
  return (
    <Suspense fallback={isMetrics ? <SkeletonDashboardMetrics /> : <SkeletonTable />}>
      {children}
    </Suspense>
  )
}

/**
 * Componente para envolver secciones lentas de la interfaz.
 * Renderiza un fallback mientras se cargan los datos en el servidor.
 */
export function SuspenseSection({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback: React.ReactNode
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}
