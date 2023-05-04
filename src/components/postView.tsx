import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 p-4">
      <Link
        href={`/user/@${
          author.username ? author.username : author.externalUsername
        }`}
      >
        <Image
          src={author.profileImageUrl}
          className="h-11 w-11 rounded-full"
          alt={`@${
            author.username ? author.username : author.externalUsername
          }'s profile picture`}
          width={44}
          height={44}
        />
      </Link>

      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link
            href={`/user/@${
              author.username ? author.username : author.externalUsername
            }`}
          >
            <span>{`@${
              author.username ? author.username : author.externalUsername
            } `}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};
