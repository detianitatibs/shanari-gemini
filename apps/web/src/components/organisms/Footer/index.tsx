import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="bg-zinc-200 py-6 mt-12">
      <div className="container mx-auto text-center text-zinc-600 text-sm">
        <p>&copy; {new Date().getFullYear()} detain_itatibs. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;