# Tubini Register

Registro de contactos conectado a Twenty. La aplicación permite crear contactos y consultarlos desde un dashboard con búsqueda por nombre/teléfono y filtro por estado.

## Configuración

Copia `.env.example` a `.env.local` y completa:

```env
TWENTY_API_URL=https://tu-api.tudominio.com/rest
TWENTY_API_KEY=tu_api_key_secreta_de_twenty
```

Los estados disponibles son `Cliente-Dueño`, `Cliente-Comprador`, `Pendiente` y `Descartado`. Si no se envía un estado, se usa `Pendiente`. El estado se envía a Twenty como `customFields.estado`; ese campo debe existir en la configuración de la instancia.

## Getting Started

Ejecuta el servidor de desarrollo:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) para registrar contactos. El dashboard está disponible en `/dashboard`.

Antes de publicar, valida el proyecto con `npm run lint` y `npm run build`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
