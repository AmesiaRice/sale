import React from 'react'
import Link from "next/link";

const Button = ({children,href}) => {
  return (
    <div>
       <Link
            href={href}
            className="text-white text-sm font-semibold px-7 py-3 rounded-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
            style={{ backgroundColor: "var(--color-gold-500)" }}
          >
            {children}
          </Link>
    </div>
  )
}

export default Button
