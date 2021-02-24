import MyHead from "../components/MyHead";
import MyFooter from "../components/MyFooter";
import MyNav from "../components/MyNav";
import Link from "next/link";

export default function Home({ user }) {
  return (
    <div className="container mx-auto">
      <MyHead />
      <MyNav user={user} />

      <main className="justify-center items-center flex flex-1 flex-col">
        <h1 className="text-3xl text-center">Welcome to AWS AI/ML Demo's</h1>
        <div className="grid grid-cols-2 gap-4 text-center p-4">
          <div className="text-xl border p-4">
            <Link href="/motion_detect">
              Motion Capture and Process with Rekognition
            </Link>
          </div>
          <div className="text-xl border p-4">2</div>
          <div className="text-xl border p-4">3</div>
          <div className="text-xl border p-4">4</div>
        </div>
      </main>

      <MyFooter />
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
