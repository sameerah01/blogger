'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Editor from '@/components/editor';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import CategorySelect from '@/components/category-select';
import TagInput from '@/components/tag-input';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  status: string;
  category_id?: string;
}

interface PostEditFormProps {
  initialPost: Post;
}

export default function PostEditForm({ initialPost }: PostEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState(initialPost);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetchPostTags();
  }, []);

  const fetchPostTags = async () => {
    try {
      const { data, error } = await supabase
        .from('post_tags')
        .select('tag_id')
        .eq('post_id', post.id);

      if (error) throw error;
      setTags(data.map(pt => pt.tag_id));
    } catch (error) {
      console.error('Error fetching post tags:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update post
      const { error: postError } = await supabase
        .from('posts')
        .update({
          ...post,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      if (postError) throw postError;

      // Update tags
      const { error: deleteTagsError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', post.id);

      if (deleteTagsError) throw deleteTagsError;

      if (tags.length > 0) {
        const { error: insertTagsError } = await supabase
          .from('post_tags')
          .insert(
            tags.map(tagId => ({
              post_id: post.id,
              tag_id: tagId
            }))
          );

        if (insertTagsError) throw insertTagsError;
      }

      toast({
        title: 'Success',
        description: 'Post updated successfully',
      });
      
      router.push('/dashboard/posts');
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async (checked: boolean) => {
    try {
      const newStatus = checked ? 'published' : 'draft';
      const publishedAt = checked ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('posts')
        .update({
          status: newStatus,
          published_at: publishedAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      if (error) throw error;

      setPost(prev => ({
        ...prev,
        status: newStatus
      }));

      toast({
        title: 'Success',
        description: `Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update publish status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Post</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={post.status === 'published'}
              onCheckedChange={handlePublishToggle}
            />
            <span className="text-sm font-medium">
              {post.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Editor
                content={post.content}
                onChange={(content) => setPost({ ...post, content })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={post.excerpt}
                onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories and Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <CategorySelect
                value={post.category_id}
                onChange={(value) => setPost({ ...post, category_id: value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <TagInput
                value={tags}
                onChange={setTags}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={post.meta_title}
                onChange={(e) => setPost({ ...post, meta_title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={post.meta_description}
                onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_keywords">Meta Keywords</Label>
              <Input
                id="meta_keywords"
                value={post.meta_keywords}
                onChange={(e) => setPost({ ...post, meta_keywords: e.target.value })}
                placeholder="Separate keywords with commas"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}