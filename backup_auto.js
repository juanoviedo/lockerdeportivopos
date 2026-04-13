/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupData() {
  console.log("🔄 Creando backup automático...")

  try {
    const [admins, clients, products, sellers, paymentMethods, sales] = await Promise.all([
      prisma.admin.findMany(),
      prisma.client.findMany(),
      prisma.product.findMany(),
      prisma.seller.findMany(),
      prisma.paymentMethod.findMany(),
      prisma.sale.findMany({
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

    const data = {
      timestamp: new Date().toISOString(),
      environment: process.env.ENVIRONMENT || 'unknown',
      admins,
      clients,
      products,
      sellers,
      paymentMethods,
      sales
    }

    // Crear directorio de backups si no existe
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir)
    }

    const filename = `backup_${data.environment}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    const filepath = path.join(backupDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
    console.log(`✅ Backup creado: ${filename}`)

    // Mantener solo los últimos 10 backups
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup_'))
      .sort()
      .reverse()

    if (files.length > 10) {
      files.slice(10).forEach(file => {
        fs.unlinkSync(path.join(backupDir, file))
        console.log(`🗑️ Backup antiguo eliminado: ${file}`)
      })
    }

  } catch (error) {
    console.error("❌ Error creando backup:", error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  backupData()
}

module.exports = { backupData }