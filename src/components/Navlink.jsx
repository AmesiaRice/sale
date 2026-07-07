"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Navlink = ({
  href,
  children,
  className = "",
  style = {},
  onClick,
}) => {
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        ${className}
        ${
          isActive
            ? "opacity-100 font-black scale-[1.02]"
            : "opacity-70 hover:opacity-100"
        }
      `}
      style={style}
    >
      {children}
    </Link>
  );
};

export default Navlink;