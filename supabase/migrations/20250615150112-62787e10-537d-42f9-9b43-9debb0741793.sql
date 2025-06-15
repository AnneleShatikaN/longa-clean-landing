
-- Create the increment_faq_views function
CREATE OR REPLACE FUNCTION public.increment_faq_views(faq_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.support_faqs 
  SET views = views + 1 
  WHERE id = faq_id;
END;
$function$
