import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-serif text-8xl font-bold text-brand-100 mb-4">404</p>
      <h1 className="font-serif text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>
      <p className="text-gray-400 mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/" className="px-7 py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition-colors">
        Go Back Home
      </Link>
    </div>
  );
}
