import { useDrag } from 'react-dnd';
import React from 'react';
import { EnumDragDrop, type IMenuDrag } from '~/types';

const DragMenu: React.FC<IMenuDrag> = ({ id, content }) => {
  const [, drag] = useDrag(() => ({
    type: EnumDragDrop.SIDE_MENU,
    item: { id },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  return (
    <div ref={drag as any}>
      {content}
    </div>
  );
};

export default DragMenu;
