import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-pos-123')

export async function proxy(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  const isSetupRoute = request.nextUrl.pathname.startsWith('/setup') // By pass para setup inicial (si existiese)

  const session = request.cookies.get('admin_session')?.value

  // Si intentamos ir al login, pero ya estamos autenticados, vamos a la caja registradora
  if (isAuthRoute) {
    if (session) {
      try {
        await jwtVerify(session, JWT_SECRET)
        return NextResponse.redirect(new URL('/', request.url))
      } catch (err) {
        // Token inválido/expirado, ignorar y continuar hacia /login
      }
    }
    return NextResponse.next()
  }

  // Proteger TODAS las demás rutas (Caja registradora "/" y panel "/admin")
  if (!isAuthRoute && !isSetupRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      await jwtVerify(session, JWT_SECRET)
      return NextResponse.next()
    } catch (err) {
      // Token inválido, rechazar acceso
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Atrapa todo EXCEPTO recursos internos de next, imágenes y la api
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
