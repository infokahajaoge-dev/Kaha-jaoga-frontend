import { redirect } from "next/navigation";

/** Legacy path — wishlist UI lives at /wishlist */
export default function WishlistApiPageRedirect() {
  redirect("/wishlist");
}
