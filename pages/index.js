import Head from "next/head";
import Link from "next/link";
import { AmplifySignOut } from "@aws-amplify/ui-react";
import styles from "../styles/Home.module.css";

export default function Home({ user }) {
  return (
    <div className="container mx-auto">
      <Head>
        <title>AWS AI/ML Demo's</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="flex justify-between items-center p-2">
        <div className="text-2xl">
          <Link href="/">AWS AI/ML Demo's</Link>
        </div>
        <div>{user && <AmplifySignOut />}</div>
      </nav>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to AWS AI/ML Demo's</h1>
      </main>

      <footer className={styles.footer}>Made by &#128062;&#128062;</footer>
    </div>
  );
}

/*
        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
*/
