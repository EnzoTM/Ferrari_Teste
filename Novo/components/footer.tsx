"use client"

import Link from "next/link"
import Image from "next/image"
import { Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/">
              <Image
                src="/placeholder.svg?height=60&width=60"
                alt="Ferrari Logo"
                width={60}
                height={60}
                className="mb-4 cursor-pointer"
              />
            </Link>
            <p className="text-sm text-gray-600">The official Ferrari miniatures store</p>
          </div>

          <div>
            <h3 className="text-lg font-medium">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/cars" className="text-sm text-gray-600 hover:text-red-600">
                  Car Miniatures
                </Link>
              </li>
              <li>
                <Link href="/formula1" className="text-sm text-gray-600 hover:text-red-600">
                  Formula 1 Miniatures
                </Link>
              </li>
              <li>
                <Link href="/helmets" className="text-sm text-gray-600 hover:text-red-600">
                  Helmets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium">Account</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/login" className="text-sm text-gray-600 hover:text-red-600">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-600 hover:text-red-600">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-gray-600 hover:text-red-600">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium">Information</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-red-600">
                  Contact
                </Link>
              </li>
              <li className="text-sm text-gray-600">
                <span className="block">ferrari.store@gmail.com</span>
              </li>
              <li className="text-sm text-gray-600">
                <span className="block">(16) 123456789</span>
              </li>
              <li className="mt-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-red-600"
                >
                  <Instagram className="mr-1 h-4 w-4" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-600 hover:text-red-600">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Ferrari Miniatures Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
