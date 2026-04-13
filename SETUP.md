# 🚀 Setup Deportes POS - Guía de Configuración

## 📋 Tabla de Contenidos
1. [Configuración Local](#-configuración-local)
2. [Configuración Staging](#-configuración-staging)
3. [Configuración Producción](#-configuración-producción)
4. [Scripts Disponibles](#-scripts-disponibles)
5. [Flujo de Despliegue](#-flujo-de-despliegue)

---

## 🏠 Configuración Local

### ✅ Estado: CONFIGURADO Y FUNCIONANDO

**Servidor corriendo en:** `http://localhost:3000`

### Requisitos
- **Node.js**: v18+
- **PostgreSQL**: Corriendo en `localhost:5432`
- **Base de datos**: `deportes_pos` creada

### Variables de Ambiente (.env.local)
```env
DATABASE_URL="postgresql://postgres:123456$$$@localhost:5432/deportes_pos"
DIRECT_URL="postgresql://postgres:123456$$$@localhost:5432/deportes_pos"
JWT_SECRET="dcel-hwqp-zrgw-etxm-local"
NEXT_PUBLIC_APP_NAME="Deportes POS - Local"
ENVIRONMENT="local"
```

### Comandos Rápidos
```bash
npm run dev           # Iniciar servidor
npm run db:studio     # Abrir Prisma Studio
npm run seed          # Cargar datos iniciales
```

#### 5. Ejecuta las migraciones y setup
```bash
npm run dev:setup
```

Este comando:
- Sincroniza el schema de Prisma con tu DB
- Ejecuta el seed (si existe)

#### 6. Inicia el servidor
```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## ☁️ Configuración Staging

### ✅ Estado: CONFIGURADO CON SUPABASE

**Proyecto Supabase:** `udqqlwpdmcigfrvmqjmc`

### Variables de Ambiente (.env.staging)
```env
DATABASE_URL="postgresql://postgres.udqqlwpdmcigfrvmqjmc:LockerPos2026@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.udqqlwpdmcigfrvmqjmc:LockerPos2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
JWT_SECRET="dcel-hwqp-zrgw-etxm-staging"
NEXT_PUBLIC_APP_NAME="Deportes POS - Staging"
ENVIRONMENT="staging"
```

### Para Deploy a Staging
```bash
# Desde rama main (después de merge)
npm run deploy:staging

# O manualmente:
git push origin main:staging
```

Vercel detectará automáticamente el push y desplegará usando las variables de `.env.staging`.
```bash
npm run deploy:staging
```

Esto hace push a la rama `staging` en GitHub, que dispara el deploy automático en Vercel.

---

## 🚀 Configuración Producción

### ✅ Estado: CONFIGURADO CON SUPABASE

**Proyecto Supabase:** `qwbwpamuutknapyfbmeh`

### Variables de Ambiente (.env.production)
```env
DATABASE_URL="postgresql://postgres.qwbwpamuutknapyfbmeh:LockerPos2026@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.qwbwpamuutknapyfbmeh:LockerPos2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
JWT_SECRET="dcel-hwqp-zrgw-etxm-production-secure"
NEXT_PUBLIC_APP_NAME="Deportes POS"
ENVIRONMENT="production"
```

### Para Deploy a Producción
```bash
# Desde rama main
npm run deploy:production

# O manualmente:
git push origin main
```

Vercel detectará automáticamente el push y desplegará usando las variables de `.env.production`.

---

## 📝 Scripts Disponibles

```bash
# DESARROLLO
npm run dev                 # Inicia servidor local (puerto 3000)
npm run dev:setup         # Setup inicial: migraciones + seed

# PRISMA
npm run prisma:push       # Sincroniza schema con DB (sin migración)
npm run prisma:migrate    # Crea una nueva migración
npm run prisma:studio     # Abre Prisma Studio (GUI para DB)

# BUILD
npm run build             # Build para producción
npm run start             # Inicia servidor producción

# DEPLOY
npm run deploy:staging    # Push a rama staging
npm run deploy:production # Push a rama main

# OTROS
npm run lint              # Lint TypeScript y ESLint
npm run tunnel            # Expone servidor local a internet (para webhooks)
```

---

## 🔑 Gestión de Secretos

### Archivo `.env.local` (NUNCA SUBIR A GIT)
Ya está en `.gitignore`. Contiene secretos locales.

### Archivos `.env.staging` y `.env.production`
- **Versión local**: Contienen placeholders para testing
- **Vercel**: Las variables reales se configuran en el dashboard de Vercel

### Variables importantes
```env
JWT_SECRET              # Cambia esto en cada ambiente
EMAIL_SERVER_PASSWORD   # Password de gmail obtenido de App Passwords
DATABASE_URL            # URL de conexión con pooling
DIRECT_URL              # URL de conexión directa (para migraciones)
```

---

## 🔄 Flujo de Despliegue

### ✅ Configuración Actual

| Ambiente | Rama | Base de Datos | Estado |
|----------|------|---------------|--------|
| **Local** | `main` | PostgreSQL local | ✅ Funcionando |
| **Staging** | `staging` | Supabase (udqqlwpdmcigfrvmqjmc) | ✅ Configurado |
| **Producción** | `main` | Supabase (qwbwpamuutknapyfbmeh) | ✅ Configurado |

### 🚀 Proceso de Deploy

#### 1. Desarrollo Local
```bash
# Trabaja en rama main o feature branches
git checkout -b feature/nueva-funcionalidad

# Commit cambios
git add .
git commit -m "feat: nueva funcionalidad"

# Push a main
git checkout main
git merge feature/nueva-funcionalidad
git push origin main
```

#### 2. Deploy a Staging
```bash
# Sube los cambios de código a la rama de staging
npm run deploy:staging
```

> [!IMPORTANT]
> **Sincronización Segura de Base de Datos (Staging)**
> Vercel **ya no migra la base de datos automáticamente** para evitar el borrado accidental de columnas. Si hiciste cambios en `schema.prisma` (como agregar o quitar campos), debes aplicarlos tú mismo de forma manual a la base de datos de Staging desde tu máquina local corriendo este comando en PowerShell:
> 
> ```powershell
> $env:DATABASE_URL="postgresql://postgres.udqqlwpdmcigfrvmqjmc:LockerPos2026@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"; $env:DIRECT_URL="postgresql://postgres.udqqlwpdmcigfrvmqjmc:LockerPos2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres"; npx prisma db push --accept-data-loss
> ```
> *(Nota: El flag `--accept-data-loss` solo borra las columnas que explícitamente quitaste del `schema.prisma`, jamás borrará el resto de tablas o información).*

#### 3. Testing en Staging
- URL: `https://deportes-pos-staging.vercel.app`
- Verifica que todo funciona correctamente
- Prueba con datos de prueba

#### 4. Deploy a Producción
```bash
# Sube la versión validada a la rama principal (Production)
npm run deploy:production
```

> [!IMPORTANT]
> **Sincronización Segura de Base de Datos (Producción)**
> Al igual que en staging, si el código incluyó cambios en `schema.prisma`, debes sincronizar la base de datos real de Producción manualmente desde tu PC usando las credenciales exactas de Producción:
> 
> ```powershell
> $env:DATABASE_URL="postgresql://postgres.qwbwpamuutknapyfbmeh:LockerPos2026@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"; $env:DIRECT_URL="postgresql://postgres.qwbwpamuutknapyfbmeh:LockerPos2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres"; npx prisma db push --accept-data-loss
> ```

#### 5. Verificación
- URL: `https://deportes-pos.vercel.app`
- Verifica logs en Vercel dashboard
- Confirma que la base de datos se refleja correctamente sin caída de servicio

### ⚠️ Notas Importantes

- **Nunca** hagas push directo a `main` sin pasar por staging
- **Siempre** verifica staging antes de producción
- **¡Tus despliegues ahora son seguros!** Ningún *push* de código alterará las bases de datos remotas. Tú tienes el control al 100% de cuándo ejecutar el `db push` para adaptar el esquema.

### Error: "table does not exist"
```bash
# Sincroniza el schema
npm run prisma:push

# O abre Prisma Studio para verificar
npm run prisma:studio
```

### Error: "connection refused"
```bash
# Verifica que PostgreSQL está corriendo
psql -U postgres

# Si no funciona, reinicia PostgreSQL desde Services
```

### Error: "Could not connect to database server"
- Verifica `DATABASE_URL` en `.env.local`
- Verifica que PostgreSQL está corriendo
- Verifica credenciales (usuario/contraseña)

### Variables de ambiente no se cargan
- Reinicia el servidor: `Ctrl+C` y luego `npm run dev`
- Next.js cachea las variables al iniciar

---

## 📊 Base de Datos - Estructuras

Ver [schema.prisma](prisma/schema.prisma) para el schema completo.

**Tablas principales:**
- `Admin` - Administradores del sistema
- `Client` - Clientes
- `Product` - Productos en venta
- `Seller` - Vendedores
- `PaymentMethod` - Métodos de pago
- `Sale` - Ventas registradas
- `SaleItem` - Items dentro de cada venta
- `Transaction` - Transacciones de pago

---

## 📌 Checklist para New Developers

- [ ] PostgreSQL corriendo en local
- [ ] Base de datos `deportes_pos` creada
- [ ] `.env.local` configurado
- [ ] `npm install`
- [ ] `npm run dev:setup`
- [ ] `npm run dev` funciona
- [ ] Acceso a http://localhost:3000

---

## 🤝 Workflow de Desarrollo

```
main (producción)
 ↑
staging (pre-producción)
 ↑
feature branches (desarrollo local)

1. Crea rama local: git checkout -b feature/tu-feature
2. Desarrolla y prueba en local: npm run dev
3. Commit y push: git push origin feature/tu-feature
4. Crea PR a staging
5. Review, test en staging
6. Merge a staging (auto-deploy en Vercel staging)
7. Crea PR a main
8. Review, test confirmación
9. Merge a main (auto-deploy en Vercel producción)
```

---

## 📚 Recursos Útiles

- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
