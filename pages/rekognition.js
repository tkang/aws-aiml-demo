import MyHead from "../components/MyHead";
import MyFooter from "../components/MyFooter";
import MyNav from "../components/MyNav";

export default function Rekognition({ user }) {
  return (
    <div className="container mx-auto">
      <MyHead />
      <MyNav user={user} />

      <main>
        <h1 className="text-3xl text-center">Rekognition Demo</h1>
      </main>

      <MyFooter />
    </div>
  );
}
