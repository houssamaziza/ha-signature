import { revalidatePath } from "next/cache";

/** Après chaque modification depuis l'administration, le site public est régénéré. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
