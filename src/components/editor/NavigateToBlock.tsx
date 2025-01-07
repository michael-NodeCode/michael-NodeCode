import { DragHandleMenuProps, useComponentsContext } from '@blocknote/react';

export function NavigateToBlock(props: DragHandleMenuProps) {
  const Components = useComponentsContext()!;

  return (
    <Components.Generic.Menu.Item
      onClick={() => {
        console.log('Navigateing to block', props.block);
      }}
    >
      Navigate
    </Components.Generic.Menu.Item>
  );
}
