import {
  SignInButton,
  SignOutButton,
  useUser,
  SignedIn,
  SignedOut,
  UserProfile,
  UserButton,
} from "@clerk/nextjs";

import { dark } from "@clerk/themes";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";

dayjs.extend(relativeTime);

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <LoadingPage size={45} />;

  if (!data) return <div>Something went wrong 😒</div>;

  return (
    <div className="flex max-h-[85vh] flex-col gap-8 overflow-y-scroll p-4">
      {[...data].map((postWithUser) => (
        <PostView {...postWithUser} key={postWithUser.post.id}></PostView>
      ))}
    </div>
  );
};

const CreatePost = () => {
  const { user, isLoaded: userLoaded } = useUser();
  if (!user || !userLoaded) return <LoadingPage />;
  const [userInput, setUserInput] = useState("");
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setUserInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError(error, variables, context) {
      setUserInput("");
      const errorMessages = error.data?.zodError?.fieldErrors.content;
      if (errorMessages && errorMessages[0]) {
        toast.error(errorMessages[0], { position: "bottom-center" });
      } else {
        toast.error("Failed to post! Try again later", {
          position: "bottom-center",
        });
      }
    },
  });
  return (
    <div className="flex w-full items-center gap-14">
      <input
        type="text"
        className="grow  border-b-2 border-zinc-800 bg-transparent  p-2 focus:outline-none"
        placeholder="Type some emojis"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (userInput !== "") {
              mutate({ content: userInput });
            }
          }
        }}
        disabled={isPosting}
      />
      {userInput !== "" && (
        <button
          type="button"
          className="flex items-center rounded-lg bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-5 py-2 text-center text-base font-bold text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-800"
          onClick={() => mutate({ content: userInput })}
          disabled={isPosting}
        >
          {isPosting && <LoadingSpinner size={16}></LoadingSpinner>}
          Post
        </button>
      )}
      {/* TODO HANDLE RESPONSIVENESS */}
      <UserButton
        appearance={{
          baseTheme: dark,
          elements: {
            userButtonAvatarBox: {
              width: 48,
              height: 48,
            },
          },
        }}
      />
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

// TODO ADD ALT FOR IMAGES
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex flex-row gap-5">
      <Image
        src={author.profileImageUrl}
        alt="user profile picture"
        className="h-9 w-9 rounded-full"
        width={36}
        height={36}
      />
      <div key={post.id} className="flex flex-col">
        <div className="flex flex-row gap-1 text-sm xs:text-base">
          <span>{author?.username ? author.username : author.fullname}</span>
          <span className="font-thin text-zinc-300">
            {`· ${dayjs(post.createdAt).fromNow()}`}
          </span>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  // start fetching first
  api.posts.getAll.useQuery();
  return (
    <>
      <Head>
        <title>Cheep🦩</title>
        <meta
          name="description"
          content="Just a random website to post emojis"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SignedIn>
        <header className="p-2">
          <div className="container mx-auto flex  flex-row items-center justify-between gap-14 py-5">
            <span className="hidden whitespace-nowrap text-xl md:block">
              Cheep🦩
            </span>
            <CreatePost></CreatePost>
          </div>
        </header>
      </SignedIn>
      <main className="overflow-none">
        <div className="h-full w-full">
          <SignedOut>
            <div>
              {" "}
              <SignInButton mode="modal">
                <div className="flex items-center justify-end py-4">
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                  >
                    Sign in
                  </button>
                </div>
              </SignInButton>
            </div>
          </SignedOut>
          <Feed></Feed>
        </div>
      </main>
    </>
  );
};

export default Home;
