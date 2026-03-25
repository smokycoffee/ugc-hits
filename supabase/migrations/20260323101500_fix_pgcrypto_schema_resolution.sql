create or replace function public.hash_invite_code(raw_code text)
returns text
language sql
immutable
as $$
  select encode(extensions.digest(public.normalize_invite_code(raw_code), 'sha256'), 'hex');
$$;

create or replace function public.generate_invite_code()
returns text
language sql
volatile
as $$
  select upper(encode(extensions.gen_random_bytes(5), 'hex'));
$$;
