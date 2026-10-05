import { createContext, useContext, useState, useEffect } from 'react';
import type { IRoleUser } from '@shared/services/type';
import { useQuyenUserQuery } from '@shared/services/query'

type TContext = {
  children: React.ReactNode;
};
type TAppContext = {
  permission: IRoleUser | null | undefined,

}
const đefaultValue = {
  permission: null
}
export const AppContext = createContext<TAppContext>(đefaultValue);
export const AppContextConsumer = AppContext.Consumer;

export const useAppContext = () => useContext(AppContext);

const AppContextProvider =  ({ children }:TContext) => {
  const [permission, setPermission] = useState<IRoleUser|null|undefined>(đefaultValue?.permission);
  const { data } = useQuyenUserQuery({options: { staleTime: 0}});
  
  useEffect(() => {
    if(!data?.success) return;

    setPermission(data?.data);
  }, [data]);

  return (
    <AppContext.Provider  value={{ permission }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;