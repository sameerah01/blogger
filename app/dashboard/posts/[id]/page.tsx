// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PostEditForm from '@/components/post-edit-form';

export async function generateStaticParams() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id');

    if (error) console.log('abcd', error);
    ;

    console.log('Fetched post IDs:', posts);

    return posts?.map((post) => ({
      id: post.id
    }));
  } catch (error) {
    console.error('Error fetching post IDs:', error);
    return [];
  }
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  // Fetch the post data server-side
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !post) {
    redirect('/dashboard/posts');
  }

  // You'll need to convert interactive elements to client components
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Post</h1>
      {/* Most of the form will need to be converted to client components */}
      <PostEditForm initialPost={post} />
    </div>
  );
}

