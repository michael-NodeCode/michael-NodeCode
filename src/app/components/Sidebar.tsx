'use client';

import { useEffect, useState } from 'react';
import { Doc } from '@blocksuite/store';
import { useEditor } from '../editor/context';
import Image from 'next/image';
import { navLinks } from '@constants/index';
import { FaCircle } from 'react-icons/fa6';
import { RxCross2 } from 'react-icons/rx';

const Sidebar = () => {
  const [toggle, setToggle] = useState(false);
  const [active, setActive] = useState('');
  const { provider, editor } = useEditor()!;
  const [docs, setDocs] = useState<Doc[]>([]);


  useEffect(() => {
    if (!provider || !editor) return;
    const { collection } = provider;
    const updateDocs = () => {
      const docs = [...collection.docs.values()].map(blocks => blocks.getDoc());
      setDocs(docs);
    };
    updateDocs();

    const disposable = [
      collection.slots.docUpdated.on(updateDocs),
      editor.slots.docLinkClicked.on(updateDocs),
    ];

    return () => disposable.forEach(d => d.dispose());
  }, [provider, editor]);

  return (
    <aside
      className={`h-screen w-max max-w-[72px] px-1 pb-4 pt-20 bg-secondary fixed top-0 left-0 z-10 text-secondary flex flex-col justify-start items-center transition-all duration-300 ease-in-out max-xs:hidden max-sm:hidden`}
    >
      <div className="flex flex-col justify-between items-center text-inherit h-full w-full">
        <div className="flex flex-col items-center w-full">
          <span className="flex flex-col justify-start items-center text-center space-y-6">
            <Image
              src={'/images/calendar.png'}
              width={72}
              height={72}
              alt="Toggle Menu"
              className="w-10 h-10 object-contain rounded-lg cursor-pointer"
            />
            <Image
              src={'/images/library.png'}
              width={72}
              height={72}
              alt="Toggle Menu"
              className="w-10 h-10 object-contain rounded-lg cursor-pointer"
            />
          </span>
          <div className="flex w-full h-full flex-col justify-start items-center">
            <div className="text-primary font-bold items-center text-center text-xl my-2">
              Nodes
            </div>
            <div className="min-h-4 opacity-100 font-bold text-primary w-full text-sm">
              {docs.map((doc) => (
                <div
                  className={`${
                    editor?.doc === doc
                      ? 'bg-primary text-secondary px-1 w-full truncate'
                      : ''
                  }`}
                  key={doc.id}
                  onClick={() => {
                    if (editor) editor.doc = doc;
                    const docs = [...provider!.collection.docs.values()].map(blocks =>
                      blocks.getDoc()
                    );
                    setDocs(docs);
                  }}
                >
                  {doc.meta?.title || 'Untitled'}
                </div>
              ))}
            </div>
          </div>
        </div>
        <Image
          src={'/images/profile.png'}
          width={72}
          height={72}
          alt="Toggle Menu"
          className="w-10 h-10 object-contain rounded-lg cursor-pointer mb-6"
          onClick={() => setToggle(!toggle)}
        />
        <div
          className={`${
            !toggle ? 'hidden' : 'flex'
          } p-6 bg-black shadow-primary w-full text-inherit fixed top-16 right-0 min-h-[100vh] my-2 min-w-[100vw] z-[999999] overflow-hidden`}
        >
          <ul className="list-none flex justify-start flex-1 flex-col gap-8 mt-16 items-center">
            {navLinks.map((nav) => (
              <li
                key={nav.id}
                className={`font-poppins font-medium cursor-pointer text-heading ${
                  active === nav.title ? '' : 'text-inherit'
                }`}
                onClick={() => {
                  setToggle(!toggle);
                  setActive(nav.title);
                }}
              >
                <a href={`${nav.id}`}>{nav.title}</a>
              </li>
            ))}
            <li className="flex flex-row justify-center items-center text-center space-x-2 font-poppins font-medium cursor-pointer text-heading">
              <span>Connection</span>{' '}
              <FaCircle className={`text-green-500 text-xl mt-2`} />
            </li>
            <li
              className="text-heading font-bold"
              onClick={() => {
                setToggle(false);
              }}
            >
              <RxCross2 className={`text-red-500`} />
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
