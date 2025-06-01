// import type React from "react"
// import { Inter } from "next/font/google"
// import "./globals.css"
// import Header from "@/components/layout/header"
// import Footer from "@/components/layout/footer"
// import { ThemeProvider } from "@/components/theme-provider"

// const inter = Inter({ subsets: ["latin"] })

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <title>NexusX | Modern Cryptocurrency Exchange</title>
//         <meta name="description" content="A secure and user-friendly cryptocurrency exchange platform" />
//       </head>
//       <body className={inter.className}>
//         <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
//           <div className="flex flex-col min-h-screen">
//             <Header />
//             <main className="flex-1">{children}</main>

//           </div>
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }

"use client";
import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { RecoilRoot } from "recoil";
import AuthProvider from "@/components/auth/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>NexusX | Modern Cryptocurrency Exchange</title>
        <meta
          name="description"
          content="A secure and user-friendly cryptocurrency exchange platform"
        />
      </head>
      <body className={inter.className}>
        <RecoilRoot>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </RecoilRoot>
      </body>
    </html>
  );
}
