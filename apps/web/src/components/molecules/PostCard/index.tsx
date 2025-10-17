
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import Icon from '@/components/atoms/Icon';

type Category = {
  id: number;
  name: string;
};

type PostCardProps = {
  slug: string;
  title: string;
  published_at: string;
  categories: Category[];
  thumbnail_url?: string;
};

const PostCard: FC<PostCardProps> = ({
  slug,
  title,
  published_at,
  categories,
  thumbnail_url,
}) => {
  const formattedDate = new Date(published_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${slug}`} passHref>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
        <div className="relative h-48 w-full">
          <Image
            src={thumbnail_url || '/images/placeholder.svg'}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-2 text-sm text-zinc-500 mb-2">
            {categories.map(category => (
              <span key={category.id} className="bg-zinc-100 px-2 py-1 rounded-full">
                {category.name}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-bold text-zinc-800 mb-2">{title}</h3>
          <div className="flex items-center text-sm text-zinc-500">
            <Icon name="CalendarIcon" className="h-4 w-4 mr-1" />
            <time dateTime={published_at}>{formattedDate}</time>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
