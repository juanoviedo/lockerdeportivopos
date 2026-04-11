const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Crear admin por defecto
  const adminExists = await prisma.admin.findUnique({
    where: { email: 'admin@deportespos.local' },
  })

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('deportes123', 10)
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@deportespos.local',
        nombre: 'Administrador Local',
        password: hashedPassword,
      },
    })
    console.log('✅ Admin creado:', admin.email)
  } else {
    console.log('✓ Admin ya existe')
  }

  // Crear métodos de pago por defecto
  const paymentMethods = [
    { nombre: 'Efectivo' },
    { nombre: 'Tarjeta de Crédito' },
    { nombre: 'Tarjeta de Débito' },
    { nombre: 'Transferencia' },
  ]

  for (const method of paymentMethods) {
    const exists = await prisma.paymentMethod.findUnique({
      where: { nombre: method.nombre },
    })

    if (!exists) {
      await prisma.paymentMethod.create({
        data: method,
      })
      console.log('✅ Método de pago creado:', method.nombre)
    }
  }

  // Crear vendedores de ejemplo
  const sellers = [
    { nombre: 'Vendedor 1' },
    { nombre: 'Vendedor 2' },
    { nombre: 'Vendedor 3' },
  ]

  for (const seller of sellers) {
    const exists = await prisma.seller.findUnique({
      where: { nombre: seller.nombre },
    })

    if (!exists) {
      await prisma.seller.create({
        data: seller,
      })
      console.log('✅ Vendedor creado:', seller.nombre)
    }
  }

  // Crear productos de ejemplo
  const products = [
    { nombre: 'Camiseta Deportiva', precio: 50000, precio_minimo: 40000 },
    { nombre: 'Shorts', precio: 35000, precio_minimo: 28000 },
    { nombre: 'Zapatillas', precio: 120000, precio_minimo: 100000 },
    { nombre: 'Calcetines (3pares)', precio: 20000, precio_minimo: 15000 },
  ]

  for (const product of products) {
    const exists = await prisma.product.findUnique({
      where: { nombre: product.nombre },
    })

    if (!exists) {
      await prisma.product.create({
        data: product,
      })
      console.log('✅ Producto creado:', product.nombre)
    }
  }

  // Crear cliente de ejemplo
  const clientExists = await prisma.client.findUnique({
    where: { cedula: '1234567890' },
  })

  if (!clientExists) {
    const client = await prisma.client.create({
      data: {
        cedula: '1234567890',
        nombre: 'Cliente de Prueba',
        telefono: '3001234567',
        correo: 'cliente@example.com',
      },
    })
    console.log('✅ Cliente de ejemplo creado')
  }

  console.log('✨ Seed completado!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
