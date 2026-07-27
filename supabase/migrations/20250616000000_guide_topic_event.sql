-- Allow guide portfolio topic analytics events
alter table public.portfolio_events drop constraint if exists portfolio_events_event_type_check;

alter table public.portfolio_events add constraint portfolio_events_event_type_check
  check (
    event_type in (
      'page_view',
      'section_view',
      'project_click',
      'cv_download',
      'contact_submit',
      'game_win',
      'game_score_submit',
      'lang_switch',
      'theme_switch',
      'guide_topic'
    )
  );
