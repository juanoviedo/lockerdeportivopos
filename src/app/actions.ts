'use server'

import type { Seller } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { checkAuth } from './auth.actions'
import prisma from '@/lib/prisma'
import type {
  ClientFormData,
  CreateSaleInput,
  PaymentMethodFormData,
  ProductFormData,
  SellerFormData,
} from '@/lib/types'

async function getAdminId() {
  const auth = await checkAuth()
  return (auth?.userId as string | undefined) || null
}

export async function createSale(formData: CreateSaleInput) {
  const adminId = await getAdminId()
  const { cedula, nombre, telefono, correo, items, pagos, observaciones, vendedor_nombre } = formData

  if (!items || items.length === 0) {
    throw new Error('La venta debe tener al menos un ítem.')
  }

  const pagosValidos = (pagos || [])
    .map((pago) => ({
      metodoPagoId: pago.metodoPagoId,
      valor: Number(pago.valor) || 0,
    }))
    .filter((pago) => pago.metodoPagoId && pago.valor > 0)

  if (pagosValidos.length === 0) {
    throw new Error('Debe agregar al menos un pago válido.')
  }

  let client = await prisma.client.findUnique({ where: { cedula } })

  if (!client) {
    client = await prisma.client.create({
      data: { cedula, nombre, telefono, correo, createdBy: adminId, updatedBy: adminId },
    })
  }

  let sellerObj: Seller | null = null
  if (vendedor_nombre && vendedor_nombre.trim() !== '') {
    const sellerName = vendedor_nombre.trim()
    sellerObj = await prisma.seller.findUnique({ where: { nombre: sellerName } })
    if (!sellerObj) {
      sellerObj = await prisma.seller.create({
        data: { nombre: sellerName, createdBy: adminId, updatedBy: adminId },
      })
    }
  }

  let totalVenta = 0
  const saleItemsData = []

  for (const item of items) {
    const productName = item.nombre
    let product = await prisma.product.findUnique({ where: { nombre: productName } })

    if (!product) {
      product = await prisma.product.create({
        data: {
          nombre: productName,
          precio: Number(item.precio_unitario) || 0,
          createdBy: adminId,
          updatedBy: adminId,
        },
      })
    }

    const cantidad = Number(item.cantidad) || 0
    const precio_unitario = Number(item.precio_unitario) || 0
    const subtotal = cantidad * precio_unitario

    totalVenta += subtotal

    saleItemsData.push({
      productId: product.id,
      cantidad,
      precio_unitario,
      subtotal,
      createdBy: adminId,
      updatedBy: adminId,
    })
  }

  const totalPagos = pagosValidos.reduce((acc, pago) => acc + pago.valor, 0)

  if (Math.abs(totalVenta - totalPagos) >= 0.01) {
    throw new Error('La suma de los pagos no coincide con el total de la venta.')
  }

  const primerPago = pagosValidos[0] ?? null
  const segundoPago = pagosValidos[1] ?? null

  const sale = await prisma.sale.create({
    data: {
      clientId: client.id,
      cliente_cedula: client.cedula,
      cliente_nombre: client.nombre,
      sellerId: sellerObj?.id || null,
      vendedor_nombre: sellerObj?.nombre || null,
      total: totalVenta,
      metodo_pago_1: primerPago?.metodoPagoId || null,
      valor_pago_1: primerPago?.valor || null,
      metodo_pago_2: segundoPago?.metodoPagoId || null,
      valor_pago_2: segundoPago?.valor || null,
      observaciones: observaciones || null,
      createdBy: adminId,
      updatedBy: adminId,
      items: {
        create: saleItemsData,
      },
      transactions: {
        create: pagosValidos.map((pago) => ({
          paymentMethodId: pago.metodoPagoId,
          monto: pago.valor,
          createdBy: adminId,
          updatedBy: adminId,
        })),
      },
    },
  })

  revalidatePath('/')
  return sale
}

export async function toggleSaleInvoiced(saleId: string, facturada: boolean) {
  const adminId = await getAdminId()

  const sale = await prisma.sale.update({
    where: { id: saleId },
    data: {
      facturada,
      updatedBy: adminId,
    },
  })

  revalidatePath('/')
  return sale
}

export async function updateSale(saleId: string, formData: CreateSaleInput) {
  const adminId = await getAdminId()
  const { cedula, nombre, telefono, correo, items, pagos, observaciones, vendedor_nombre } = formData

  if (!items || items.length === 0) {
    throw new Error('La venta debe tener al menos un ítem.')
  }

  const pagosValidos = (pagos || [])
    .map((pago) => ({
      metodoPagoId: pago.metodoPagoId,
      valor: Number(pago.valor) || 0,
    }))
    .filter((pago) => pago.metodoPagoId && pago.valor > 0)

  if (pagosValidos.length === 0) {
    throw new Error('Debe agregar al menos un pago válido.')
  }

  let client = await prisma.client.findUnique({ where: { cedula } })

  if (!client) {
    client = await prisma.client.create({
      data: { cedula, nombre, telefono, correo, createdBy: adminId, updatedBy: adminId },
    })
  } else {
    client = await prisma.client.update({
      where: { id: client.id },
      data: { nombre, telefono, correo, updatedBy: adminId },
    })
  }

  let sellerObj: Seller | null = null
  if (vendedor_nombre && vendedor_nombre.trim() !== '') {
    const sellerName = vendedor_nombre.trim()
    sellerObj = await prisma.seller.findUnique({ where: { nombre: sellerName } })
    if (!sellerObj) {
      sellerObj = await prisma.seller.create({
        data: { nombre: sellerName, createdBy: adminId, updatedBy: adminId },
      })
    }
  }

  let totalVenta = 0
  const saleItemsData = []

  for (const item of items) {
    const productName = item.nombre
    let product = await prisma.product.findUnique({ where: { nombre: productName } })

    if (!product) {
      product = await prisma.product.create({
        data: {
          nombre: productName,
          precio: Number(item.precio_unitario) || 0,
          createdBy: adminId,
          updatedBy: adminId,
        },
      })
    }

    const cantidad = Number(item.cantidad) || 0
    const precio_unitario = Number(item.precio_unitario) || 0
    const subtotal = cantidad * precio_unitario

    totalVenta += subtotal

    saleItemsData.push({
      productId: product.id,
      cantidad,
      precio_unitario,
      subtotal,
      createdBy: adminId,
      updatedBy: adminId,
    })
  }

  const totalPagos = pagosValidos.reduce((acc, pago) => acc + pago.valor, 0)

  if (Math.abs(totalVenta - totalPagos) >= 0.01) {
    throw new Error('La suma de los pagos no coincide con el total de la venta.')
  }

  const primerPago = pagosValidos[0] ?? null
  const segundoPago = pagosValidos[1] ?? null

  const sale = await prisma.sale.update({
    where: { id: saleId },
    data: {
      clientId: client.id,
      cliente_cedula: client.cedula,
      cliente_nombre: client.nombre,
      sellerId: sellerObj?.id || null,
      vendedor_nombre: sellerObj?.nombre || null,
      total: totalVenta,
      metodo_pago_1: primerPago?.metodoPagoId || null,
      valor_pago_1: primerPago?.valor || null,
      metodo_pago_2: segundoPago?.metodoPagoId || null,
      valor_pago_2: segundoPago?.valor || null,
      observaciones: observaciones || null,
      updatedBy: adminId,
      items: {
        deleteMany: {},
        create: saleItemsData,
      },
      transactions: {
        deleteMany: {},
        create: pagosValidos.map((pago) => ({
          paymentMethodId: pago.metodoPagoId,
          monto: pago.valor,
          createdBy: adminId,
          updatedBy: adminId,
        })),
      },
    },
  })

  revalidatePath('/')
  return sale
}

export async function deleteSale(saleId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.transaction.deleteMany({
      where: { ventaId: saleId },
    })
    await tx.saleItem.deleteMany({
      where: { ventaId: saleId },
    })
    await tx.sale.delete({
      where: { id: saleId },
    })
  })
  revalidatePath('/')
}

export async function updateClient(id: string, data: ClientFormData) {
  const adminId = await getAdminId()
  const { cedula, nombre, telefono, correo } = data

  await prisma.client.update({
    where: { id },
    data: { cedula, nombre, telefono, correo, updatedBy: adminId },
  })

  revalidatePath('/')
  revalidatePath('/admin/clientes')
}

export async function deleteClient(id: string) {
  await prisma.client.delete({
    where: { id },
  })

  revalidatePath('/')
  revalidatePath('/admin/clientes')
}

export async function updateSeller(id: string, data: SellerFormData) {
  const adminId = await getAdminId()
  await prisma.seller.update({
    where: { id },
    data: { nombre: data.nombre, updatedBy: adminId },
  })
  revalidatePath('/')
  revalidatePath('/admin/vendedores')
}

export async function deleteSeller(id: string) {
  await prisma.seller.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/vendedores')
}

export async function updateProduct(id: string, data: ProductFormData) {
  const adminId = await getAdminId()
  await prisma.product.update({
    where: { id },
    data: {
      nombre: data.nombre,
      precio: Number(data.precio) || 0,
      precio_minimo: Number(data.precio_minimo) || 0,
      updatedBy: adminId,
    },
  })
  revalidatePath('/')
  revalidatePath('/admin/productos')
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/productos')
}

export async function createClientAdmin(data: ClientFormData) {
  const adminId = await getAdminId()
  const { cedula, nombre, telefono, correo } = data
  await prisma.client.create({
    data: { cedula, nombre, telefono, correo, createdBy: adminId, updatedBy: adminId },
  })
  revalidatePath('/admin/clientes')
}

export async function createSellerAdmin(data: SellerFormData) {
  const adminId = await getAdminId()
  await prisma.seller.create({ data: { nombre: data.nombre, createdBy: adminId, updatedBy: adminId } })
  revalidatePath('/admin/vendedores')
}

export async function createProductAdmin(data: ProductFormData) {
  const adminId = await getAdminId()
  await prisma.product.create({
    data: {
      nombre: data.nombre,
      precio: Number(data.precio) || 0,
      precio_minimo: Number(data.precio_minimo) || 0,
      createdBy: adminId,
      updatedBy: adminId,
    },
  })
  revalidatePath('/admin/productos')
}

export async function createPaymentMethodAdmin(data: PaymentMethodFormData) {
  const adminId = await getAdminId()
  await prisma.paymentMethod.create({ data: { nombre: data.nombre, createdBy: adminId, updatedBy: adminId } })
  revalidatePath('/admin/metodos_pago')
}

export async function updatePaymentMethod(id: string, data: PaymentMethodFormData) {
  const adminId = await getAdminId()
  await prisma.paymentMethod.update({
    where: { id },
    data: { nombre: data.nombre, updatedBy: adminId },
  })
  revalidatePath('/admin/metodos_pago')
}

export async function deletePaymentMethod(id: string) {
  await prisma.paymentMethod.delete({ where: { id } })
  revalidatePath('/admin/metodos_pago')
}
