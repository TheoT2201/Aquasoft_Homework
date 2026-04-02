import { AuthProvider } from '../context/AuthContext';
import { Courier_Prime, Roboto } from 'next/font/google';
import './globals.css';

const courier = Courier_Prime({
  weight: ['400', '700'], 
  subsets: ['latin'],
  variable: '--font-courier',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['400', '500', '700'], 
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata = { title: 'Hotel Starwards' };
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${courier.variable} ${roboto.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}