"use client";

import Link from "next/link";
import { Github, Twitter, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold">
                NX
              </div>
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-600">
                NexusX
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              A secure and user-friendly cryptocurrency exchange platform with
              advanced trading features and global accessibility.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/markets"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Markets
                </Link>
              </li>
              <li>
                <Link
                  href="/trade/btc-usdt"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Spot Trading
                </Link>
              </li>
              <li>
                <Link
                  href="/futures"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Futures
                </Link>
              </li>
              <li>
                <Link
                  href="/staking"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Staking
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/wallet"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Wallet
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="/fees"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Fees
                </Link>
              </li>
              <li>
                <Link
                  href="/referral"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Referral Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} NexusX. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-6">
              <Link
                href="/terms"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookies"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-primary/30 hover:bg-primary/10"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Back to Top
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
