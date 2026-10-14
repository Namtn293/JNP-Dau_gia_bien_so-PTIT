import { useAppContext } from "@shared/context/AppContext";

export const useGetPermision = (ROLE_PAGE: string) => {
  const { permission } = useAppContext();
  const permisionArr = permission?.quyens?.find((item) => item?.nhomQuyen === ROLE_PAGE)?.quyens ?? [];
  const isGrant =  (quyen:string) => permisionArr?.includes(quyen);
  return {
    permisionArr,
    isGrant
  }
}
export default useGetPermision;