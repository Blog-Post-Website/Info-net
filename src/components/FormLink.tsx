import type { ReactNode } from "react";

type FormLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  title?: string;
};

export default function FormLink({ href, className, children, title }: FormLinkProps) {
  return (
    <form action={href} method="get" className="contents">
      <button type="submit" title={title} className={className}>
        {children}
      </button>
    </form>
  );
}
