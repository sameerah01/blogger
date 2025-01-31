'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
}

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function TagInput({ value = [], onChange }: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (value.length) {
      fetchSelectedTags();
    }
  }, [value]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchSelectedTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .in('id', value);

      if (error) throw error;
      setSelectedTags(data || []);
    } catch (error) {
      console.error('Error fetching selected tags:', error);
    }
  };

  const handleSelect = (tagId: string) => {
    if (!value.includes(tagId)) {
      onChange([...value, tagId]);
    }
    setOpen(false);
  };

  const handleRemove = (tagId: string) => {
    onChange(value.filter(id => id !== tagId));
  };

  const filteredTags = tags.filter(tag => 
    !value.includes(tag.id) &&
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="secondary">
            {tag.name}
            <button
              className="ml-1 hover:bg-muted rounded-full"
              onClick={() => handleRemove(tag.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Command className="border rounded-md">
        <CommandInput
          placeholder="Search tags..."
          value={search}
          onValueChange={setSearch}
          onFocus={() => setOpen(true)}
        />
        {open && (
          <CommandGroup className="max-h-40 overflow-auto">
            {filteredTags.length === 0 && (
              <CommandEmpty>No tags found.</CommandEmpty>
            )}
            {filteredTags.map((tag) => (
              <CommandItem
                key={tag.id}
                value={tag.name}
                onSelect={() => handleSelect(tag.id)}
              >
                {tag.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </Command>
    </div>
  );
}