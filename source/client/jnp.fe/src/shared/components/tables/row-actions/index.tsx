import type { ReactNode } from 'react';
import { RowActionButton, RowButtonGroup } from './styled';

interface IActions {
  onClick: () => {};
  icon: ReactNode;
}

export interface IRowActions {
  actions: IActions[];
}

const RowActions = ({ actions }: IRowActions) => {
  return (
    <RowButtonGroup className="row-actions">
      {actions.map((action, index) => (
        <RowActionButton key={index} onClick={action.onClick}>
          {action.icon}
        </RowActionButton>
      ))}
    </RowButtonGroup>
  );
};

export default RowActions;
