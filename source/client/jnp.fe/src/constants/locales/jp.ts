import { en_quanTriHeThong } from "@/apps/admin/constants/locales";
import jp_auth from "@/apps/auth/constants/locales/jp";

export const jp = {
  items_per_page: "件 / ページ",
  total_items: "{{total}} 件中 {{from}}-{{to}} 件",
  ...en_quanTriHeThong,
  ...jp_auth,
};
export default jp;
