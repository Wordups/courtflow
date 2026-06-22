create or replace function public.confirm_game_from_upload(
  p_org_id uuid,
  p_idempotency_key text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_game public.games;
  v_player jsonb;
  v_player_id uuid;
  v_upload_id uuid;
  v_program_id uuid := (p_payload->>'program_id')::uuid;
  v_count integer := 0;
begin
  if auth.uid() is null or not public.is_org_member(p_org_id, array['owner','admin','coach']) then
    raise exception 'membership required' using errcode = '42501';
  end if;
  if length(p_idempotency_key) < 8 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_org_id::text || ':' || p_idempotency_key, 0));

  select * into v_game from public.games
  where org_id = p_org_id and idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('game_id', v_game.id, 'stat_lines', (
      select count(*) from public.stat_lines where org_id = p_org_id and game_id = v_game.id
    ), 'idempotent_replay', true);
  end if;

  if not exists (
    select 1 from public.programs
    where org_id = p_org_id and id = v_program_id and kind = 'team' and active
  ) then
    raise exception 'program not found in organization' using errcode = '23503';
  end if;

  if p_payload ? 'upload_id' then
    v_upload_id := (p_payload->>'upload_id')::uuid;
    if not exists (
      select 1 from public.uploads
      where org_id = p_org_id and id = v_upload_id and status in ('pending','parsed')
    ) then
      raise exception 'upload is unavailable' using errcode = '23503';
    end if;
  end if;

  insert into public.games (
    org_id, program_id, game_date, opponent, us_score, them_score, result,
    tournament, source, idempotency_key, created_by
  ) values (
    p_org_id,
    v_program_id,
    nullif(p_payload->>'game_date','')::date,
    p_payload->>'opponent',
    (p_payload->>'us_score')::integer,
    (p_payload->>'them_score')::integer,
    case
      when (p_payload->>'us_score') is null or (p_payload->>'them_score') is null then null
      when (p_payload->>'us_score')::integer > (p_payload->>'them_score')::integer then 'W'
      when (p_payload->>'us_score')::integer < (p_payload->>'them_score')::integer then 'L'
      else 'T'
    end,
    p_payload->>'tournament',
    case when v_upload_id is null then 'manual' else 'upload' end,
    p_idempotency_key,
    auth.uid()
  ) returning * into v_game;

  for v_player in select value from jsonb_array_elements(coalesce(p_payload->'players', '[]'::jsonb))
  loop
    v_player_id := null;
    if v_player ? 'player_id' and nullif(v_player->>'player_id','') is not null then
      v_player_id := (v_player->>'player_id')::uuid;
      if not exists (
        select 1 from public.players
        where org_id = p_org_id and program_id = v_program_id and id = v_player_id
      ) then
        raise exception 'player not found in program' using errcode = '23503';
      end if;
    elsif v_player ? 'create_as' then
      insert into public.players (org_id, program_id, number, name, position, created_by)
      values (
        p_org_id,
        v_program_id,
        nullif(v_player#>>'{create_as,number}','')::integer,
        v_player#>>'{create_as,name}',
        v_player#>>'{create_as,position}',
        auth.uid()
      ) returning id into v_player_id;
    end if;

    if v_player_id is not null then
      insert into public.stat_lines (
        org_id, game_id, player_id, pts, fgm, fga, tpm, tpa, ftm, fta,
        oreb, dreb, reb, ast, stl, blk, tov, pf, min, plus_minus, created_by
      ) values (
        p_org_id, v_game.id, v_player_id,
        coalesce((v_player#>>'{stats,pts}')::integer,0),
        coalesce((v_player#>>'{stats,fgm}')::integer,0),
        coalesce((v_player#>>'{stats,fga}')::integer,0),
        coalesce((v_player#>>'{stats,tpm}')::integer,0),
        coalesce((v_player#>>'{stats,tpa}')::integer,0),
        coalesce((v_player#>>'{stats,ftm}')::integer,0),
        coalesce((v_player#>>'{stats,fta}')::integer,0),
        coalesce((v_player#>>'{stats,oreb}')::integer,0),
        coalesce((v_player#>>'{stats,dreb}')::integer,0),
        coalesce((v_player#>>'{stats,reb}')::integer,0),
        coalesce((v_player#>>'{stats,ast}')::integer,0),
        coalesce((v_player#>>'{stats,stl}')::integer,0),
        coalesce((v_player#>>'{stats,blk}')::integer,0),
        coalesce((v_player#>>'{stats,tov}')::integer,0),
        coalesce((v_player#>>'{stats,pf}')::integer,0),
        coalesce((v_player#>>'{stats,min}')::integer,0),
        coalesce((v_player#>>'{stats,plus_minus}')::integer,0),
        auth.uid()
      );
      v_count := v_count + 1;
    end if;
  end loop;

  if v_upload_id is not null then
    update public.uploads
    set status = 'confirmed', confirmed_game_id = v_game.id, updated_at = now()
    where org_id = p_org_id and id = v_upload_id;
  end if;

  return jsonb_build_object('game_id', v_game.id, 'stat_lines', v_count, 'idempotent_replay', false);
end;
$$;

revoke all on function public.confirm_game_from_upload(uuid, text, jsonb) from public;
grant execute on function public.confirm_game_from_upload(uuid, text, jsonb) to authenticated;
