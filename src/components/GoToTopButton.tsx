"use client";

export default function GoToTopButton() {
  const handleClick = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-950 dark:text-slate-200 dark:hover:bg-gray-900"
      aria-label="Go to top"
      title="Go to top"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2]" aria-hidden="true">
        <path d="M12 19V5" strokeLinecap="round" />
        <path d="m6 11 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
