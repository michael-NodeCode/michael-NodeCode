'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Components
import { Footer, Header } from '@components/index';
import Sidebar from '@components/sidebar';
import { invoke } from '@tauri-apps/api/core';
import logging from '@utils/logger';

// BlockNode Editors
const MainEditor = dynamic(() => import('@sections/maineditor'), {
  ssr: false,
});
const NewEditor = dynamic(() => import('@sections/neweditor'), {
  ssr: false,
});

// const AppWithNoSSR = dynamic(() => import('./App'), { ssr: false });

// Types
type BlockContent = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles: Record<string, any>;
  text: string;
  type: string;
};

type Block = {
  block_content: BlockContent[] | null;
  block_id: string;
  block_styles: {
    backgroundColor: string;
    textAlignment: string;
    textColor: string;
  } | null;
  block_type: string;
};

type Data = {
  blocks: Block[];
  heading: string;
  subheading: string;
};

type RequiredInitialBlocks = {
  content: string;
  type: string;
};
export default function Home() {
  const nodeHeading = '2024';
  const nodeSubHeading = 'December 5';
  const [initialBlocks, setInitialBlocks] = useState<RequiredInitialBlocks[]>(
    []
  );

  useEffect(() => {
    logging.info(
      'Fetching Data from backend ' + nodeHeading + ' ' + nodeSubHeading
    );
    const getData = async () => {
      if (nodeHeading && nodeSubHeading) {
        try {
          const resp = await invoke('get_node', {
            heading: nodeHeading,
            subheading: nodeSubHeading,
          });
          const res: Data = JSON.parse(resp as string, (key, value) => {
            if (key === 'block_content') {
              return value === 'null' ? null : JSON.parse(value);
            } else if (key === 'block_styles') {
              return value === 'null' ? null : JSON.parse(value);
            }
            return value;
          });
          const filteredBlocks = res.blocks.filter((block) => block.block_id);
          const requiredInitialBlocks: RequiredInitialBlocks[] = [];

          filteredBlocks.forEach((block) => {
            if (block.block_content && block.block_content.length > 0) {
              const firstContent = block.block_content[0];
              if (firstContent.text) {
                const blockType = block.block_type;
                const textContent = firstContent.text;

                logging.info(`block_type: ${blockType}`);
                logging.info(`text: ${textContent}`);

                requiredInitialBlocks.push({
                  content: textContent,
                  type: blockType,
                });
              } else {
                requiredInitialBlocks.push({
                  content: '',
                  type: block.block_type,
                });
              }
            }
          });

          setInitialBlocks(requiredInitialBlocks);

          logging.info(
            'Initial blocks: \n' +
              JSON.stringify(requiredInitialBlocks, null, 2)
          );
        } catch (error) {
          console.error('Error getting data from backend:', error);
        }
      }
    };

    getData();
  }, [nodeHeading, nodeSubHeading]);

  // return <AppWithNoSSR />;
  return (
    <div className="max-w-[100vw] h-screen overflow-hidden overflow-y-auto justify-start items-center relative bg-black">
      <Header heading={nodeHeading} subHeading={nodeSubHeading} />
      <Sidebar />
      <div className="bg-black min-h-screen w-full flex px-[4.8rem] max-sm:px-0 pb-0 py-[4.8rem] pr-0 text-white">
        <div className="border-2 border-solid border-white w-full p-4 pt-0 rounded-lg text-body">
          {initialBlocks.length > 0 ? (
            <MainEditor
              heading={nodeHeading}
              subHeading={nodeSubHeading}
              initialBlocks={initialBlocks}
            />
          ) : (
            <React.Fragment>
              <NewEditor heading={nodeHeading} subHeading={nodeSubHeading} />
            </React.Fragment>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// original blocknote code
// 'use client';
// import React, { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';

// // Components
// import { Footer, Header } from '@components/index';
// import Sidebar from '@components/sidebar';
// import { invoke } from '@tauri-apps/api/core';
// import logging from '@utils/logger';

// // BlockNode Editors
// const MainEditor = dynamic(() => import('@sections/maineditor'), {
//   ssr: false,
// });
// const NewEditor = dynamic(() => import('@sections/neweditor'), {
//   ssr: false,
// });

// // Types
// type BlockContent = {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   styles: Record<string, any>;
//   text: string;
//   type: string;
// };

// type Block = {
//   block_content: BlockContent[] | null;
//   block_id: string;
//   block_styles: {
//     backgroundColor: string;
//     textAlignment: string;
//     textColor: string;
//   } | null;
//   block_type: string;
// };

// type Data = {
//   blocks: Block[];
//   heading: string;
//   subheading: string;
// };

// type RequiredInitialBlocks = {
//   content: string;
//   type: string;
// };
// export default function Home() {
//   const nodeHeading = '2024';
//   const nodeSubHeading = 'December 5';
//   const [initialBlocks, setInitialBlocks] = useState<RequiredInitialBlocks[]>(
//     []
//   );

//   useEffect(() => {
//     logging.info(
//       'Fetching Data from backend ' + nodeHeading + ' ' + nodeSubHeading
//     );
//     const getData = async () => {
//       if (nodeHeading && nodeSubHeading) {
//         try {
//           const resp = await invoke('get_node', {
//             heading: nodeHeading,
//             subheading: nodeSubHeading,
//           });
//           const res: Data = JSON.parse(resp as string, (key, value) => {
//             if (key === 'block_content') {
//               return value === 'null' ? null : JSON.parse(value);
//             } else if (key === 'block_styles') {
//               return value === 'null' ? null : JSON.parse(value);
//             }
//             return value;
//           });
//           const filteredBlocks = res.blocks.filter((block) => block.block_id);
//           const requiredInitialBlocks: RequiredInitialBlocks[] = [];

//           filteredBlocks.forEach((block) => {
//             if (block.block_content && block.block_content.length > 0) {
//               const firstContent = block.block_content[0];
//               if (firstContent.text) {
//                 const blockType = block.block_type;
//                 const textContent = firstContent.text;

//                 logging.info(`block_type: ${blockType}`);
//                 logging.info(`text: ${textContent}`);

//                 requiredInitialBlocks.push({
//                   content: textContent,
//                   type: blockType,
//                 });
//               } else {
//                 requiredInitialBlocks.push({
//                   content: '',
//                   type: block.block_type,
//                 });
//               }
//             }
//           });

//           setInitialBlocks(requiredInitialBlocks);

//           logging.info(
//             'Initial blocks: \n' +
//               JSON.stringify(requiredInitialBlocks, null, 2)
//           );
//         } catch (error) {
//           console.error('Error getting data from backend:', error);
//         }
//       }
//     };

//     getData();
//   }, [nodeHeading, nodeSubHeading]);

//   return (
//     <div className="max-w-[100vw] h-screen overflow-hidden overflow-y-auto justify-start items-center relative bg-black">
//       <Header heading={nodeHeading} subHeading={nodeSubHeading} />
//       <Sidebar />
//       <div className="bg-black min-h-screen w-full flex px-[4.8rem] max-sm:px-0 pb-0 py-[4.8rem] pr-0 text-white">
//         <div className="border-2 border-solid border-white w-full p-4 pt-0 rounded-lg text-body">
//           {initialBlocks.length > 0 ? (
//             <MainEditor
//               heading={nodeHeading}
//               subHeading={nodeSubHeading}
//               initialBlocks={initialBlocks}
//             />
//           ) : (
//             <React.Fragment>
//               <NewEditor heading={nodeHeading} subHeading={nodeSubHeading} />
//             </React.Fragment>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// }
