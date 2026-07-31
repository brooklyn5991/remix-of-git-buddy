GRANT DELETE ON public.complaints TO authenticated;
CREATE POLICY "Owner deletes complaints" ON public.complaints FOR DELETE TO authenticated USING (has_role(auth.uid(), 'owner'::app_role));