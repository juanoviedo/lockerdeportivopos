/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function main() {
  console.log("Leyendo datos antiguos...")
  const admins = await prisma.admin.findMany()
  const clients = await prisma.client.findMany()
  const products = await prisma.product.findMany()
  const sellers = await prisma.seller.findMany()
  const paymentMethods = await prisma.paymentMethod.findMany()
  const sales = await prisma.sale.findMany({ include: { items: true } })

  const data = { admins, clients, products, sellers, paymentMethods, sales }
  fs.writeFileSync('db_backup.json', JSON.stringify(data, null, 2))
  console.log("Backup exitoso! En db_backup.json")
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
