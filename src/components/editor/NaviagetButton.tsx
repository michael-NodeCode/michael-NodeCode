/* eslint-disable @typescript-eslint/no-explicit-any */
import { SideMenuProps, useComponentsContext } from '@blocknote/react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { saveNodeData } from '@redux/nodeSlice';
import type { NodeData } from '../../types/node';
import { IoNavigateCircle } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

export function NavigateButton(props: SideMenuProps) {
  const Components = useComponentsContext()!;
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const date = useAppSelector((state) => state.date.currentDate);

  const handleNavigate = () => {
    const { block } = props;
    console.log('Navigating to block', block);
    dispatch(saveNodeData(block as unknown as NodeData));
    const blockContent =
      Array.isArray(block.content) && block.content.length > 0
        ? block.content[0]
        : '';
    console.log('blockContent', blockContent);
    const blockContentText = (blockContent as any).text || block.id;
    let blockSubstring = blockContentText.substring(0, 20);
    if (blockSubstring.length < blockContentText.length) {
      blockSubstring += '...';
    }
    const title = `${date} : ${blockSubstring}`;
    dispatch({
      type: 'title/setTitle',
      payload: title,
    });
    navigate(`/node/${block.id}`);
  };

  return (
    <Components.SideMenu.Button
      label="navigate to block"
      icon={<IoNavigateCircle size={24} onClick={handleNavigate} />}
    />
  );
}
