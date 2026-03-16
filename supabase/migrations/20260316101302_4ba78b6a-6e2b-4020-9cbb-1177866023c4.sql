CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, surname, first_name, middle_name, year_of_call, phone, office_address)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'surname',
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'middle_name',
    NEW.raw_user_meta_data ->> 'year_of_call',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'office_address'
  );
  RETURN NEW;
END;
$function$;