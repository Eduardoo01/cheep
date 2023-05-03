import { type AppType } from "next/app";
import { api } from "~/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { useRouter } from "next/router";
import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Cheep🦩</title>
        <meta
          name="description"
          content="Just a random website to post emojis"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster></Toaster>
      <Component key={router.asPath} {...pageProps} />
      <Analytics />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
