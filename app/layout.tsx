import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css' // FIX: Point to file in app/ folder

// FIX: Define the CSS variable so Tailwind can read it
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FitDay AI',
  description: 'Your personal fitness and lifestyle assistant',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // FIX: Inject the variable into the HTML tag
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-slate-950 text-white">
        {children}
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered: ', registration);
                    },
                    function(err) {
                      console.log('SW registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}