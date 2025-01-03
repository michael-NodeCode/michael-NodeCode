import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function NodeDynamic() {
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');

    if (id) {
      router.replace(`/node/${id}`);
    } else {
      router.replace('/');
    }
  }, [router]);

  return (
    <div>
      <p>Loading...</p>
    </div>
  );
}
