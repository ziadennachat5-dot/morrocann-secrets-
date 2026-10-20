CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('private_event', 'gift', 'partner')),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) <= 255),
  phone text NOT NULL CHECK (char_length(phone) <= 30),
  organization text CHECK (char_length(organization) <= 160),
  event_type text CHECK (char_length(event_type) <= 80),
  requested_date date,
  guest_count integer CHECK (guest_count IS NULL OR guest_count BETWEEN 1 AND 500),
  quantity integer CHECK (quantity IS NULL OR quantity BETWEEN 1 AND 100),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS image_alt jsonb;
ALTER TABLE public.host_families
  ADD COLUMN IF NOT EXISTS image_alt jsonb;

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.inquiries FROM anon, authenticated;
GRANT SELECT ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;

CREATE POLICY "Public can insert new inquiries"
  ON public.inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'new');

CREATE POLICY "Admins can read inquiries"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update inquiries"
  ON public.inquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.public_form_rate_limits (
  ip_hash text PRIMARY KEY CHECK (char_length(ip_hash) = 64),
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count > 0)
);

ALTER TABLE public.public_form_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_form_rate_limits FROM anon, authenticated;
GRANT ALL ON public.public_form_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_public_form_rate_limit(p_ip_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_started_at timestamptz;
  v_count integer;
BEGIN
  IF p_ip_hash IS NULL OR p_ip_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid rate limit key';
  END IF;

  INSERT INTO public.public_form_rate_limits (ip_hash, window_started_at, request_count)
  VALUES (p_ip_hash, now(), 1)
  ON CONFLICT (ip_hash) DO NOTHING;

  SELECT window_started_at, request_count
  INTO v_started_at, v_count
  FROM public.public_form_rate_limits
  WHERE ip_hash = p_ip_hash
  FOR UPDATE;

  IF v_started_at < now() - interval '10 minutes' THEN
    UPDATE public.public_form_rate_limits
    SET window_started_at = now(), request_count = 1
    WHERE ip_hash = p_ip_hash;
    RETURN true;
  END IF;

  IF v_count >= 5 THEN
    RETURN false;
  END IF;

  UPDATE public.public_form_rate_limits
  SET request_count = request_count + 1
  WHERE ip_hash = p_ip_hash;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_public_form_rate_limit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_public_form_rate_limit(text) TO service_role;

CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category jsonb NOT NULL,
  question jsonb NOT NULL,
  answer jsonb NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.faqs FROM anon, authenticated;
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;

CREATE POLICY "Public can read published FAQs"
  ON public.faqs
  FOR SELECT
  TO anon, authenticated
  USING (is_published OR public.is_admin());

CREATE POLICY "Admins can insert FAQs"
  ON public.faqs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update FAQs"
  ON public.faqs
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete FAQs"
  ON public.faqs
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.posts (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title jsonb NOT NULL,
  summary jsonb NOT NULL,
  body jsonb NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  draft_note text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'published' AND published_at IS NOT NULL) OR status = 'draft')
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.posts FROM anon, authenticated;
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

CREATE POLICY "Public can read published posts"
  ON public.posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can insert posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

INSERT INTO public.posts (slug, title, summary, body, status, draft_note)
VALUES
(
  'what-to-expect-at-a-moroccan-home-dinner',
  '{"en":"What to Expect at a Moroccan Home Dinner","fr":"À quoi s''attendre lors d''un dîner chez une famille marocaine","ar":"ما الذي تتوقعه في عشاء داخل بيت مغربي"}'::jsonb,
  '{"en":"A draft guide to preparing for a hosted meal, with details to confirm directly with your host.","fr":"Un guide provisoire pour préparer un repas chez l''habitant, avec des détails à confirmer auprès de votre hôte.","ar":"دليل أولي للاستعداد لوجبة مع مضيف، مع تفاصيل ينبغي تأكيدها معه."}'::jsonb,
  '{"en":"A home dinner is shaped by the people hosting it, so no two evenings need be alike. Before you go, confirm the meeting point, arrival time, menu, duration and any access needs directly with your host. If you have allergies or dietary requirements, share them before the meal and ask what can be accommodated.\\n\\nYou may be invited to share dishes at a common table. Follow your host''s lead, ask questions when something is unfamiliar, and take part only in ways that feel comfortable to you. A home is a personal space: ask before photographing people or private rooms.\\n\\nThis is a draft guide. Confirm the details of your own booking with its host; offerings and customs vary by household.","fr":"Un dîner chez l''habitant dépend des personnes qui vous accueillent : deux soirées ne se ressemblent pas nécessairement. Avant de partir, confirmez directement avec votre hôte le point de rendez-vous, l''heure d''arrivée, le menu, la durée et les besoins d''accessibilité. Signalez toute allergie ou préférence alimentaire à l''avance et demandez ce qui peut être pris en compte.\\n\\nVous pourrez être invité à partager les plats autour d''une table commune. Suivez les indications de votre hôte, posez vos questions si quelque chose vous est inconnu et participez uniquement si vous le souhaitez. Un domicile est un espace privé : demandez l''accord des personnes avant de les photographier.\\n\\nCe texte est un brouillon. Confirmez les détails de votre réservation auprès de votre hôte ; l''accueil et les habitudes varient selon les foyers.","ar":"يتشكل العشاء المنزلي بحسب الأشخاص الذين يستضيفونك، لذلك قد تختلف الأمسيات. قبل الذهاب، أكد مباشرة مع مضيفك نقطة اللقاء ووقت الوصول والقائمة والمدة وأي احتياجات تتعلق بإمكانية الوصول. أخبره مسبقاً عن الحساسية أو المتطلبات الغذائية واسأله عما يمكن توفيره.\\n\\nقد تدعى إلى مشاركة الأطباق حول مائدة واحدة. اتبع إرشادات مضيفك واسأل عن أي أمر غير مألوف، وشارك بالطريقة التي تناسبك. البيت مساحة خاصة؛ استأذن الأشخاص قبل تصويرهم.\\n\\nهذا النص مسودة. أكد تفاصيل حجزك مع مضيفك، إذ تختلف التجارب والعادات بين البيوت."}'::jsonb,
  'draft',
  'Draft copy: host-specific details and translations require owner review before publication.'
),
(
  'moroccan-dining-etiquette',
  '{"en":"Moroccan Dining Etiquette","fr":"Les usages à table au Maroc","ar":"آداب تناول الطعام في المغرب"}'::jsonb,
  '{"en":"A draft overview of respectful questions and shared dining, without assuming every household follows the same customs.","fr":"Un aperçu provisoire du repas partagé et des questions respectueuses, sans supposer que chaque foyer suit les mêmes usages.","ar":"نظرة أولية إلى تناول الطعام المشترك وطرح الأسئلة باحترام، دون افتراض أن كل بيت يتبع العادات نفسها."}'::jsonb,
  '{"en":"There is no single set of table customs followed by every Moroccan household. If you are unsure whether to remove your shoes, where to sit or how a shared dish is served, wait for your host''s guidance or ask politely.\\n\\nWash your hands if invited to do so, and use the serving approach your host demonstrates. If you have a dietary restriction, explain it clearly before the meal rather than relying on guesswork. It is also thoughtful to ask before taking photographs, especially of people or family spaces.\\n\\nThese notes are a starting point, not a rulebook. Customs differ by family, region and occasion; your host is the best source for the evening you are attending.","fr":"Il n''existe pas un ensemble unique de règles suivi par tous les foyers marocains. Si vous ne savez pas s''il faut retirer vos chaussures, où vous asseoir ou comment partager un plat, attendez les indications de votre hôte ou posez-lui la question avec respect.\\n\\nLavez-vous les mains si l''on vous y invite et suivez la manière de servir que votre hôte vous montre. Si vous avez une restriction alimentaire, expliquez-la clairement avant le repas. Pensez aussi à demander l''autorisation avant de prendre des photos, notamment de personnes ou d''espaces privés.\\n\\nCes conseils sont un point de départ, pas un règlement. Les usages varient selon les familles, les régions et les occasions ; votre hôte connaît le mieux la soirée à laquelle vous participez.","ar":"لا توجد مجموعة واحدة من آداب الطعام تتبعها جميع الأسر المغربية. إذا لم تعرف إن كان عليك خلع حذائك أو أين تجلس أو كيف يقدم الطبق المشترك، فانتظر إرشاد مضيفك أو اسأله بلطف.\\n\\nاغسل يديك إذا طلب منك ذلك، واتبع طريقة التقديم التي يوضحها المضيف. إذا كانت لديك قيود غذائية فاشرحها بوضوح قبل الوجبة. ومن اللطيف أيضاً الاستئذان قبل التقاط الصور، خصوصاً للأشخاص أو المساحات العائلية الخاصة.\\n\\nهذه الملاحظات بداية وليست قواعد ثابتة. تختلف العادات باختلاف الأسرة والمنطقة والمناسبة، ومضيفك هو الأعرف بتفاصيل الأمسية."}'::jsonb,
  'draft',
  'Draft copy: check cultural guidance with hosts and a fluent reviewer before publication.'
),
(
  'traditional-moroccan-dishes-explained',
  '{"en":"Traditional Moroccan Dishes Explained","fr":"Les plats traditionnels marocains expliqués","ar":"شرح أطباق مغربية تقليدية"}'::jsonb,
  '{"en":"A draft introduction to a few well-known dish names; the ingredients and preparation vary by household and region.","fr":"Une introduction provisoire à quelques plats connus ; les ingrédients et préparations varient selon les foyers et les régions.","ar":"مقدمة أولية لبعض أسماء الأطباق المعروفة؛ تختلف المكونات وطرق التحضير بين البيوت والمناطق."}'::jsonb,
  '{"en":"Tagine refers both to a cooking vessel and to dishes prepared in it; recipes vary widely. Couscous is made from semolina granules and can be served with vegetables, meat or other accompaniments depending on the cook and occasion. Harira is a soup with many family variations.\\n\\nPastilla is a layered pastry with sweet and savoury versions. Zaalouk is commonly used for an aubergine-based cooked salad, while taktouka often refers to a cooked pepper and tomato salad. Names, ingredients and methods can differ, so ask your host how a particular dish is made and what it contains.\\n\\nThis introductory text is a draft and is not a menu. Confirm ingredients and allergens with the host preparing your meal.","fr":"Le mot tajine désigne à la fois un récipient de cuisson et les plats qui y sont préparés ; les recettes varient beaucoup. Le couscous est composé de semoule et peut être accompagné de légumes, de viande ou d''autres éléments selon la personne qui le prépare et l''occasion. La harira est une soupe dont il existe de nombreuses versions familiales.\\n\\nLa pastilla est une pâtisserie en couches, déclinée en versions sucrées et salées. Zaalouk désigne souvent une salade cuite à base d''aubergine, tandis que taktouka fait souvent référence à une salade cuite de poivron et de tomate. Les noms, ingrédients et méthodes peuvent varier : demandez à votre hôte comment un plat est préparé et ce qu''il contient.\\n\\nCe texte introductif est un brouillon et ne constitue pas un menu. Vérifiez les ingrédients et allergènes auprès de la personne qui prépare le repas.","ar":"يشير اسم الطاجين إلى وعاء الطهي وإلى أطباق تُحضّر فيه، وتختلف وصفاته كثيراً. يُصنع الكسكس من حبيبات السميد وقد يقدم مع الخضار أو اللحم أو مكونات أخرى بحسب الطاهي والمناسبة. والحريرة حساء له وصفات عائلية متعددة.\\n\\nالبسطيلة فطيرة متعددة الطبقات، وتوجد منها أنواع حلوة ومالحة. ويشير الزعلوك غالباً إلى سلطة مطهوة أساسها الباذنجان، بينما تشير التكتوكة غالباً إلى سلطة مطهوة من الفلفل والطماطم. قد تختلف الأسماء والمكونات والطرق، لذا اسأل مضيفك عن طريقة تحضير الطبق ومحتوياته.\\n\\nهذا النص التعريفي مسودة وليس قائمة طعام. تحقق من المكونات ومسببات الحساسية مع من يحضر وجبتك."}'::jsonb,
  'draft',
  'Draft copy: confirm descriptions and translations with local hosts before publication.'
)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE public.inquiries IS
  'Public inquiries are created through validated server functions; only admins can read or manage them.';
COMMENT ON TABLE public.posts IS
  'Localized blog content. Draft posts are private until an admin publishes them.';
