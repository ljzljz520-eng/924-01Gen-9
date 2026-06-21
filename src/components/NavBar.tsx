import { NavLink } from 'react-router-dom';
import { Award, Settings, ListChecks } from 'lucide-react';

const links = [
  { to: '/certificates', label: '证书管理', icon: ListChecks },
  { to: '/config', label: '机构配置', icon: Settings },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 bg-cert-navy/95 backdrop-blur border-b border-cert-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="gold-seal h-9 w-9 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif-display text-cert-gold text-lg tracking-wider">
                证书管理系统
              </h1>
              <p className="text-[10px] text-cert-gold/60 -mt-0.5 tracking-widest">
                CERTIFICATE SYSTEM
              </p>
            </div>
          </NavLink>

          <nav className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-cert-gold/20 text-cert-gold border border-cert-gold/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
