import Head from "next/head";

export default function MyHead({ title }) {
  return (
    <Head>
      <title>{title ? title : "AWS AI/ML Demo's"}</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
