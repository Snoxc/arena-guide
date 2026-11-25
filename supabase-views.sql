-- Run once in Supabase SQL Editor. No service_role key is needed on the site.
create table if not exists public.arena_chapter_totals (
  chapter_id text primary key check (chapter_id ~ '^chapter-([1-9]|1[0-5])$'),
  views bigint not null default 0 check (views >= 0)
);
create table if not exists public.arena_chapter_visits (
  chapter_id text not null references public.arena_chapter_totals(chapter_id),
  visitor uuid not null,
  visit_day date not null,
  primary key(chapter_id,visitor,visit_day)
);
insert into public.arena_chapter_totals(chapter_id)
select 'chapter-'||n from generate_series(1,15) n on conflict do nothing;
alter table public.arena_chapter_totals enable row level security;
alter table public.arena_chapter_visits enable row level security;
revoke all on public.arena_chapter_totals, public.arena_chapter_visits from anon, authenticated;
create or replace function public.arena_get_chapter_views()
returns table(chapter_id text, views bigint)
language sql stable security definer set search_path = ''
as $$ select t.chapter_id,t.views from public.arena_chapter_totals t $$;
create or replace function public.arena_record_chapter_view(p_chapter text,p_visitor uuid)
returns bigint language plpgsql security definer set search_path = '' as $$
declare total bigint;
begin
  if p_chapter is null or p_chapter !~ '^chapter-([1-9]|1[0-5])$' or p_visitor is null then raise exception 'Invalid view'; end if;
  insert into public.arena_chapter_visits(chapter_id,visitor,visit_day)
  values(p_chapter,p_visitor,(now() at time zone 'UTC')::date) on conflict do nothing;
  if found then
    update public.arena_chapter_totals t set views=t.views+1 where t.chapter_id=p_chapter returning t.views into total;
  else
    select t.views into total from public.arena_chapter_totals t where t.chapter_id=p_chapter;
  end if;
  return total;
end $$;
revoke all on function public.arena_get_chapter_views() from public;
revoke all on function public.arena_record_chapter_view(text,uuid) from public;
grant execute on function public.arena_get_chapter_views() to anon, authenticated;
grant execute on function public.arena_record_chapter_view(text,uuid) to anon, authenticated;
