import { AmplifySignOut } from "@aws-amplify/ui-react";
import Link from "next/link";

export default function MyNav({ user }) {
  return (
    <nav className="flex justify-between items-center p-2">
      <div className="text-2xl">
        <Link href="/">AWS AI/ML Demo's</Link>
      </div>
      <div>{user && <AmplifySignOut />}</div>
    </nav>
  );
}
