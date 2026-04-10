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
      await prisma.admin.create({ data: { ...a, updatedAt: new Date() } })
    }
    for (const c of data.clients) {
      await prisma.client.create({ data: { ...c, updatedAt: new Date() } })
    }
    for (const p of data.products) {
      await prisma.product.create({ data: { ...p, updatedAt: new Date() } })
    }
    for (const s of data.sellers) {
      await prisma.seller.create({ data: { ...s, updatedAt: new Date() } })
    }
    for (const pm of data.paymentMethods) {
      await prisma.paymentMethod.create({ data: { ...pm, updatedAt: new Date() } })
    }
    for (const sale of data.sales) {
      const items = sale.items
      delete sale.items
      await prisma.sale.create({
        data: {
          ...sale,
          updatedAt: new Date(),
          items: {
            create: items.map(i => ({
              ...i,
              id: undefined, // let it auto-generate due to relation
              ventaId: undefined, // relation automatically connects
              updatedAt: new Date()
            }))
          }
        }
      })
    }
    console.log("¡Restauración Mágica Completada con Éxito!")
  } catch (err) {
      console.error("Error importando datos:", err.message)
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
