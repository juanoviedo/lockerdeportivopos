/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Configuración de entornos
const environments = {
  local: {
    databaseUrl: "postgresql://postgres:123456$$$@localhost:5432/deportes_pos",
    directUrl: "postgresql://postgres:123456$$$@localhost:5432/deportes_pos"
  },
  staging: {
    databaseUrl: process.env.STAGING_DATABASE_URL,
    directUrl: process.env.STAGING_DIRECT_URL
  },
  production: {
    databaseUrl: process.env.PRODUCTION_DATABASE_URL,
    directUrl: process.env.PRODUCTION_DIRECT_URL
  }
}

async function syncData(sourceEnv, targetEnv, options = {}) {
  console.log(`🔄 Sincronizando datos de ${sourceEnv} → ${targetEnv}...`)

  if (!environments[sourceEnv] || !environments[targetEnv]) {
    console.error("❌ Entorno no válido")
    process.exit(1)
  }

  // Crear cliente para el entorno fuente
  const sourcePrisma = new PrismaClient({
    datasourceUrl: environments[sourceEnv].databaseUrl
  })

  // Crear cliente para el entorno destino
  const targetPrisma = new PrismaClient({
    datasourceUrl: environments[targetEnv].databaseUrl
  })

  try {
    console.log("📤 Extrayendo datos del entorno fuente...")

    const [admins, clients, products, sellers, paymentMethods, sales] = await Promise.all([
      sourcePrisma.admin.findMany(),
      sourcePrisma.client.findMany(),
      sourcePrisma.product.findMany(),
      sourcePrisma.seller.findMany(),
      sourcePrisma.paymentMethod.findMany(),
      sourcePrisma.sale.findMany({
        include: {
          items: true,
          transactions: {
            include: {
              paymentMethod: true
            }
          }
        }
      })
    ])

    console.log(`📊 Datos extraídos: ${admins.length} admins, ${clients.length} clientes, ${products.length} productos, ${sales.length} ventas`)

    if (options.clearTarget) {
      console.log("🧹 Limpiando datos del entorno destino...")

      // Eliminar en orden inverso por dependencias
      await targetPrisma.transaction.deleteMany()
      await targetPrisma.saleItem.deleteMany()
      await targetPrisma.sale.deleteMany()
      await targetPrisma.client.deleteMany()
      await targetPrisma.product.deleteMany()
      await targetPrisma.seller.deleteMany()
      await targetPrisma.paymentMethod.deleteMany()
      // No eliminar admins para mantener credenciales

      console.log("✅ Datos limpiados")
    }

    console.log("📥 Importando datos al entorno destino...")

    // Importar payment methods primero
    for (const pm of paymentMethods) {
      await targetPrisma.paymentMethod.upsert({
        where: { nombre: pm.nombre },
        update: { ...pm, updatedAt: new Date() },
        create: { ...pm, updatedAt: new Date() }
      })
    }

    // Importar sellers
    for (const s of sellers) {
      await targetPrisma.seller.upsert({
        where: { id: s.id },
        update: { ...s, updatedAt: new Date() },
        create: { ...s, updatedAt: new Date() }
      })
    }

    // Importar products
    for (const p of products) {
      await targetPrisma.product.upsert({
        where: { id: p.id },
        update: { ...p, updatedAt: new Date() },
        create: { ...p, updatedAt: new Date() }
      })
    }

    // Importar clients
    for (const c of clients) {
      await targetPrisma.client.upsert({
        where: { id: c.id },
        update: { ...c, updatedAt: new Date() },
        create: { ...c, updatedAt: new Date() }
      })
    }

    // Importar sales con items y transactions
    for (const sale of sales) {
      const items = sale.items
      const transactions = sale.transactions

      delete sale.items
      delete sale.transactions

      const createdSale = await targetPrisma.sale.upsert({
        where: { id: sale.id },
        update: {
          ...sale,
          updatedAt: new Date(),
          items: {
            deleteMany: {},
            create: items.map(i => ({
              ...i,
              id: undefined,
              ventaId: undefined,
              updatedAt: new Date()
            }))
          }
        },
        create: {
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

      // Importar transactions
      for (const transaction of transactions) {
        const paymentMethod = await targetPrisma.paymentMethod.findFirst({
          where: { nombre: transaction.paymentMethod.nombre }
        })

        if (paymentMethod) {
          await targetPrisma.transaction.upsert({
            where: { id: transaction.id },
            update: {
              ...transaction,
              ventaId: createdSale.id,
              paymentMethodId: paymentMethod.id,
              updatedAt: new Date()
            },
            create: {
              ...transaction,
              id: undefined,
              ventaId: createdSale.id,
              paymentMethodId: paymentMethod.id,
              updatedAt: new Date()
            }
          })
        }
      }
    }

    console.log(`✅ Sincronización completada: ${sales.length} ventas sincronizadas`)

  } catch (error) {
    console.error("❌ Error en sincronización:", error.message)
    process.exit(1)
  } finally {
    await sourcePrisma.$disconnect()
    await targetPrisma.$disconnect()
  }
}

// Uso desde línea de comandos
if (require.main === module) {
  const [,, sourceEnv, targetEnv, ...args] = process.argv

  if (!sourceEnv || !targetEnv) {
    console.log("Uso: node sync_environments.js <source> <target> [--clear]")
    console.log("Ejemplos:")
    console.log("  node sync_environments.js local staging")
    console.log("  node sync_environments.js staging production --clear")
    process.exit(1)
  }

  const options = {
    clearTarget: args.includes('--clear')
  }

  syncData(sourceEnv, targetEnv, options)
}

module.exports = { syncData }