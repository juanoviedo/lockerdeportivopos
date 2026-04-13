# 🛡️ Sistema de Protección de Datos - Deportes POS

## 🚨 IMPORTANTE: Protección de Datos

**NUNCA pierdas tus datos nuevamente.** Este sistema incluye backups automáticos y sincronización entre entornos.

### ✅ Nuevos Comandos Seguros

#### Backups Automáticos
```bash
npm run backup          # Crear backup manual
```

Los backups se crean automáticamente antes de:
- `npm run dev` (desarrollo)
- `npm run build` (construcción)
- `npm run db:push` (cambios en DB)

#### Sincronización entre Entornos
```bash
# Copiar datos de local → staging (sin borrar datos existentes)
npm run sync:staging

# Copiar datos de staging → producción (sin borrar datos existentes)
npm run sync:production

# Copiar datos de local → staging (BORRANDO datos existentes en staging)
npm run sync:clear-staging

# Copiar datos de staging → producción (BORRANDO datos existentes en producción)
npm run sync:clear-production
```

#### Despliegue Seguro
```bash
# Desplegar a staging (con backup automático)
npm run deploy:staging

# Desplegar a producción (con backup automático)
npm run deploy:production
```

### 📁 Estructura de Backups

Los backups se guardan en la carpeta `backups/`:
```
backups/
├── backup_local_2026-04-13T10-30-00.json
├── backup_staging_2026-04-13T10-25-00.json
└── backup_production_2026-04-13T10-20-00.json
```

- Se mantienen automáticamente los **últimos 10 backups** por entorno
- Los backups incluyen **todos los datos**: ventas, clientes, productos, etc.

### 🔄 Flujo de Trabajo Recomendado

#### Desarrollo Local
1. Trabaja normalmente con `npm run dev`
2. Los backups se crean automáticamente
3. Prueba tus cambios

#### Sincronizar a Staging
```bash
# Una vez que tus cambios estén listos
npm run sync:staging
npm run deploy:staging
```

#### Sincronizar a Producción
```bash
# Solo cuando staging esté probado
npm run sync:production
npm run deploy:production
```

### 🚨 Comandos Peligrosos (Evitar)

**NO uses estos comandos directamente:**
- `prisma db push` → Usa `npm run db:push` (con backup)
- `prisma db push --force-reset` → **NUNCA** uses esto

### 🛟 Recuperación de Emergencia

Si algo sale mal:

1. **Revisa los backups**: `ls backups/`
2. **Restaura desde backup**: `node import_data.js` (si tienes db_backup.json)
3. **Sincroniza desde otro entorno**: `npm run sync:staging` o `npm run sync:production`

### 📊 Estados de Entornos

- **🏠 Local**: Tu entorno de desarrollo
- **☁️ Staging**: Para pruebas con datos reales
- **🚀 Producción**: Entorno final con datos de producción

**Recuerda:** Los datos fluyen de Local → Staging → Producción