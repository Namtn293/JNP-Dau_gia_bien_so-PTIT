import { en_quanTriHeThong } from "@/apps/admin/constants/locales";
import kr_auth from "@/apps/auth/constants/locales/kr";

export const kr = {
  items_per_page: "페이지당 항목 수",
  total_items: "전체 {{total}}개 중 {{from}}-{{to}}",
  ...en_quanTriHeThong,
  ...kr_auth,
};
export default kr;
