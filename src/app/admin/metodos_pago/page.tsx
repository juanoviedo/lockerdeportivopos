import prisma from '@/lib/prisma'
import PaymentMethodCrud from '@/components/PaymentMethodCrud'

export const dynamic = 'force-dynamic'

export default async function MetodosPagoPage() {
  const methods = await prisma.paymentMethod.findMany({
    orderBy: { createdAt: 'desc' }
  });
  const admins = await prisma.admin.findMany({ select: { id: true, nombre: true } });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="title-main" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Métodos de Pago</h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Crea o edita los métodos aceptados. Ten en cuenta que si el sistema detecta que el método contiene la palabra 'efectivo', lo contabilizará automáticamente en las métricas de dinero en caja.
      </p>
      
      <PaymentMethodCrud methods={methods} admins={admins} />
    </div>
  );
}
