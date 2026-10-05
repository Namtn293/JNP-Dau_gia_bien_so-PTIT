import { en_quanTriHeThong } from "@/apps/admin/constants/locales";
import cn_auth from "@/apps/auth/constants/locales/cn";

export const cn = {
  items_per_page: "条 / 页",
  total_items: "第 {{from}}-{{to}} 条，共 {{total}} 条",
  ...en_quanTriHeThong,
  ...cn_auth,
};
export default cn;
