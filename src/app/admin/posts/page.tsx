export default function PostsPage() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h2 className="text-2xl font-bold text-slate-900">Posts</h2>
        <p className="mt-1 text-sm text-slate-600">Manage your blog posts</p>
      </div>
      <div className="flex-1 p-8">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Coming in Phase 3: Full post editor and management</p>
        </div>
      </div>
    </div>
  );
}
