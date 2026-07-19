-- Homepage ad slider: admin-managed banner slides + storage bucket.
create table public.homepage_slides (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  headline text,
  link_url text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_slides enable row level security;

create policy "Anyone can read homepage slides"
  on public.homepage_slides for select
  using (true);

create policy "Admins can manage homepage slides"
  on public.homepage_slides for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin')));

insert into storage.buckets (id, name, public)
values ('homepage-slides', 'homepage-slides', true)
on conflict (id) do nothing;

create policy "Admins can upload homepage slide images"
  on storage.objects for insert
  with check (
    bucket_id = 'homepage-slides'
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins can update homepage slide images"
  on storage.objects for update
  using (
    bucket_id = 'homepage-slides'
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins can delete homepage slide images"
  on storage.objects for delete
  using (
    bucket_id = 'homepage-slides'
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- search_listings: add description so listing cards can show a 2-line snippet.
drop function public.search_listings(text,text,text,numeric,numeric,text,integer,text);

create function public.search_listings(
  search_query text default null,
  category_slug text default null,
  location_filter text default null,
  min_price numeric default null,
  max_price numeric default null,
  exclude_location text default null,
  p_page integer default 1,
  sort text default 'recommended'
)
returns table(
  id uuid, title text, description text, price numeric, location text, created_at timestamptz,
  category_id uuid, category_name text, category_slug text, cover_image_path text,
  is_featured boolean, bumped_at timestamptz, short_id bigint, negotiable text, total_count bigint
)
language sql stable as $function$
  with matching_categories as (
    select c.id
    from public.categories c
    where category_slug is null
      or c.slug = category_slug
      or c.parent_id = (select id from public.categories where slug = category_slug)
  )
  select
    l.id,
    l.title,
    l.description,
    l.price,
    l.location,
    l.created_at,
    cat.id as category_id,
    cat.name as category_name,
    cat.slug as category_slug,
    (
      select li.storage_path from public.listing_images li
      where li.listing_id = l.id
      order by li.position asc
      limit 1
    ) as cover_image_path,
    (l.is_featured and (l.featured_until is null or l.featured_until > now())) as is_featured,
    l.bumped_at,
    l.short_id,
    l.negotiable,
    count(*) over () as total_count
  from public.listings l
  join public.categories cat on cat.id = l.category_id
  where l.status = 'active'
    and (category_slug is null or l.category_id in (select id from matching_categories))
    and (location_filter is null or l.location = location_filter)
    and (exclude_location is null or l.location != exclude_location)
    and (min_price is null or l.price >= min_price)
    and (max_price is null or l.price <= max_price)
    and (
      search_query is null or search_query = ''
      or word_similarity(lower(search_query), lower(l.title)) > 0.25
      or l.title ilike '%' || search_query || '%'
    )
  order by
    case when sort = 'newest' then l.created_at end desc,
    case when sort = 'price_asc' then l.price end asc,
    case when sort = 'price_desc' then l.price end desc,
    case when sort not in ('newest', 'price_asc', 'price_desc') then
      (l.is_featured and (l.featured_until is null or l.featured_until > now()))
    end desc,
    case when sort not in ('newest', 'price_asc', 'price_desc') and search_query is not null and search_query != ''
      then word_similarity(lower(search_query), lower(l.title)) else 0 end desc,
    case when sort not in ('newest', 'price_asc', 'price_desc') then greatest(l.bumped_at, l.created_at) end desc,
    l.id desc
  limit 24 offset (greatest(p_page, 1) - 1) * 24;
$function$;
