import { SideMenuProps, useComponentsContext } from '@blocknote/react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { NodeData, saveNodeData } from '@redux/nodeSlice';
import { useRouter } from 'next/navigation';
import { IoNavigateCircle } from 'react-icons/io5';

export function NavigateButton(props: SideMenuProps) {
  const Components = useComponentsContext()!;
  const dispatch = useAppDispatch();
  const router = useRouter();

  const date = useAppSelector((state) => state.date.currentDate);

  const handleNavigate = () => {
    const { block } = props;
    console.log('Navigating to block', block);
    dispatch(saveNodeData(block as unknown as NodeData));
    const title = `${date} -> ${block.id}`;
    dispatch({
      type: 'title/setTitle',
      payload: title,
    });

    router.push(`/node/${block.id}`);
  };

  return (
    <Components.SideMenu.Button
      label="navigate to block"
      icon={<IoNavigateCircle size={24} onClick={handleNavigate} />}
    />
  );
}
