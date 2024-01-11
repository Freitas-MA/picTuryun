import { UserNav } from "../common/user-nav";
export default function UserAppHeader() {
  return (
    <header>
      <nav className="flex justify-between items-center px-4 py-2 shadow-md z-50">
        <span className="font-extrabold">
          pic<span className="font-extralight">Turyun</span>
        </span>
        <UserNav />
      </nav>
    </header>
  );
}
