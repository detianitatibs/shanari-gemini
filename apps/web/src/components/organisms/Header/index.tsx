import { FC } from 'react';
import Link from 'next/link';
import Logo from '@/components/atoms/Logo';
import Icon from '@/components/atoms/Icon';

const Header: FC = () => {
  return (
    <header className="bg-zinc-200">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-8">
          <Link href="/" passHref className="text-zinc-800">
            <Logo />
          </Link>
          <nav className="hidden md:flex space-x-6 text-zinc-700 font-medium">
            <Link href="/blog" className="hover:text-indigo-400 transition-colors">
              Blog
            </Link>
            <Link href="/profile" className="hover:text-indigo-400 transition-colors">
              Profile
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/profile" passHref>
              <Icon name="UserIcon" className="h-6 w-6 text-zinc-700 hover:text-indigo-400 transition-colors" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;