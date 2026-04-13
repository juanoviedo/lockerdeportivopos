/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando restauración en PostgreSQL...")
  if (!fs.existsSync('db_backup.json')) {
     console.error("No se encontró db_backup.json")
     return
  }
  
  const rawData = fs.readFileSync('db_backup.json', 'utf8')
  const data = JSON.parse(rawData)

  console.log(`Encontrados: ${data.admins.length} Admins, ${data.products.length} Productos, ${data.sales.length} Ventas.`)

  try {
    for (const a of data.admins) {
      await prisma.admin.upsert({
        where: { id: a.id },
        update: { ...a, updatedAt: new Date() },
        create: { ...a, updatedAt: new Date() }
      })
    }
    for (const c of data.clients) {
      await prisma.client.upsert({
        where: { id: c.id },
        update: { ...c, updatedAt: new Date() },
        create: { ...c, updatedAt: new Date() }
      })
    }
    for (const p of data.products) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: { ...p, updatedAt: new Date() },
        create: { ...p, updatedAt: new Date() }
      })
    }
    for (const s of data.sellers) {
      await prisma.seller.upsert({
        where: { id: s.id },
        update: { ...s, updatedAt: new Date() },
        create: { ...s, updatedAt: new Date() }
      })
    }
    for (const pm of data.paymentMethods) {
      await prisma.paymentMethod.upsert({
        where: { id: pm.id },
        update: { ...pm, updatedAt: new Date() },
        create: { ...pm, updatedAt: new Date() }
      })
    }
    for (const sale of data.sales) {
      const items = sale.items
      const paymentMethods = []
      
      // Handle old payment method fields
      if (sale.metodo_pago_1 && sale.valor_pago_1) {
        paymentMethods.push({
          metodo: sale.metodo_pago_1,
          valor: sale.valor_pago_1
        })
      }
      if (sale.metodo_pago_2 && sale.valor_pago_2) {
        paymentMethods.push({
          metodo: sale.metodo_pago_2,
          valor: sale.valor_pago_2
        })
      }
      
      delete sale.items
      delete sale.metodo_pago_1
      delete sale.valor_pago_1
      delete sale.metodo_pago_2
      delete sale.valor_pago_2
      
      const createdSale = await prisma.sale.create({
        data: {
          ...sale,
          updatedAt: new Date(),
          items: {
            create: items.map(i => ({
              ...i,
              id: undefined,
              ventaId: undefined,
              updatedAt: new Date()
            }))
          }
        }
      })
      
      // Create transactions for payment methods
      for (const payment of paymentMethods) {
        const paymentMethod = await prisma.paymentMethod.findFirst({
          where: { nombre: payment.metodo }
        })
        if (paymentMethod) {
          await prisma.transaction.create({
            data: {
              ventaId: createdSale.id,
              paymentMethodId: paymentMethod.id,
              monto: payment.valor,
              updatedAt: new Date()
            }
          })
        }
      }
    }
    console.log("¡Restauración Mágica Completada con Éxito!")
  } catch (err) {
      console.error("Error importando datos:", err.message)
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
