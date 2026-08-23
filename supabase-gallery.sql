-- Run this in the Supabase SQL editor for the chef landing gallery.

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid()
);

alter table public.gallery_images enable row level security;

drop policy if exists "Gallery images are public" on public.gallery_images;
create policy "Gallery images are public"
on public.gallery_images
for select
using (true);

drop policy if exists "Authenticated users can add gallery images" on public.gallery_images;
create policy "Authenticated users can add gallery images"
on public.gallery_images
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "Authenticated users can delete their gallery images" on public.gallery_images;
create policy "Authenticated users can delete their gallery images"
on public.gallery_images
for delete
to authenticated
using (auth.uid() = created_by);

insert into storage.buckets (id, name, public)
values ('chef-gallery', 'chef-gallery', true)
on conflict (id) do update set public = true;

drop policy if exists "Gallery photos are public" on storage.objects;
create policy "Gallery photos are public"
on storage.objects
for select
using (bucket_id = 'chef-gallery');

drop policy if exists "Authenticated users can upload gallery photos" on storage.objects;
create policy "Authenticated users can upload gallery photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'chef-gallery');

drop policy if exists "Authenticated users can delete own gallery photos" on storage.objects;
create policy "Authenticated users can delete own gallery photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'chef-gallery' and owner = auth.uid());
