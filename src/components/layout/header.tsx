import Link from "next/link";
import { signOut } from "@/src/lib/actions/auth";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  email: string;
}

export function Header({ email }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Secret Page
        </Link>

        <nav className="hidden sm:flex items-center gap-4">
          <Link
            href="/secret-page-1"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            View Secret
          </Link>
          <Link
            href="/secret-page-2"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Edit Secret
          </Link>
          <Link
            href="/secret-page-3"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Friends
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            {email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
