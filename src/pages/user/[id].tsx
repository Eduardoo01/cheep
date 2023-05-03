import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import Image from "next/image";
const UserFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      <span className="pb-2 pl-4 font-thin">{data.length} emojis posted</span>
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const UserPage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isError } = api.profile.getUserByUsername.useQuery({
    username,
  });
  if (!data || isError)
    return (
      <div>
        {toast.error("Sorry, no user was found!", {
          position: "bottom-center",
        })}
      </div>
    );
  return (
    <>
      <Head>
        <title>{data.username ?? data.externalUsername}</title>
      </Head>
      <Layout>
        <Image
          src={data.profileImageUrl}
          alt={`${
            data.username ?? data.externalUsername ?? "unknown"
          }'s profile pic`}
          width={128}
          height={128}
          className="-mb-[64px] ml-4 mt-4 rounded-full border-4 border-black bg-black"
        />

        <div className="h-[64px]"></div>
        <div className="p-4 pb-0 text-2xl font-bold">{`@${
          data.username ?? data.externalUsername ?? "unknown"
        }`}</div>
        <UserFeed userId={data.id} />
      </Layout>
    </>
  );
};

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { Layout } from "~/components/layout";
import { LoadingSpinner } from "~/components/loading";
import { PostView } from "~/components/postView";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });
  console.log("CONTEXT", context);
  const slug = context.params?.id;
  if (typeof slug !== "string") throw new Error("error: no slug");
  const username = slug.replace("@", "");
  await ssg.profile.getUserByUsername.prefetch({ username });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default UserPage;
