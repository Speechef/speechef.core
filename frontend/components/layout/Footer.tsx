import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#141c52' }} className="mt-auto py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <span className="text-2xl font-extrabold text-white">Speechef</span>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              AI-powered speech coaching platform. Analyze, learn, practice, and get hired.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-white font-semibold">Product</span>
              <Link href="/analyze"   className="text-gray-400 hover:text-white transition-colors">Analyze</Link>
              <Link href="/learn"     className="text-gray-400 hover:text-white transition-colors">Learn</Link>
              <Link href="/practice"  className="text-gray-400 hover:text-white transition-colors">Practice</Link>
              <Link href="/jobs"      className="text-gray-400 hover:text-white transition-colors">Jobs</Link>
              <Link href="/mentors"   className="text-gray-400 hover:text-white transition-colors">Mentors</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white font-semibold">Account</span>
              <Link href="/dashboard"   className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/profile"     className="text-gray-400 hover:text-white transition-colors">My Profile</Link>
              <Link href="/settings"    className="text-gray-400 hover:text-white transition-colors">Settings</Link>
              <Link href="/notifications" className="text-gray-400 hover:text-white transition-colors">Notifications</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white font-semibold">Company</span>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">For Companies</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white font-semibold">Legal</span>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Speechef. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
