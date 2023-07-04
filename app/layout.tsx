import Header from '@/components/header'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <head>
        <title>Delta Δ</title>
        <meta name='description' content='Påmeldingsapp'/>
      </head>
      <body className='min-h-screen flex flex-col'>
        <Header />
        {children}
      </body>
    </html>
  )
}
