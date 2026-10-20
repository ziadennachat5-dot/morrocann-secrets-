INSERT INTO public.posts (slug, title, summary, body, status, draft_note, published_at)
VALUES
  (
    'before-you-book',
    jsonb_build_object(
      'en', 'Before you book: details to confirm',
      'fr', 'Avant de réserver : les détails à confirmer',
      'ar', 'قبل الحجز: تفاصيل ينبغي تأكيدها'
    ),
    jsonb_build_object(
      'en', 'An unpublished checklist draft. Verify all practical details with the host before publication.',
      'fr', 'Un brouillon de liste de vérification non publié. Confirmez tous les détails pratiques auprès de l’hôte avant publication.',
      'ar', 'مسودة قائمة تحقق غير منشورة. يرجى تأكيد جميع التفاصيل العملية مع المضيف قبل النشر.'
    ),
    jsonb_build_object(
      'en', 'Editorial draft. Before publication, ask the host to verify the location, arrival instructions, available dates, duration, current price, cancellation terms, accessibility, and inclusions. Publish only details the host confirms, then review this text in English, French, and Arabic. This draft makes no promise about availability, price, transport, or services.',
      'fr', 'Brouillon éditorial. Avant publication, demandez à l’hôte de confirmer le lieu, les consignes d’arrivée, les dates disponibles, la durée, le prix actuel, les conditions d’annulation, l’accessibilité et les éléments inclus. Ne publiez que les détails confirmés par l’hôte, puis faites relire ce texte en anglais, en français et en arabe. Ce brouillon ne promet aucune disponibilité, aucun prix, transport ou service.',
      'ar', 'مسودة تحريرية. قبل النشر، اطلبوا من المضيف تأكيد الموقع وتعليمات الوصول والتواريخ المتاحة والمدة والسعر الحالي وشروط الإلغاء وإمكانية الوصول وما يشمله النشاط. لا تنشروا إلا التفاصيل التي يؤكدها المضيف، ثم راجعوا النص بالإنجليزية والفرنسية والعربية. لا تتضمن هذه المسودة أي وعد بالتوافر أو السعر أو النقل أو الخدمات.'
    ),
    'draft',
    'Unpublished editorial checklist; replace with host-verified details and review all translations before publishing.',
    NULL
  ),
  (
    'sharing-dietary-needs',
    jsonb_build_object(
      'en', 'Sharing food preferences and dietary needs',
      'fr', 'Communiquer ses préférences et besoins alimentaires',
      'ar', 'مشاركة تفضيلات الطعام والاحتياجات الغذائية'
    ),
    jsonb_build_object(
      'en', 'An unpublished editorial draft. Do not promise accommodation or allergen controls without host confirmation.',
      'fr', 'Un brouillon éditorial non publié. Ne promettez aucune adaptation ni mesure concernant les allergènes sans confirmation de l’hôte.',
      'ar', 'مسودة تحريرية غير منشورة. لا تقدموا وعودًا بشأن تلبية الاحتياجات أو التعامل مع مسببات الحساسية دون تأكيد المضيف.'
    ),
    jsonb_build_object(
      'en', 'Editorial draft. Ask the host to confirm which food preferences or dietary requests can be accommodated, how and when guests should share them, and whether any restrictions apply. Do not promise allergen controls, ingredients, or substitutions without confirmation. Review all language versions with the host before publication.',
      'fr', 'Brouillon éditorial. Demandez à l’hôte de confirmer quelles préférences ou demandes alimentaires peuvent être prises en compte, comment et quand les communiquer, et si des restrictions s’appliquent. Ne promettez aucune mesure concernant les allergènes, aucun ingrédient ni remplacement sans confirmation. Faites relire toutes les versions par l’hôte avant publication.',
      'ar', 'مسودة تحريرية. اطلبوا من المضيف تأكيد تفضيلات الطعام أو الطلبات الغذائية التي يمكن تلبيتها، وكيفية مشاركتها وموعد ذلك، وما إذا كانت هناك قيود. لا تقدموا وعودًا بشأن التعامل مع مسببات الحساسية أو المكونات أو البدائل دون تأكيد. راجعوا جميع النسخ اللغوية مع المضيف قبل النشر.'
    ),
    'draft',
    'Unpublished editorial checklist; confirm every food-related detail with the host and review all translations before publishing.',
    NULL
  ),
  (
    'planning-your-visit',
    jsonb_build_object(
      'en', 'Planning a visit',
      'fr', 'Préparer une visite',
      'ar', 'التخطيط للزيارة'
    ),
    jsonb_build_object(
      'en', 'An unpublished editorial draft. Confirm the itinerary and practical arrangements with the host before publication.',
      'fr', 'Un brouillon éditorial non publié. Confirmez le programme et les modalités pratiques auprès de l’hôte avant publication.',
      'ar', 'مسودة تحريرية غير منشورة. يرجى تأكيد البرنامج والترتيبات العملية مع المضيف قبل النشر.'
    ),
    jsonb_build_object(
      'en', 'Editorial draft. Verify the meeting point, schedule, travel information, accessibility, and other practical arrangements with the host before publication. Avoid estimates or promises that have not been confirmed, and update all translated versions together.',
      'fr', 'Brouillon éditorial. Vérifiez le point de rendez-vous, l’horaire, les informations de déplacement, l’accessibilité et les autres modalités pratiques auprès de l’hôte avant publication. Évitez les estimations ou promesses qui n’ont pas été confirmées et mettez à jour toutes les traductions ensemble.',
      'ar', 'مسودة تحريرية. تحققوا من نقطة اللقاء والموعد ومعلومات التنقل وإمكانية الوصول والترتيبات العملية الأخرى مع المضيف قبل النشر. تجنبوا التقديرات أو الوعود غير المؤكدة، وحدّثوا جميع الترجمات معًا.'
    ),
    'draft',
    'Unpublished editorial checklist; verify practical arrangements with the host and review all translations before publishing.',
    NULL
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faqs (id, category, question, answer, sort_order, is_published)
VALUES
  (
    'a2612600-0000-4000-8000-000000000001',
    jsonb_build_object(
      'en', 'Booking and availability',
      'fr', 'Réservation et disponibilités',
      'ar', 'الحجز والتوافر'
    ),
    jsonb_build_object(
      'en', 'Which details should I confirm before requesting a booking?',
      'fr', 'Quels détails dois-je confirmer avant de demander une réservation ?',
      'ar', 'ما التفاصيل التي ينبغي تأكيدها قبل طلب الحجز؟'
    ),
    jsonb_build_object(
      'en', 'Draft answer: the host must confirm the booking details before this answer is published.',
      'fr', 'Réponse provisoire : l’hôte doit confirmer les détails de la réservation avant la publication de cette réponse.',
      'ar', 'إجابة مسودة: يجب أن يؤكد المضيف تفاصيل الحجز قبل نشر هذه الإجابة.'
    ),
    900,
    false
  ),
  (
    'a2612600-0000-4000-8000-000000000002',
    jsonb_build_object(
      'en', 'Visit details',
      'fr', 'Détails de la visite',
      'ar', 'تفاصيل الزيارة'
    ),
    jsonb_build_object(
      'en', 'Where and when does the visit take place?',
      'fr', 'Où et quand la visite a-t-elle lieu ?',
      'ar', 'أين ومتى تتم الزيارة؟'
    ),
    jsonb_build_object(
      'en', 'Draft answer: the host must confirm the location and schedule before this answer is published.',
      'fr', 'Réponse provisoire : l’hôte doit confirmer le lieu et l’horaire avant la publication de cette réponse.',
      'ar', 'إجابة مسودة: يجب أن يؤكد المضيف الموقع والموعد قبل نشر هذه الإجابة.'
    ),
    901,
    false
  ),
  (
    'a2612600-0000-4000-8000-000000000003',
    jsonb_build_object(
      'en', 'Food and dietary needs',
      'fr', 'Alimentation et besoins alimentaires',
      'ar', 'الطعام والاحتياجات الغذائية'
    ),
    jsonb_build_object(
      'en', 'Can food preferences or dietary requests be accommodated?',
      'fr', 'Les préférences ou demandes alimentaires peuvent-elles être prises en compte ?',
      'ar', 'هل يمكن تلبية تفضيلات الطعام أو الطلبات الغذائية؟'
    ),
    jsonb_build_object(
      'en', 'Draft answer: the host must confirm which requests can be accommodated before this answer is published.',
      'fr', 'Réponse provisoire : l’hôte doit confirmer les demandes qui peuvent être prises en compte avant la publication de cette réponse.',
      'ar', 'إجابة مسودة: يجب أن يؤكد المضيف الطلبات التي يمكن تلبيتها قبل نشر هذه الإجابة.'
    ),
    902,
    false
  )
ON CONFLICT (id) DO NOTHING;
