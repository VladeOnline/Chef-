-- Run this in the Supabase SQL editor for the chef landing gallery.

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 100,
  object_position text not null default 'center center',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid()
);

alter table public.gallery_images
add column if not exists object_position text not null default 'center center';

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

drop policy if exists "Authenticated users can update their gallery images" on public.gallery_images;
create policy "Authenticated users can update their gallery images"
on public.gallery_images
for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

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

create table if not exists public.chef_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating numeric(2,1) not null default 5 check (rating >= 0.5 and rating <= 5 and rating * 2 = floor(rating * 2)),
  favorite_part text not null,
  review text not null,
  created_at timestamptz not null default now()
);

alter table public.chef_reviews enable row level security;

drop policy if exists "Chef reviews are public" on public.chef_reviews;
create policy "Chef reviews are public"
on public.chef_reviews
for select
using (true);

drop policy if exists "Anyone can add chef reviews" on public.chef_reviews;
create policy "Anyone can add chef reviews"
on public.chef_reviews
for insert
to anon, authenticated
with check (
  length(trim(name)) between 2 and 120
  and length(trim(favorite_part)) between 2 and 240
  and length(trim(review)) between 5 and 1200
  and rating >= 0.5
  and rating <= 5
);

drop policy if exists "Authenticated users can delete chef reviews" on public.chef_reviews;
create policy "Authenticated users can delete chef reviews"
on public.chef_reviews
for delete
to authenticated
using (true);
