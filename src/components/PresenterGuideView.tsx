import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { EconomicSummary, Language, SimulationSummary, SystemConfig } from '../engine/types';

interface PresenterGuideViewProps {
  lang: Language;
  siteName: string;
  config: SystemConfig;
  sim: SimulationSummary;
  econ: EconomicSummary;
}

type GuideLang = 'fr' | 'en' | 'ar';

export function PresenterGuideView({
  lang,
  siteName,
  sim,
  econ,
}: PresenterGuideViewProps) {
  const [guideLang, setGuideLang] = useState<GuideLang>(lang);
  const [openQaIdx, setOpenQaIdx] = useState<number | null>(0);

  useEffect(() => {
    setGuideLang((prev) => (prev === 'ar' ? 'ar' : lang));
  }, [lang]);

  const isFr = guideLang === 'fr';
  const isAr = guideLang === 'ar';

  const pitchSections = isAr
    ? [
        {
          time: '0:00 – 0:45',
          title: '1. الافتتاحية والمشكلة المزدوجة في الجزائر',
          script: `« السلام عليكم السادة أعضاء لجنة تحكيم CRTSE وحاضنة INC-MATENG. في الجزائر — كما نرى في موقع ${siteName} — يتصادم تحديان وطنيان كل يوم: أولاً، تصل حرارة ألواح السيليكون إلى ${sim.baselineUncooled.peakCellTempC} °C وقت الذروة فتفقد 0.41% من قدرتها لكل درجة حرارة؛ ثانياً، تستهلك محطات التحلية بالتناضح العكسي طاقة كهربائية عالية لضخ مياه باردة نسبياً. معالجة النظامين بشكل منفصل تعني هدر الحرارة الشمسية مرتين. »`,
        },
        {
          time: '0:45 – 1:45',
          title: '2. جوهر الابتكار: التكامل الحراري بين السيليكون والغشاء (QatraTherm)',
          script: `« يجمع مشروع QatraTherm المحاور الثلاثة للمسابقة في حلقة فيزيائية واحدة. قبل دخول الماء الخام إلى المضخة، يمر بمبادل حراري معزول خلف ألواح السيليكون PV-T. النتائج المحسوبة من المعادلات الحقيقية: نبرّد الخلية الشمسية بمعدل ${sim.optimizedSystem.avgCellTempDeltaC} °C ونسترجع +${sim.gains.pvYieldGainPct}% من الكهرباء. وفي نفس الوقت، ترتفع حرارة ماء التغذية إلى ${sim.optimizedSystem.avgFeedTempC} °C، وبفضل قانون أرينيوس تقل لزوجة الماء، ومع مبادل الضغط ERD (94%) ينخفض الاستهلاك النوعي إلى ${sim.optimizedSystem.avgSecKwhPerM3} kWh/m³ أي بتوفير قدره ${sim.gains.secReductionPct}%. »`,
        },
        {
          time: '1:45 – 3:00',
          title: '3. الذكاء الاصطناعي المستدام (MPC) والعرض الحي',
          script: `« بدلاً من تشغيل المضخة بسرعة ثابتة، يقوم المتحكم التنبؤي الحتمي (MPC) بجدولة مضخة التردد المتغير VFD خلال ساعات الذروة الشمسية مع احترام حدود الغشاء والبطارية والخزان. في العرض الحي أمامكم، ينتج النظام ${sim.optimizedSystem.dailyWaterM3} م³/يوم من مياه شرب مطابقة لمعيار منظمة الصحة العالمية (${sim.optimizedSystem.avgPermeateTdsMgL} mg/L < 500 mg/L)، مع تقليص استيراد الشبكة بنسبة ${sim.gains.gridImportReductionPct}%. »`,
        },
        {
          time: '3:00 – 4:15',
          title: '4. الجدوى الاقتصادية بالدينار الجزائري وتثمين الرجيع الملحي',
          script: `« مالياً، بتكلفة استثمارية صافية ${(econ.netCapexDzd / 1e6).toFixed(2)} مليون دج، تبلغ التكلفة الموزونة للمياه ${econ.lcowDzdPerM3} دج/م³ (${econ.lcowUsdPerM3} دولار/م³) مع استرداد رأس المال خلال ${econ.simplePaybackYears} سنة وتفادي ${sim.gains.co2AvoidedTonnesYear} طن من CO₂ سنوياً، إضافة إلى إمكانية تثمين ${sim.optimizedSystem.recoverableSaltKgDay} كغ/يوم من الأملاح المتبلورة. »`,
        },
        {
          time: '4:15 – 5:00',
          title: '5. خطتنا داخل حاضنة MATENG ومركز CRTSE',
          script: `« نحن اليوم في مستوى نضج TRL 4 بهذا التوأم الرقمي الفيزيائي الكامل. هدفنا داخل حاضنة MATENG-CRTSE هو بناء نموذج تجريبي بقدرة 2 kWc مقرون بوحدة RO مصغرة على منصات المركز خلال 4 أشهر، ومعايرة المبادل الحراري وإيداع براءة الاختراع للحصول على علامة مشروع مبتكر. شكراً لكم. »`,
        },
      ]
    : isFr
    ? [
        {
          time: '0:00 – 0:45',
          title: '1. L’Accroche & Le Problème Double en Algérie',
          script: `« Bonjour Messieurs et Mesdames les membres du jury du CRTSE et d’INC-MATENG. En Algérie, deux défis nationaux s’entrechoquent chaque jour à ${siteName} : d’abord, nos panneaux photovoltaïques en silicium dépassent ${sim.baselineUncooled.peakCellTempC} °C à midi et perdent près de 0,41 % de puissance par degré ; ensuite, le dessalement par osmose inverse consomme énormément d’électricité, alors que la qualité de l’eau saumâtre ou côtière devient critique. Jusqu’ici, on traite ces deux systèmes séparément — et on gaspille la chaleur solaire. »`,
        },
        {
          time: '0:45 – 1:45',
          title: '2. Notre Solution : La Synergie Thermique Silicium-Membrane (QatraTherm)',
          script: `« QatraTherm réunit les trois axes du challenge en une boucle physique unique. Au lieu de laisser l’eau brute froide entrer directement dans les pompes haute pression, nous la faisons circuler dans un échangeur thermique à l’arrière des modules silicium PV-T. Résultat mesuré par nos équations couplées : nous refroidissons la cellule photovoltaïque de ${sim.optimizedSystem.avgCellTempDeltaC} °C en moyenne, récupérant +${sim.gains.pvYieldGainPct}% d’électricité solaire. Simultanément, cette chaleur gratuite réchauffe l’eau brute vers ${sim.optimizedSystem.avgFeedTempC} °C. D’après la loi d’Arrhenius sur les membranes polyamide TFC, la viscosité de l’eau chute, réduisant la pression de pompage requise. Associé à un récupérateur de pression isobare (ERD 94 %), notre consommation spécifique tombe à ${sim.optimizedSystem.avgSecKwhPerM3} kWh/m³, soit -${sim.gains.secReductionPct}% par rapport à la référence. »`,
        },
        {
          time: '1:45 – 3:00',
          title: '3. L’Intelligence Prédictive (MPC) & Démonstration en Direct',
          script: `« Mais chauffer l’eau ne suffit pas si la pompe tourne à vitesse fixe la nuit. Notre contrôleur prédictif déterministe (MPC) — sans aucune boîte noire opaque — résout l’équilibre entre l’irradiance solaire, la courbe de rendement optimal des membranes (~19 LMH), le stockage batterie LiFePO4 et le réservoir tampon. Comme vous le voyez sur le simulateur en direct, nous produisons ${sim.optimizedSystem.dailyWaterM3} m³/jour d’eau potable conforme OMS (${sim.optimizedSystem.avgPermeateTdsMgL} mg/L < 500 mg/L), tout en réduisant l’import réseau de ${sim.gains.gridImportReductionPct}%. »`,
        },
        {
          time: '3:00 – 4:15',
          title: '4. Viabilité Économique, Valorisation Saumure & Feuille de Route CRTSE',
          script: `« Sur le plan financier, avec un CAPEX net estimé à ${(econ.netCapexDzd / 1e6).toFixed(2)} millions DZD, notre coût actualisé de l’eau atteint ${econ.lcowDzdPerM3} DZD/m³ (${econ.lcowUsdPerM3} USD/m³) avec un retour sur investissement de ${econ.simplePaybackYears} ans et ${sim.gains.co2AvoidedTonnesYear} tonnes de CO₂ évitées par an. De plus, les ${sim.optimizedSystem.brineVolumeM3Day} m³/j de saumure concentrée permettent de valoriser ${sim.optimizedSystem.recoverableSaltKgDay} kg/j de sels cristallisables. »`,
        },
        {
          time: '4:15 – 5:00',
          title: '5. Ce que nous demandons à l’Incubateur MATENG-CRTSE',
          script: `« Nous sommes aujourd’hui à TRL 4 avec ce jumeau numérique physique complet. Notre objectif à MATENG-CRTSE est de construire le banc pilote de 2 kWc couplé au skid RO dans les plateformes technologiques du CRTSE pour caractériser l’échangeur PV-T réel en 4 mois, déposer le brevet d’assemblage thermique, et obtenir le label Projet Innovant. Merci. »`,
        },
      ]
    : [
        {
          time: '0:00 – 0:45',
          title: '1. Hook & Algeria’s Coupled Energy-Water Bottleneck',
          script: `"Good morning to the CRTSE and INC-MATENG jury. Across Algeria—such as here in ${siteName}—two national challenges collide daily: silicon PV panels exceed ${sim.baselineUncooled.peakCellTempC} °C at solar noon and lose ~0.41% power per °C, while Reverse Osmosis desalination demands heavy electrical pumping. Treating them as separate systems wastes solar heat twice."`,
        },
        {
          time: '0:45 – 1:45',
          title: '2. The Core Invention: Bidirectional Silicon-to-Membrane Synergy',
          script: `"QatraTherm unites all three SEM'INNOV axes in one physical loop. Raw saline feedwater first cools the rear of our PV-T silicon modules—dropping cell temperature by ${sim.optimizedSystem.avgCellTempDeltaC} °C on average and boosting PV electrical yield by +${sim.gains.pvYieldGainPct}%. Simultaneously, that captured heat warms the RO feedwater toward ${sim.optimizedSystem.avgFeedTempC} °C. By Arrhenius membrane transport physics, warmer water has lower viscosity, cutting net driving pressure. Combined with a 94% isobaric ERD, our Specific Energy Consumption drops to ${sim.optimizedSystem.avgSecKwhPerM3} kWh/m³—a ${sim.gains.secReductionPct}% reduction vs uncooled baseline."`,
        },
        {
          time: '1:45 – 3:00',
          title: '3. Deterministic Predictive Control (MPC) & Live Demo',
          script: `"Instead of running pumps blindly at fixed speed, our deterministic MPC scheduler dispatches variable-frequency pump flow across peak solar and warm-water windows while respecting membrane flux limits, LiFePO4 battery SOC, and potable tank bounds. On our live engine, the unit delivers ${sim.optimizedSystem.dailyWaterM3} m³/day of WHO-compliant water (${sim.optimizedSystem.avgPermeateTdsMgL} mg/L < 500 mg/L) and cuts grid import by ${sim.gains.gridImportReductionPct}%."`,
        },
        {
          time: '3:00 – 4:15',
          title: '4. Algerian Economics, Brine Valorization & CO₂ Impact',
          script: `"At a net CAPEX of ${(econ.netCapexDzd / 1e6).toFixed(2)} M DZD, our Levelized Cost of Water reaches ${econ.lcowDzdPerM3} DZD/m³ (${econ.lcowUsdPerM3} USD/m³) with a ${econ.simplePaybackYears}-year payback and ${sim.gains.co2AvoidedTonnesYear} tonnes CO₂/yr avoided—plus ${sim.optimizedSystem.recoverableSaltKgDay} kg/day of recoverable salts from concentrated brine."`,
        },
        {
          time: '4:15 – 5:00',
          title: '5. Next Step Inside INC-MATENG CRTSE',
          script: `"We enter at TRL 4 with a verified end-to-end digital twin. Inside CRTSE-MATENG, we will build a 2 kWp PV-T + RO test bench on CRTSE platforms to validate real heat-exchanger conductance, file IP protection, and scale to a field pilot."`,
        },
      ];

  const physicsConcepts = isAr
    ? [
        {
          name: 'لماذا تسخن ألواح السيليكون وتفقد الكفاءة؟ (نموذج Faiman)',
          detail:
            'خلية السيليكون تحول ~21% من ضوء الشمس إلى كهرباء والباقي (~70%) يتحول إلى حرارة. في الجنوب الجزائري (950 واط/م² و40 °C) تصل حرارة الخلية إلى 56–65 °C، مما يخفض جهد الدارة المفتوحة ويفقد اللوح ~0.41% من قدرته لكل درجة فوق 25 °C.',
        },
        {
          name: 'كيف يقلل التسخين المسبق طاقة التناضح العكسي؟ (قانون Arrhenius)',
          detail:
            'نفاذية الماء عبر أغشية البولي أميد TFC تتبع قانون أرينيوس لأن لزوجة الماء تقل بالحرارة: تسخين الماء من 20 °C إلى 35 °C يرفع النفاذية بنحو 50% ويخفض الضغط المطلوب من المضخة. أما في مياه البحر، فيُضاف مبادل الضغط ERD (94%) للتعامل مع الضغط الأسموزي العالي (~28.5 بار).',
        },
        {
          name: 'الأمانة العلمية: الحد الحراري الآمن (43 °C) ومرور الأملاح',
          detail:
            'لا يمكن تسخين الماء بلا حدود! فوق 45 °C يتلف غشاء TFC ويزيد عبور الأملاح Bs(T). لذلك يفرض نظام QatraTherm سقفاً حرارياً عند 43 °C ويتحقق كل ساعة من بقاء الملوحة أقل من حد منظمة الصحة العالمية (<500 mg/L).',
        },
        {
          name: 'لماذا التحكم التنبؤي الحتمي MPC أفضل من الذكاء الأسود؟',
          detail:
            'المتحكم الحتمي يعمل بمعادلات فيزيائية دقيقة وقيود تشغيل حقيقية (تدفق أدنى 32% لمنع الترسب، خزان 8–100%، بطارية 20–95%) ويعمل على متحكم ESP32/STM32 منخفض الاستهلاك بدون خوادم سحابية مكلفة.',
        },
      ]
    : isFr
    ? [
        {
          name: 'Pourquoi le silicium chauffe et perd du rendement (Modèle de Faiman)',
          detail:
            'Une cellule photovoltaïque en silicium monocristallin convertit ~21% de la lumière en électricité ; les ~70% absorbés restants deviennent de la chaleur. Sous le soleil saharien (950 W/m², 40 °C ambiant), la jonction p-n atteint 60–68 °C, réduisant la tension de circuit ouvert (Voc) et faisant chuter la puissance d’environ -0,41 %/°C.',
        },
        {
          name: 'Pourquoi l’eau préchauffée facilite l’Osmose Inverse (Loi d’Arrhenius)',
          detail:
            'Dans une membrane TFC en polyamide, l’eau traverse par solution-diffusion. La perméabilité à l’eau Aw(T) suit une loi exponentielle d’Arrhenius (TCF = exp(2640·(1/298.15 − 1/T_K))) car la viscosité dynamique de l’eau diminue fortement avec la température : passer de 20 °C à 35 °C augmente la perméabilité de ~50% et réduit la pression nette nécessaire !',
        },
        {
          name: 'Limite physique honnête : le plafond à 43 °C et la pression osmotique (Van ’t Hoff)',
          detail:
            'Attention devant un jury scientifique : chauffer trop (>45 °C) endommage le polyamide TFC ET augmente légèrement le passage des sels Bs(T). C’est pourquoi QatraTherm impose un plafond strict à 43 °C et vérifie en continu que le perméat reste sous les 500 mg/L (norme OMS). Par ailleurs, pour l’eau de mer (35 500 mg/L), la pression osmotique (~28,5 bar) domine, d’où l’importance cruciale du récupérateur isobare ERD (94%).',
        },
        {
          name: 'Pourquoi un MPC déterministe plutôt qu’une IA « boîte noire »',
          detail:
            'Les jurys d’ingénieurs se méfient des réseaux neuronaux qui hallucinent des consignes de pompes. Notre MPC utilise des équations physiques exactes et résout l’allocation horaire VFD sous contraintes strictes (débit min 32% anti-colmatage, niveau réservoir 8%–100%, SOC batterie 20%–95%). Il est explicable, embarquable sur microcontrôleur STM32/ESP32 et 100% fiable.',
        },
      ]
    : [
        {
          name: 'Why Silicon Cells Overheat & Lose Power (Faiman Energy Balance)',
          detail:
            'Monocrystalline silicon converts ~21% of incident sunlight into electricity; ~70% becomes heat. In Saharan irradiance (950 W/m², 40 °C ambient), uncooled cells hit 60–68 °C, reducing open-circuit voltage (Voc) and dropping electrical output by ~0.41% per °C above 25 °C.',
        },
        {
          name: 'Why Warm Feedwater Slashes RO Pumping Energy (Arrhenius Law)',
          detail:
            'Water transport across polyamide TFC membranes follows solution-diffusion physics where permeability Aw(T) scales via Arrhenius viscosity: raising feedwater from 20 °C to 35 °C increases permeability by ~50%, directly lowering required Net Driving Pressure.',
        },
        {
          name: 'Scientific Honesty: The 43 °C Ceiling & Salt Passage Trade-off',
          detail:
            'Never claim unlimited heating! Above 45 °C, polyamide TFC membranes degrade, and warmer water slightly raises salt permeability Bs(T). QatraTherm enforces a strict 43 °C thermal valve ceiling and checks WHO <500 mg/L potability every hour. On seawater (35,500 mg/L), osmotic pressure (~28.5 bar) dominates, which is why the 94% isobaric ERD is paired with PV-T.',
        },
        {
          name: 'Why Deterministic MPC Beats Black-Box AI for Industrial Pumps',
          detail:
            'PhD engineers distrust opaque black-box controllers on high-pressure hydraulic skids. Our MPC runs exact physical constraints (min 32% pump flow, 8–100% tank bounds, 20–95% battery SOC) and schedules VFD speed in real time on low-power edge hardware (STM32/ESP32).',
        },
      ];

  const demoSteps = isAr
    ? [
        'افتح تبويب المحاكاة (Simulateur PV-RO) على الموقع الافتراضي: ورقلة — الطبقة الألبية (4,200 mg/L).',
        'ألغِ تفعيل خيار «Refroidissement PV-T» من القائمة الجانبية: أرِ اللجنة فوراً ارتفاع حرارة خلية السيليكون وزيادة استهلاك الطاقة SEC.',
        'أعد تفعيل PV-T + ERD + MPC: أشر إلى المخطط الهندسي عند الساعة 12:00 لإظهار التبريد والحرارة المسترجعة.',
        'بدّل الموقع إلى «الجزائر العاصمة — مياه البحر (35,500 mg/L)»: اشرح التبديل التلقائي لغشاء SWRO-HR وأهمية مبادل الضغط ERD.',
        'اختم بتبويبي «Physique & Audit» و«Dossier & ROI» لإثبات أن جميع الأرقام محسوبة فيزيائياً وبالدينار الجزائري (راجع أيضاً ملف GUIDE_ARABIC.md في المشروع).',
      ]
    : isFr
    ? [
        'Ouvrir l’onglet Simulateur PV-RO sur le site par défaut « Ouargla — Nappe Albienne (4 200 mg/L) ».',
        'Décocher « Refroidissement PV-T eau brute » dans la colonne de gauche : montrez en direct au jury la température cellule grimper à >58 °C et le SEC augmenter.',
        'Recocher PV-T + ERD + MPC : montrez le gain immédiat de puissance PV, la baisse du SEC et le flux thermique sur le synoptique à 12h00.',
        'Changer le site vers « Alger — Littoral Méditerranéen (35 500 mg/L) » : expliquez comment le système passe automatiquement en membrane SWRO-HR et que l’ERD prend le relais sur la haute pression osmotique.',
        'Terminer sur l’onglet « Physique & Audit » et « Dossier & ROI » pour prouver que zéro chiffre n’est inventé (équations explicites + LCOW en DZD/m³).',
      ]
    : [
        'Start on Simulation Lab with "Ouargla — Albian Aquifer (4,200 mg/L)" selected.',
        'Uncheck "PV-T Feedwater Cooling" in the left panel: show the jury live how cell temperature jumps past 58 °C and RO SEC rises.',
        'Re-enable PV-T + ERD + MPC: point directly to the 12:00 schematic showing cell cooling, thermal recovery, and lower SEC.',
        'Switch site preset to "Algiers — Mediterranean Coast (35,500 mg/L)" to demonstrate automatic SWRO-HR membrane adaptation and ERD dominance.',
        'Finish in "Physics & Audit" and "Dossier & ROI" to prove zero fabricated numbers (live analytical equations + Algerian DZD LCOW).',
      ];

  const qaList = isAr
    ? [
        {
          q: 'ألا يؤدي تسخين ماء التغذية إلى زيادة مرور الأملاح أو تكلس الغشاء؟',
          a: 'سؤال ممتاز. نعم، نفاذية الملح Bs(T) ترتفع مع الحرارة (بمعامل تنشيط 2150 K مقارنة بـ 2640 K للماء). لذلك نحسب Bs(T) لحظياً، ونضع سقفاً حرارياً صارماً عند 43 °C، ونتحقق من بقاء الماء أقل من 500 mg/L كل ساعة، كما أدرجنا كلفة مضادات التكلس في OPEX.',
        },
        {
          q: 'كيف يبرّد الماء المالح خلايا السيليكون دون إتلافها أو إحداث تآكل؟',
          a: 'الماء المالح لا يلمس السيليكون أبداً؛ بل يمر في مبادل حراري مغلق من CuNi 90/10 أو بوليمر موصل للحرارة مقاوم للتآكل مثبت خلف طبقة العزل الخلفية Tedlar عبر مادة عازلة كهربائياً وموصلة حرارياً (TIM).',
        },
        {
          q: 'ما علاقة المشروع المباشرة بمركز أبحاث CRTSE؟',
          a: 'جوهر عمل CRTSE هو كفاءة وموثوقية خلايا السيليكون الشمسية في المناخ الجزائري القاسي. مشروع QatraTherm يعالج مباشرة التدهور الحراري للسيليكون ويوفر منصة اختبار مثالية على تجهيزات المركز.',
        },
        {
          q: 'أين الذكاء الاصطناعي المستدام (Sustainable AI) إذا كان التحكم حتمياً؟',
          a: 'الذكاء المستدام يعني خوارزمية خفيفة وموثوقة لا تستهلك طاقة مراكز البيانات. خوارزمية MPC تقرأ توقعات الطقس لـ 24 ساعة وتضبط سرعة المضخة على شريحة ESP32/STM32 ببضع كيلوبايتات فقط.',
        },
        {
          q: 'كيف تتعاملون مع الرجيع الملحي (Brine) في المناطق الصحراوية مثل ورقلة؟',
          a: `يحسب النموذج كمية الرجيع بدقة (${sim.optimizedSystem.brineVolumeM3Day} م³/يوم، منها ${sim.optimizedSystem.recoverableSaltKgDay} كغ/يوم أملاح قابلة للاسترجاع). في الصحراء يتم توجيه الرجيع لأحواض تبخير شمسية مبطنة لاستخلاص الملح الصناعي وأملاح المغنيسيوم.`,
        },
        {
          q: 'المشروع اليوم في TRL 4: كيف ننتقل إلى TRL 5–6 داخل حاضنة MATENG؟',
          a: 'بتجهيز منصة تجريبية بقدرة 2 kWc (ألواح PV-T) مع وحدة RO بمضخة VFD وحساسات TDS وحرارة، يمكن بناؤها واختبارها في منصات CRTSE خلال 12 أسبوعاً.',
        },
      ]
    : isFr
    ? [
        {
          q: 'Chauffer l’eau d’alimentation RO n’augmente-t-il pas le passage de sel (TDS perméat) et l’entartrage ?',
          a: 'Excellente question. Oui, la perméabilité au sel Bs(T) augmente avec la température (activation ~2150 K, mais plus lentement que l’eau ~2640 K). C’est exactement pourquoi notre moteur calcule Bs(T) en temps réel, plafonne strictement l’échangeur PV-T à 43 °C (marge de 2 °C sous la limite TFC de 45 °C), et vérifie heure par heure la conformité OMS (<500 mg/L). Pour le carbonate/sulfate de calcium à Ouargla, le pré-traitement anti-tartre et le taux de conversion R=72% sont intégrés dans l’OPEX.',
        },
        {
          q: 'Comment fonctionne concrètement l’échangeur thermique derrière les panneaux PV sans corroder le silicium ?',
          a: 'L’eau saline ne touche jamais les cellules silicium. Elle circule dans un serpentin polymère haute conductivité (PEX-Al ou CuNi 90/10 résistant au chlore) collé au dos du backsheet Tedlar via une interface thermique (TIM) diélectrique. Pour les sites eau de mer, l’échangeur utilise du CuNi 90/10 ou du titane mince / PP graphité anticorrosion.',
        },
        {
          q: 'En quoi ce projet concerne-t-il spécifiquement le CRTSE (Semi-conducteurs pour l’Énergétique) ?',
          a: 'Le cœur de métier du CRTSE est la performance et la fiabilité des cellules photovoltaïques en silicium sous climat extrême algérien. QatraTherm résout directement le déclassement thermique du silicium (-15 à -20 °C sur la jonction) tout en valorisant cette chaleur fatale dans l’axe Eau/Dessalement — le terrain d’expérimentation idéal pour les bancs de caractérisation PV du CRTSE.',
        },
        {
          q: 'Où est l’Intelligence Artificielle (« Sustainable AI ») si le contrôleur est un MPC déterministe ?',
          a: '« Sustainable AI » signifie une intelligence frugale, fiable et sobre en calcul. Notre algorithme d’optimisation prédictive (MPC) ingère les prévisions d’irradiance/température (CSV ou capteurs) et résout l’ordonnancement optimal du variateur VFD pour minimiser conjointement le SEC et l’import réseau, tout en tournant sur quelques kilooctets de RAM (Edge AI basse consommation, zéro serveur cloud énergivore).',
        },
        {
          q: 'Que faites-vous de la saumure concentrée pour éviter de polluer les sols sahariens ?',
          a: 'Le modèle calcule exactement le débit et la salinité du rejet (ex. ' +
            `${sim.optimizedSystem.brineVolumeM3Day} m³/j à Ouargla, soit ${sim.optimizedSystem.recoverableSaltKgDay} kg/j de sels). Sur site saharien, la saumure alimente un bassin d’évaporation solaire à cristallisation fractionnée pour récupérer du sel industriel (NaCl) et des sels de magnésium, valorisés à 1,8 DZD/kg net après coûts de cristallisation dans notre modèle économique.`,
        },
        {
          q: 'Votre niveau TRL est 4 : que faut-il pour passer au prototype physique (TRL 5-6) à l’incubateur MATENG ?',
          a: 'Le dimensionnement matériel est déjà prêt : 2 à 4 modules PV-T (2 kWc), un skid BWRO avec 1 membrane 4040 ou 8040, une pompe VFD + capteur TDS/T°/débit sur ESP32/STM32. Avec les équipements du CRTSE et une enveloppe prototype de ~1,2 M DZD, le banc complet est assemblable et testable en 12 semaines.',
        },
      ]
    : [
        {
          q: 'Doesn’t warming RO feedwater increase salt passage (higher permeate TDS) and scaling risk?',
          a: 'Yes—salt permeability Bs(T) increases with temperature (~2150 K activation vs ~2640 K for water). That is why our physics engine models Bs(T) explicitly, caps feed heating strictly at 43 °C (below the 45 °C TFC limit), verifies WHO <500 mg/L every hour, and prices antiscalant dosing into OPEX.',
        },
        {
          q: 'How does the PV-T heat exchanger cool silicon without saline water corroding the module?',
          a: 'Saline water never contacts the silicon cells. It flows inside a closed corrosion-resistant channel (CuNi 90/10 or thermally conductive polymer) bonded behind the dielectric Tedlar backsheet with thermal interface material.',
        },
        {
          q: 'Why is this specifically aligned with CRTSE (Semiconductors for Energetics)?',
          a: 'CRTSE focuses on silicon PV efficiency and reliability under harsh Algerian climates. QatraTherm directly mitigates thermal derating in silicon junctions (-15 to -20 °C at solar noon) while converting waste cell heat into lower desalination pumping energy.',
        },
        {
          q: 'How does this qualify under Sustainable AI if the optimizer is deterministic MPC?',
          a: 'Sustainable AI means frugal, explainable, low-power intelligence. Our MPC ingests 24h weather/irradiance forecasts and solves VFD pump scheduling under strict physical constraints on an ultra-low-power STM32/ESP32 edge node—zero cloud GPU energy overhead.',
        },
        {
          q: 'How do you manage concentrated brine in inland desert sites like Ouargla?',
          a: `Our mass balance tracks exact brine reject (${sim.optimizedSystem.brineVolumeM3Day} m³/day yielding ${sim.optimizedSystem.recoverableSaltKgDay} kg/day recoverable salts). Inland deployments route brine to lined solar evaporation ponds for NaCl / Mg²⁺ recovery, credited conservatively in our ROI model.`,
        },
        {
          q: 'At TRL 4 today, what is the concrete path to TRL 5–6 inside INC-MATENG?',
          a: 'A 2 kWp PV-T bench paired with a single-vessel 4040/8040 RO skid, VFD pump, and ESP32/STM32 sensor node can be assembled and tested on CRTSE characterization platforms within 12 weeks.',
        },
      ];

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="max-w-[1200px] mx-auto px-6 py-6 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isAr
              ? 'الدليل الشامل لفهم المشروع والتحضير للجنة التحكيم'
              : isFr
              ? 'Guide Complet de Maîtrise & Préparation Jury (Avant Présentation)'
              : 'Complete Project Mastery & Jury Presentation Guide'}
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl">
            {isAr
              ? 'تتحدث جميع الأرقام أدناه تلقائياً حسب الموقع والإعدادات المختارة في المحاكي. للمزيد من التفاصيل والحالات الخمس في الجزائر، راجع أيضاً الملف المرفق GUIDE_ARABIC.md.'
              : isFr
              ? 'Tous les chiffres ci-dessous se mettent à jour automatiquement selon votre configuration active dans le simulateur. Lisez ces 4 blocs avant votre passage devant le jury le 22 novembre 2026.'
              : 'All numbers below update dynamically from your active simulator configuration. Review these 4 sections before presenting to the CRTSE jury on November 22, 2026.'}
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-md shrink-0" role="group" aria-label="Guide Language">
          <button
            type="button"
            onClick={() => setGuideLang('fr')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              guideLang === 'fr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FR
          </button>
          <button
            type="button"
            onClick={() => setGuideLang('en')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              guideLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setGuideLang('ar')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              guideLang === 'ar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            العربية
          </button>
        </div>
      </div>

      {/* Section 1: 5-Minute Pitch Script */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {isAr
            ? '01. نص العرض الشفهي المؤقت (5 دقائق)'
            : isFr
            ? '01. Discours Chronométré (5 Minutes)'
            : '01. Timed 5-Minute Pitch Script'}
        </h2>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {pitchSections.map((sec) => (
            <div key={sec.time} className="p-4 space-y-1.5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-sm font-semibold text-slate-900">{sec.title}</h3>
                <span className="text-xs font-mono font-semibold text-blue-700 tabular-nums shrink-0">{sec.time}</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{sec.script}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Intuitive Physics Explainer */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {isAr
            ? '02. فهم الفيزياء والمشكلة والحل قبل مواجهة الباحثين'
            : isFr
            ? '02. Comprendre la Physique pour Répondre aux Chercheurs'
            : '02. Understanding the Physics Behind Every Number'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {physicsConcepts.map((item) => (
            <div key={item.name} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
              <p className="text-xs leading-relaxed text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Live Demo Choreography */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          {isAr
            ? '03. خطوات العرض التطبيقي المباشر (دقيقتان)'
            : isFr
            ? '03. Chorégraphie de Démonstration en Direct (2 Minutes)'
            : '03. 2-Minute Live Demo Choreography'}
        </h2>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <ol className="space-y-2.5 text-sm text-slate-700">
            {demoSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-blue-700 mt-0.5 tabular-nums">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section 4: Jury Q&A Defense Matrix */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          {isAr
            ? '04. أصعب أسئلة لجنة التحكيم وإجاباتها الهندسية'
            : isFr
            ? '04. Questions Difficiles du Jury & Réponses d’Ingénieur'
            : '04. Hard Jury Q&A Defense Matrix'}
        </h2>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {qaList.map((item, idx) => {
            const isOpen = openQaIdx === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setOpenQaIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-5 py-3.5 flex items-center justify-between gap-4 text-start hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-semibold text-slate-900">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-slate-700 bg-slate-50/50">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
