import { useMemo, useState, type ReactNode } from 'react';
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, Beaker, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight,
  ChevronDown, ClipboardList, Download, Droplets, Gauge, Layers3, MapPin,
  Menu, RotateCcw, ShieldCheck, SlidersHorizontal, Sun, Thermometer,
  Waves, X, Zap, Workflow, FlaskConical
} from 'lucide-react';

type View = 'overview' | 'process' | 'controls' | 'validation' | 'guide';
type Inputs = {
  ghi:number; ambient:number; groundwaterTemp:number; tds:number; pvtArea:number; thermalRecovery:number; pvEfficiency:number;
  pvtFlow:number; pvtTargetOutlet:number; roFeed:number; recovery:number; rejection:number; potableShare:number;
  dni:number; cstArea:number; opticalEfficiency:number; steamEnergy:number;
  turbineWork:number; generatorEfficiency:number; pondArea:number; evaporation:number;
  tankLevel:number; tankCapacity:number; roTempSetpoint:number;
};
const defaults:Inputs = {
  ghi:800, ambient:35, groundwaterTemp:24, tds:2500, pvtArea:650, thermalRecovery:32, pvEfficiency:20,
  pvtFlow:6, pvtTargetOutlet:40, roFeed:4.8, recovery:45, rejection:98.5, potableShare:85,
  dni:750, cstArea:120, opticalEfficiency:55, steamEnergy:2600,
  turbineWork:300, generatorEfficiency:90, pondArea:400, evaporation:5,
  tankLevel:15, tankCapacity:30, roTempSetpoint:30
};
const fmt = (v:number,d=1) => new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Number.isFinite(v)?v:0);
const clamp = (n:number,a:number,b:number) => Math.min(b,Math.max(a,n));
function model(x:Inputs) {
  const heat = x.ghi*x.pvtArea*x.thermalRecovery/100/1000;
  const mass = Math.max(.01,x.pvtFlow*1000/3600);
  const delta = heat/(mass*4.18);
  const recommendedPvtFlow = heat*3.6/(4.18*Math.max(2,x.pvtTargetOutlet-x.groundwaterTemp));
  const outlet = x.groundwaterTemp+delta;
  const cellRaw = x.ambient+0.03*x.ghi;
  const cellCooled = cellRaw-clamp(delta*.42,0,14);
  const pv = x.ghi*x.pvtArea*x.pvEfficiency/100/1000*clamp(1-.004*(cellCooled-25),.55,1.08);
  const roTempGap = Math.max(0,outlet-x.roTempSetpoint);
  const permeate = x.roFeed*x.recovery/100;
  const brine = Math.max(0,x.roFeed-permeate);
  const permeateTds = x.tds*(1-x.rejection/100);
  const brineTds = brine>0?(x.tds*x.roFeed-permeate*permeateTds)/brine:0;
  const potable = permeate*x.potableShare/100;
  const thermalFeed = permeate-potable;
  const solarHeat = x.dni*x.cstArea*x.opticalEfficiency/100/1000;
  const potentialSteam = solarHeat*3600/Math.max(500,x.steamEnergy);
  const steam = Math.min(potentialSteam,thermalFeed*1000);
  const turbine = steam*x.turbineWork*x.generatorEfficiency/100/3600;
  return {
    heat,delta,outlet,roFeed:x.roFeed,recommendedPvtFlow,roTempGap,cellRaw,cellCooled,pv,permeate,brine,permeateTds,brineTds,
    potable,thermalFeed,solarHeat,potentialSteam,steam,turbine,
    brineDaily:brine*24,evapDaily:x.pondArea*x.evaporation/1000,
    tankDelta:x.pvtFlow-x.roFeed,thermalFeedLimited:thermalFeed*1000<potentialSteam
  };
}
function Card({children,className=''}:{children:ReactNode;className?:string}) { return <section className={'panel '+className}>{children}</section>; }
function RangeField({label,value,min,max,step=1,unit,info,onChange}:{label:string;value:number;min:number;max:number;step?:number;unit:string;info?:string;onChange:(v:number)=>void}) {
 return <div className="range-field"><div className="range-head"><label>{label}</label><strong>{fmt(value,step<1?1:0)} <small>{unit}</small></strong></div><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/><div className="range-scale"><span>{min} {unit}</span><span>{max} {unit}</span></div>{info&&<p className="field-info">{info}</p>}</div>;
}
function Metric({icon:Icon,label,value,unit,foot,tone}:{icon:any;label:string;value:string;unit:string;foot:string;tone:string}) {
 return <Card className="metric-card"><div className="metric-top"><span className={'metric-icon '+tone}><Icon size={18}/></span><span>{label}</span></div><div className="metric-value">{value}<small>{unit}</small></div><div className="metric-foot">{foot}</div></Card>;
}
function Node({step,title,desc,value,unit,icon:Icon,tone,tag}:{step:string;title:string;desc:string;value:string;unit:string;icon:any;tone:string;tag:string}) {
 return <div className={'flow-node '+tone}><div className="node-head"><span>{step}</span><Icon size={17}/></div><strong>{title}</strong><p>{desc}</p><div className="node-value">{value}<small>{unit}</small></div><span className="node-tag">{tag}</span></div>;
}
const navs:[View,string,any][]=[
 ['overview','Vue d’ensemble',Activity],['process','Procédé intégré',Workflow],
 ['controls','Paramètres & contrôle',SlidersHorizontal],['validation','Validation technique',ShieldCheck],
 ['guide','Guide d’utilisation',BookOpen]
];
const guideSteps = [
 {title:'Découvrir le tableau de bord',duration:'45 secondes',icon:Activity,target:'overview' as View,action:'Ouvrir la vue d’ensemble',summary:'La vue d’ensemble rassemble les principaux indicateurs et le synoptique du procédé. Elle sert de point de départ pour comprendre l’état du scénario sélectionné.',points:['Production électrique PV/T et chaleur récupérée : deux résultats de calcul distincts.','Perméat RO et débit affecté à la branche potable : volumes calculés à partir du débit RO et du taux de récupération.','Puissance turbine : estimation brute, avant déduction des auxiliaires.','Synoptique : lecture rapide du parcours de l’eau, du forage jusqu’à l’osmose inverse.'],takeaway:'Commencez toujours par identifier les hypothèses du scénario avant d’interpréter les chiffres.',caution:'Les valeurs initiales sont des données de démonstration modifiables. Elles ne sont pas des mesures réalisées à Tendla.'},
 {title:'Suivre le parcours de l’eau',duration:'1 minute',icon:Workflow,target:'process' as View,action:'Ouvrir le procédé intégré',summary:'La page Procédé intégré explique les étapes dans l’ordre : captage, prétraitement, récupération thermique PV/T, stockage tampon, osmose inverse et valorisation des deux flux de sortie.',points:['L’eau prétraitée circule dans les canaux thermiques arrière de modules PV/T compatibles.','Le réservoir tampon absorbe les variations entre le débit PV/T et le débit demandé par les membranes.','Le perméat est réparti entre la voie eau potable et la voie solaire thermique.','Le concentrat RO est dirigé vers les bassins d’évaporation solaire pour étudier une cristallisation potentielle.'],takeaway:'Le perméat et le concentrat sont deux sorties distinctes de l’osmose inverse. Seule une fraction contrôlée du perméat alimente la branche solaire thermique.',caution:'La cristallisation, la pureté des sels et le rejet de vapeur après turbine restent des points d’étude, pas des résultats démontrés.'},
 {title:'Modifier les paramètres',duration:'1 minute 30',icon:SlidersHorizontal,target:'controls' as View,action:'Ouvrir les paramètres',summary:'La page Paramètres & contrôle permet de modifier les entrées du modèle. Chaque curseur change une hypothèse et recalcule immédiatement les résultats affichés dans la colonne de synthèse.',points:['Ressource : rayonnement, température ambiante, température et salinité de l’eau brute.','PV/T : surface active, rendement électrique supposé, part thermique récupérée et débit de circulation.','RO : débit d’alimentation, taux de récupération, rejet salin supposé et partage du perméat.','Collecteur solaire, turbine et bassins : paramètres de présélection à confirmer par les données fabricants et météo.'],takeaway:'Essayez de modifier une variable à la fois. Vous pourrez ainsi comprendre quel paramètre fait évoluer quel résultat.',caution:'Les plages de réglage sont des plages de démonstration, pas des limites d’exploitation ou des consignes recommandées par les fabricants.'},
 {title:'Comprendre les deux boucles',duration:'1 minute',icon:Gauge,target:'overview' as View,action:'Voir la supervision',summary:'La supervision conceptuelle met en évidence deux régulations coordonnées : la circulation d’eau dans le circuit PV/T et l’alimentation régulière des membranes RO.',points:['Boucle PV/T : le modèle calcule un débit de circulation recommandé à partir de la chaleur estimée et de la température de sortie cible.','Boucle RO : l’utilisateur définit le débit demandé aux membranes ; le réservoir tampon absorbe l’écart avec le débit venant du PV/T.','La température avant RO est comparée à une consigne de scénario pour visualiser un éventuel écart à corriger.','Une future supervision intelligente pourrait analyser les capteurs et proposer des consignes.'],takeaway:'Le tableau de bord illustre une logique de régulation proposée. Il ne commande pas de pompes, de vannes ou d’équipements réels.',caution:'Aucun automate, capteur ou modèle d’IA connecté n’est présent dans cette démonstration. Les protections et interverrouillages doivent rester indépendants de l’IA.'},
 {title:'Lire les résultats avec discernement',duration:'1 minute',icon:Beaker,target:'overview' as View,action:'Revenir aux résultats',summary:'Les résultats visibles sont des estimations issues d’un modèle simplifié. Ils aident à explorer les ordres de grandeur et les relations entre sous-systèmes, mais ne remplacent pas un dimensionnement professionnel.',points:['Bilan RO : alimentation = perméat + concentrat dans le calcul simplifié.','Qualité : le TDS du perméat et du concentrat est estimé à partir du rejet membranaire supposé.','Solaire thermique : la chaleur disponible et le débit de perméat limitent la production de vapeur estimée.','Turbine : la puissance affichée est brute ; le cycle thermodynamique complet et les auxiliaires ne sont pas modélisés.'],takeaway:'Une valeur calculée n’est pas une mesure. Vérifiez toujours ses paramètres d’entrée, son unité et son statut.',caution:'Le TDS ne certifie pas la potabilité. Le modèle ne calcule pas la cristallisation et ne valide pas la puissance nette du système.'},
 {title:'Vérifier, puis exporter',duration:'45 secondes',icon:ShieldCheck,target:'validation' as View,action:'Ouvrir la validation technique',summary:'La page Validation technique présente les informations manquantes et les études nécessaires avant tout dimensionnement ou déploiement sur site.',points:['Mesuré : donnée provenant d’un capteur ou d’une campagne documentée.','Hypothèse : valeur d’entrée modifiable choisie pour un scénario.','Simulé : résultat calculé par le modèle à partir des hypothèses.','À valider : donnée ou performance qui nécessite une analyse de terrain, une fiche fabricant ou un essai.'],takeaway:'Le bouton « Exporter les données » télécharge les paramètres et résultats du scénario courant au format CSV.',caution:'Pour le cas d’étude de Tendla, il faut notamment obtenir l’analyse complète de l’eau, l’essai de pompage, les données météo locales et les fiches techniques des équipements.'}
];
export default function App() {
 const [view,setView]=useState<View>('overview');
 const [tutorialStep,setTutorialStep]=useState(0);
 const [x,setX]=useState<Inputs>(defaults);
 const [mobile,setMobile]=useState(false);
 const [hour,setHour]=useState(12);
 const r=useMemo(()=>model(x),[x]);
 const change=(key:keyof Inputs,v:number)=>setX(p=>({...p,[key]:v}));
 const reset=()=>{setX(defaults);setHour(12);};
 const exportCsv=()=>{
  const rows=[['Paramètre','Valeur','Unité','Nature'],
   ...Object.entries(x).map(([k,v])=>[k,String(v),'','Hypothèse modifiable']),
   ['Puissance du pilote proposé','1000','kWp','Base de dimensionnement'],
   ['Chaleur PV/T',fmt(r.heat,2),'kWth','Simulé'],
   ['Température sortie PV/T',fmt(r.outlet,2),'°C','Simulé'],
   ['Perméat',fmt(r.permeate,2),'m3/h','Simulé'],
   ['Concentrat',fmt(r.brine,2),'m3/h','Simulé'],
   ['Débit branche potable',fmt(r.potable,2),'m3/h','Simulé'],
   ['Débit branche solaire',fmt(r.thermalFeed,2),'m3/h','Simulé'],
   ['Chaleur collecteur solaire',fmt(r.solarHeat,2),'kWth','Simulé'],
   ['Vapeur',fmt(r.steam,2),'kg/h','Simulé'],
   ['Puissance turbine brute',fmt(r.turbine,2),'kWe','Simulé, auxiliaires non déduits']];
  const csv=rows.map(row=>row.map(c=>'"'+String(c).replaceAll('"','""')+'"').join(';')).join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='QatraTherm_Tendla_scenario.csv';a.click();URL.revokeObjectURL(url);
 };
 const changeView=(v:View)=>{setView(v);setMobile(false);};
 return <div className="app-shell">
  <aside className={'sidebar '+(mobile?'sidebar-open':'')}>
   <div className="brand"><div className="brand-mark"><Droplets size={22}/></div><div><strong>QatraTherm</strong><span>WATER · ENERGY · INTELLIGENCE</span></div><button className="mobile-close" onClick={()=>setMobile(false)}><X size={18}/></button></div>
   <div className="sidebar-label">ESPACE PROJET</div>
   <div className="site-card"><div className="site-card-status"><i/> CAS D’ÉTUDE PROPOSÉ</div><h2>Tendla</h2><p><MapPin size={13}/> El Meghaïer, Algérie</p><div className="site-capacity"><span>Base de dimensionnement</span><strong>1 MWp</strong></div></div>
   <div className="sidebar-label nav-label">ESPACE DE TRAVAIL</div>
   <nav className="side-nav">{navs.map(([id,label,Icon])=><button key={id} className={view===id?'active':''} onClick={()=>changeView(id)}><Icon size={17}/><span>{label}</span>{view===id&&<i/>}</button>)}</nav>
   <div className="sidebar-bottom"><div className="integrity-card"><ShieldCheck size={17}/><div><strong>Mode démonstration</strong><span>Aucun capteur connecté</span></div></div><div className="sidebar-footer"><span>QATRA DIGITAL TWIN</span><span>CONCEPT · V0.3</span></div></div>
  </aside>
  {mobile&&<button className="mobile-scrim" onClick={()=>setMobile(false)} aria-label="Fermer"/>}
  <main className="main-area">
   <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={()=>setMobile(true)}><Menu size={20}/></button><div className="breadcrumbs"><span>QATRA /</span><strong>{navs.find(n=>n[0]===view)?.[1].toUpperCase()}</strong></div></div><div className="topbar-actions"><span className="scenario-pill"><i/> SCÉNARIO SIMULÉ</span><button className="export-button" onClick={exportCsv}><Download size={15}/> Exporter les données</button></div></header>
   <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">JUMEAU NUMÉRIQUE · SEM’INNOV 2026</div><h1>{view==='overview'?'Vue d’ensemble du système':view==='process'?'Procédé QatraTherm':view==='controls'?'Paramètres de simulation':view==='guide'?'Guide d’utilisation':'Validation & limites'}</h1><p>{view==='overview'?'Visualisation intégrée des flux d’eau, de chaleur et d’électricité pour le cas d’étude de Tendla.':view==='process'?'Suivez le parcours de l’eau et les conversions énergétiques du procédé.':view==='controls'?'Modifiez les hypothèses et observez immédiatement leurs effets sur le système.':view==='guide'?'Un parcours guidé pour comprendre les écrans, les paramètres et les résultats du jumeau numérique.':'Données requises, limites du modèle et vérifications avant dimensionnement.'}</p></div><div className="heading-context"><MapPin size={17}/><div><span>SITE DE RÉFÉRENCE</span><strong>Tendla · El Meghaïer</strong><small>Configuration exploratoire</small></div><ChevronDown size={15}/></div></div>
    <div className="notice-strip"><Beaker size={18}/><div><strong>Prototype de calcul — données de démonstration</strong><span>Les entrées sont des hypothèses modifiables. Les résultats sont simulés et ne représentent pas des mesures du site de Tendla ou des performances garanties.</span></div><button onClick={()=>changeView('validation')}>Limites du modèle <ArrowUpRight size={14}/></button></div>

    {view==='overview'&&<div className="view-stack">
     <div className="metrics-grid">
      <Metric icon={Zap} label="Production électrique PV/T" value={fmt(r.pv,1)} unit="kWe" foot="Estimation sur la surface PV/T active" tone="blue"/><Metric icon={Thermometer} label="Chaleur récupérée PV/T" value={fmt(r.heat,1)} unit="kWth" foot={'Élévation calculée de l’eau : +'+fmt(r.delta,1)+' °C'} tone="amber"/>
      <Metric icon={Droplets} label="Perméat RO estimé" value={fmt(r.permeate,2)} unit="m³/h" foot={fmt(r.brine,2)+' m³/h de concentrat'} tone="cyan"/>
      <Metric icon={Waves} label="Branche eau potable" value={fmt(r.potable,2)} unit="m³/h" foot={fmt(x.potableShare,0)+' % du perméat affecté'} tone="teal"/>
      <Metric icon={Zap} label="Turbine · puissance brute" value={fmt(r.turbine,2)} unit="kWe" foot="Avant déduction des auxiliaires" tone="violet"/>
     </div>
     <Card className="process-card"><div className="card-heading"><div><div className="eyebrow">SYNOPTIQUE FONCTIONNEL</div><h2>Parcours intégré de l’eau</h2><p>Architecture actuelle · de la ressource aux valorisations.</p></div><span className="model-stamp"><i/> MODÈLE EXPLORATOIRE</span></div>
      <div className="process-flow">
       <Node step="01" title="Forage" desc="Eau souterraine" value={fmt(x.pvtFlow,1)} unit="m³/h" icon={Waves} tone="blue" tag="Captage"/>
       <div className="flow-arrow"><ArrowRight/><span>Prétraitement</span></div>
       <Node step="02" title="Filtration" desc="Protection procédé" value="—" unit="analyse requise" icon={Layers3} tone="blue" tag="Prétraitement"/>
       <div className="flow-arrow"><ArrowRight/><span>Entrée PV/T</span></div>
       <Node step="03" title="Collecteur PV/T" desc="Refroidissement + chaleur" value={fmt(r.outlet,1)} unit="°C sortie" icon={Sun} tone="amber" tag={fmt(r.heat,1)+' kWth calculés'}/>
       <div className="flow-arrow"><ArrowRight/><span>Débit variable</span></div>
       <Node step="04" title="Réservoir tampon" desc="Découplage des débits" value={fmt(x.tankLevel,1)} unit={' / '+fmt(x.tankCapacity,0)+' m³'} icon={Waves} tone="cyan" tag={'Δ '+(r.tankDelta>=0?'+':'')+fmt(r.tankDelta,1)+' m³/h'}/>
       <div className="flow-arrow"><ArrowRight/><span>Pompe régulée</span></div>
       <Node step="05" title="Osmose inverse" desc="Perméat + concentrat" value={fmt(x.roFeed,1)} unit="m³/h alimentés" icon={Droplets} tone="teal" tag={fmt(x.recovery,0)+' % récupération'}/>
      </div>
      <div className="flow-legend"><span><i className="legend-dot water"/> Eau brute / prétraitée</span><span><i className="legend-dot heat"/> Chaleur récupérée</span><span><i className="legend-dot permeate"/> Perméat</span><span><i className="legend-dot brine"/> Concentrat</span><span><i className="legend-dot control"/> Mesures & consignes</span></div>
     </Card>
     <div className="stream-grid"><div className="stream-card potable-stream"><div className="stream-symbol"><Droplets size={19}/></div><div className="stream-kicker">BRANCHE A · PERMÉAT</div><h3>Eau destinée à l’usage potable</h3><p>Traitement final, reminéralisation éventuelle, désinfection, contrôle analytique et stockage.</p><strong>{fmt(r.potable,2)} m³/h</strong><span>Débit affecté dans le scénario</span></div><div className="stream-card thermal-stream"><div className="stream-symbol"><Sun size={19}/></div><div className="stream-kicker">BRANCHE B · PERMÉAT</div><h3>Production solaire de vapeur</h3><p>Collecteur à concentration, vaporisation, turbine et générateur électrique.</p><strong>{fmt(r.thermalFeed,2)} m³/h</strong><span>Alimentation solaire thermique</span></div><div className="stream-card brine-stream"><div className="stream-symbol"><Beaker size={19}/></div><div className="stream-kicker">CONCENTRAT RO</div><h3>Évaporation solaire</h3><p>Bassins d’évaporation et étude de la cristallisation selon la composition ionique réelle.</p><strong>{fmt(r.brine,2)} m³/h</strong><span>TDS estimé : {fmt(r.brineTds,0)} mg/L</span><span>Évaporation potentielle : {fmt(r.evapDaily,2)} m³/j · hypothèse</span></div></div>\n     <div className="bottom-grid">
      <Card><div className="card-heading compact"><div><div className="eyebrow">SORTIE OSMOSE INVERSE</div><h2>Répartition du perméat</h2><p>Deux voies indépendantes.</p></div><span className="soft-tag">Calcul simulé</span></div>
       <div className="split-summary"><div><span>Perméat total</span><strong>{fmt(r.permeate,2)} <small>m³/h</small></strong></div><div className="share-donut" style={{background:'conic-gradient(#12a88c '+x.potableShare+'%, #f3b45b 0)'}}><div><strong>{fmt(x.potableShare,0)}%</strong><small>potable</small></div></div></div>
       <div className="bar-row"><span><i className="legend-dot permeate"/> Branche potable</span><b>{fmt(r.potable,2)} m³/h</b></div><div className="progress-track"><i className="teal-fill" style={{width:x.potableShare+'%'}}/></div>
       <div className="bar-row"><span><i className="legend-dot heat"/> Branche solaire thermique</span><b>{fmt(r.thermalFeed,2)} m³/h</b></div><div className="progress-track"><i className="amber-fill" style={{width:(100-x.potableShare)+'%'}}/></div>
       <div className="quality-note"><ShieldCheck size={16}/> TDS perméat estimé : {fmt(r.permeateTds,0)} mg/L (rejet membranaire supposé {fmt(x.rejection,1)} %). Ce calcul ne certifie pas la potabilité : traitement final et analyses de laboratoire requis.</div>
      </Card>
      <Card><div className="card-heading compact"><div><div className="eyebrow">BRANCHE SOLAIRE THERMIQUE</div><h2>Chaleur → vapeur → électricité</h2><p>Estimation simplifiée de premier niveau.</p></div><span className="soft-tag amber-tag">À valider</span></div>
       <div className="energy-chain"><div><Sun/><span>Collecteur CST</span><strong>{fmt(r.solarHeat,1)} <small>kWth</small></strong></div><ArrowRight/><div><Waves/><span>Vapeur estimée</span><strong>{fmt(r.steam,1)} <small>kg/h</small></strong></div><ArrowRight/><div><Zap/><span>Générateur</span><strong>{fmt(r.turbine,2)} <small>kWe</small></strong></div></div>
       <div className="energy-foot">Puissance électrique brute estimée ; les consommations auxiliaires ne sont pas déduites.</div>
       <div className="energy-foot muted">{r.thermalFeedLimited?'Débit de perméat disponible limitant dans ce scénario.':'Puissance thermique du collecteur limitante dans ce scénario.'}</div>
      </Card>
     </div>
     <div className="lower-grid">
      <Card><div className="card-heading compact"><div><div className="eyebrow">BILAN HYDRIQUE INSTANTANÉ</div><h2>Répartition des flux RO</h2></div><span className="soft-tag">m³/h</span></div>
       {[['Alimentation RO',r.roFeed,100],['Perméat',r.permeate,x.recovery],['Concentrat',r.brine,100-x.recovery]].map(([name,v,p]:any)=><div className="balance-row" key={name}><div><span>{name}</span><b>{fmt(v,2)}</b></div><div className="balance-track"><i style={{width:p+'%'}}/></div></div>)}
      </Card>
      <Card><div className="card-heading compact"><div><div className="eyebrow">TAMPON HYDRAULIQUE</div><h2>Découplage des débits</h2></div><span className="soft-tag">Hypothèse</span></div>
       <div className="tank-summary"><div className="tank-shell"><div className="tank-fill" style={{height:clamp(x.tankLevel/x.tankCapacity*100,0,100)+'%'}}/><span>{fmt(x.tankLevel,1)}</span></div><div><strong>{fmt(x.tankLevel/x.tankCapacity*100,0)} %</strong><span>Niveau initial du scénario</span><p>Entrée PV/T : {fmt(x.pvtFlow,1)} m³/h<br/>Sortie RO : {fmt(x.roFeed,1)} m³/h</p><em>Variation théorique : {(r.tankDelta>=0?'+':'')+fmt(r.tankDelta,2)} m³/h</em></div></div>
      </Card>
     </div>
     <Card className="supervision-card"><div className="supervision-head"><div><div className="eyebrow">SUPERVISION INTELLIGENTE · CONCEPT</div><h2>Deux boucles de régulation coordonnées</h2><p>Logique de démonstration pour illustrer les consignes — aucun automate ni capteur réel n’est connecté.</p></div><span className="soft-tag cyan-tag">LOGIQUE PROPOSÉE</span></div><div className="loop-grid"><div className="loop-panel"><div className="loop-label"><span>BOUCLE 01</span><b>Régulation thermique PV/T</b></div><div className="loop-main"><div><small>Débit mesuré / scénario</small><strong>{fmt(x.pvtFlow,1)} <i>m³/h</i></strong></div><ArrowRight size={18}/><div><small>Débit recommandé</small><strong>{fmt(r.recommendedPvtFlow,1)} <i>m³/h</i></strong></div></div><p>La consigne de débit est calculée pour rapprocher la température de sortie PV/T de la cible de {fmt(x.pvtTargetOutlet,1)} °C.</p></div><div className="loop-panel ro-loop"><div className="loop-label"><span>BOUCLE 02</span><b>Alimentation RO & tampon</b></div><div className="loop-main"><div><small>Consigne pompe RO</small><strong>{fmt(x.roFeed,1)} <i>m³/h</i></strong></div><ArrowRight size={18}/><div><small>Équilibre tampon</small><strong>{(r.tankDelta>=0?'+':'')+fmt(r.tankDelta,1)} <i>m³/h</i></strong></div></div><p>Le réservoir absorbe l’écart entre le débit disponible en sortie PV/T et le débit demandé par les membranes.</p><div className="temperature-gap">Écart thermique à corriger avant RO <strong>{fmt(r.roTempGap,1)} °C</strong> <span>Consigne de scénario : {fmt(x.roTempSetpoint,1)} °C</span></div></div></div></Card>\n     <div className="quick-control"><div><div className="eyebrow">AJUSTEMENT RAPIDE</div><strong>Répartition du perméat</strong><p>Modifiez la part réservée à l’eau potable.</p></div><RangeField label="Part du perméat vers l’eau potable" value={x.potableShare} min={0} max={100} unit="%" onChange={v=>change('potableShare',v)}/><button className="link-button" onClick={()=>changeView('controls')}>Tous les paramètres <ArrowUpRight size={15}/></button></div>
    </div>}

    {view==='process'&&<div className="view-stack">
     <Card className="process-detail"><div className="section-heading"><div className="eyebrow">ARCHITECTURE DE PROCÉDÉ</div><h2>Du forage aux flux valorisés</h2><p>Séquence fonctionnelle du dossier de référence QatraTherm.</p></div>
      <div className="process-timeline">
       {[
        ['01','Captage de l’eau souterraine','Extraction depuis un forage du périmètre d’étude de Tendla. Le débit durable et la composition doivent être confirmés par essais.',fmt(x.pvtFlow,1)+' m³/h · entrée de scénario',Waves,'blue'],
        ['02','Prétraitement / filtration','Traitement adapté à l’analyse complète de l’eau afin de protéger les équipements en aval.','Spécification à établir',Layers3,'blue'],
        ['03','Refroidissement PV/T et récupération thermique','Circulation dans les canaux arrière de modules compatibles. L’eau absorbe une partie de la chaleur.',fmt(r.heat,1)+' kWth · '+fmt(r.outlet,1)+' °C sortie',Sun,'amber'],
        ['04','Réservoir tampon','Absorbe les variations du débit PV/T et découple la ressource de la demande des membranes.',fmt(x.tankLevel,1)+' / '+fmt(x.tankCapacity,1)+' m³ · niveau initial',Waves,'cyan'],
        ['05','Pompe de régulation et osmose inverse','La pompe fournit le débit requis. La température est surveillée et corrigée si nécessaire selon les limites membrane.',fmt(x.roFeed,1)+' m³/h · '+fmt(x.recovery,0)+' % récupération',Gauge,'teal'],
        ['06A','Perméat — voie eau potable','Traitement final, reminéralisation éventuelle, désinfection, contrôle analytique et stockage.',fmt(r.potable,2)+' m³/h affectés',Droplets,'teal'],
        ['06B','Perméat — voie solaire thermique','Une fraction contrôlée alimente le collecteur solaire à concentration.',fmt(r.thermalFeed,2)+' m³/h affectés',Sun,'amber'],
        ['07','Vaporisation et turbine-générateur','La vapeur entraîne une turbine. L’intégration électrique dépendra de l’étude des protections et du raccordement.',fmt(r.steam,1)+' kg/h · '+fmt(r.turbine,2)+' kWe bruts',Zap,'violet'],
        ['08','Concentrat — évaporation solaire','Le concentrat rejoint les bassins. La cristallisation dépend de la composition ionique réelle et d’essais.',fmt(r.brine,2)+' m³/h · TDS '+fmt(r.brineTds,0)+' mg/L · évaporation potentielle '+fmt(r.evapDaily,2)+' m³/j',FlaskConical,'green']
       ].map((item:any,i:number)=>{const Icon=item[4];return <div className="timeline-item" key={item[0]}><div className={'timeline-icon '+item[5]}><Icon size={17}/></div><div className="timeline-copy"><span>ÉTAPE {item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p><strong>{item[3]}</strong></div>{i!==8&&<div className="timeline-line"/>}</div>})}
      </div>
     </Card>
     <div className="two-notes"><Card><div className="eyebrow">BRANCHE TURBINE</div><h3>Sortie vapeur : hypothèse à étudier</h3><p>La proposition actuelle prévoit un rejet contrôlé de la vapeur en sortie de turbine, avec une éventuelle fonction d’humidification. L’état de vapeur, les pertes d’eau, la sécurité et les impacts environnementaux restent à étudier.</p></Card><Card><div className="eyebrow">BRANCHE CONCENTRAT</div><h3>Pas de sel commercial revendiqué</h3><p>La nature, la quantité et la pureté des solides dépendent de la composition chimique et d’essais de cristallisation. Aucune valorisation commerciale n’est considérée comme acquise.</p></Card></div>
    </div>}

    {view==='controls'&&<div className="view-stack">
     <div className="control-layout"><div className="control-sections">
      <Card className="control-card"><div className="card-heading"><div><div className="eyebrow">01 · RESSOURCE & ENVIRONNEMENT</div><h2>Conditions du scénario</h2><p>Entrées modifiables — non mesurées à Tendla.</p></div><span className="soft-tag">Hypothèses</span></div><div className="range-grid">
       <RangeField label="Rayonnement global" value={x.ghi} min={200} max={1100} unit="W/m²" onChange={v=>change('ghi',v)}/><RangeField label="Température ambiante" value={x.ambient} min={10} max={50} unit="°C" onChange={v=>change('ambient',v)}/><RangeField label="Température eau brute" value={x.groundwaterTemp} min={10} max={45} unit="°C" onChange={v=>change('groundwaterTemp',v)}/><RangeField label="Salinité eau brute (TDS)" value={x.tds} min={300} max={10000} step={100} unit="mg/L" info="À remplacer par une analyse laboratoire." onChange={v=>change('tds',v)}/>
      </div></Card>
      <Card className="control-card"><div className="card-heading"><div><div className="eyebrow">02 · PV/T & TAMPON</div><h2>Refroidissement et récupération</h2><p>Surface active et débit du circuit thermique.</p></div><span className="soft-tag amber-tag">PV/T</span></div><div className="range-grid">
       <RangeField label="Surface active PV/T" value={x.pvtArea} min={50} max={3000} step={10} unit="m²" onChange={v=>change('pvtArea',v)}/><RangeField label="Part thermique récupérée (hyp.)" value={x.thermalRecovery} min={10} max={60} unit="%" onChange={v=>change('thermalRecovery',v)}/><RangeField label="Rendement électrique PV (hyp.)" value={x.pvEfficiency} min={10} max={28} step={.5} unit="%" onChange={v=>change('pvEfficiency',v)}/><RangeField label="Débit circuit PV/T" value={x.pvtFlow} min={.5} max={30} step={.1} unit="m³/h" onChange={v=>change('pvtFlow',v)}/><RangeField label="Consigne température sortie PV/T" value={x.pvtTargetOutlet} min={25} max={60} step={.5} unit="°C" onChange={v=>change('pvtTargetOutlet',v)}/><RangeField label="Niveau initial tampon" value={x.tankLevel} min={0} max={x.tankCapacity} step={.5} unit="m³" onChange={v=>change('tankLevel',v)}/><RangeField label="Capacité réservoir" value={x.tankCapacity} min={5} max={150} unit="m³" onChange={v=>setX(p=>({...p,tankCapacity:v,tankLevel:Math.min(p.tankLevel,v)}))}/>
      </div></Card>
      <Card className="control-card"><div className="card-heading"><div><div className="eyebrow">03 · OSMOSE INVERSE</div><h2>Alimentation des membranes</h2><p>Débit, taux de récupération et rejet salin supposé.</p></div><span className="soft-tag cyan-tag">RO</span></div><div className="range-grid">
       <RangeField label="Consigne alimentation RO" value={x.roFeed} min={.5} max={30} step={.1} unit="m³/h" onChange={v=>change('roFeed',v)}/><RangeField label="Taux de récupération" value={x.recovery} min={20} max={80} unit="%" onChange={v=>change('recovery',v)}/><RangeField label="Rejet salin membrane (hyp.)" value={x.rejection} min={90} max={99.8} step={.1} unit="%" onChange={v=>change('rejection',v)}/><RangeField label="Consigne température RO" value={x.roTempSetpoint} min={15} max={40} step={.5} unit="°C" info="Consigne de scénario, pas une limite constructeur." onChange={v=>change('roTempSetpoint',v)}/><RangeField label="Perméat vers eau potable" value={x.potableShare} min={50} max={100} unit="%" onChange={v=>change('potableShare',v)}/>
      </div></Card>
      <Card className="control-card"><div className="card-heading"><div><div className="eyebrow">04 · SOLAIRE THERMIQUE & TURBINE</div><h2>Collecteur à concentration</h2><p>Estimation simplifiée de la branche alimentée par le perméat.</p></div><span className="soft-tag amber-tag">CST</span></div><div className="range-grid">
       <RangeField label="Rayonnement direct (DNI)" value={x.dni} min={100} max={1100} unit="W/m²" onChange={v=>change('dni',v)}/><RangeField label="Surface du collecteur" value={x.cstArea} min={10} max={1000} step={5} unit="m²" onChange={v=>change('cstArea',v)}/><RangeField label="Rendement optique global" value={x.opticalEfficiency} min={20} max={75} unit="%" onChange={v=>change('opticalEfficiency',v)}/><RangeField label="Énergie spécifique vaporisation" value={x.steamEnergy} min={2200} max={3200} step={10} unit="kJ/kg" onChange={v=>change('steamEnergy',v)}/><RangeField label="Travail spécifique turbine (hyp.)" value={x.turbineWork} min={50} max={800} step={10} unit="kJ/kg" onChange={v=>change('turbineWork',v)}/><RangeField label="Rendement générateur" value={x.generatorEfficiency} min={60} max={98} unit="%" onChange={v=>change('generatorEfficiency',v)}/>
      </div></Card>
      <Card className="control-card"><div className="card-heading"><div><div className="eyebrow">05 · GESTION DU CONCENTRAT</div><h2>Bassins d’évaporation solaire</h2><p>Évaporation d’eau indicative, sans prédire la cristallisation.</p></div><span className="soft-tag green-tag">Saumure</span></div><div className="range-grid">
       <RangeField label="Surface des bassins" value={x.pondArea} min={50} max={10000} step={10} unit="m²" onChange={v=>change('pondArea',v)}/><RangeField label="Évaporation nette supposée" value={x.evaporation} min={1} max={12} step={.5} unit="mm/j" info="À remplacer par les données météo locales." onChange={v=>change('evaporation',v)}/>
      </div></Card>
     </div>
     <aside className="results-column"><Card className="results-card"><div className="eyebrow">RÉSULTATS EN DIRECT</div><h2>État du scénario</h2>{[['Chaleur PV/T',fmt(r.heat,1),'kWth'],['Température sortie PV/T',fmt(r.outlet,1),'°C'],['Perméat RO',fmt(r.permeate,2),'m³/h'],['Concentrat RO',fmt(r.brine,2),'m³/h'],['Vapeur estimée',fmt(r.steam,1),'kg/h'],['Puissance turbine brute',fmt(r.turbine,2),'kWe']].map(row=><div className="result-line" key={row[0]}><span>{row[0]}</span><strong>{row[1]} <small>{row[2]}</small></strong></div>)}<div className="result-hint"><Activity size={16}/>{r.thermalFeedLimited?'Débit du perméat disponible limitant.':'Puissance du collecteur thermique limitante.'}</div><button className="reset-button" onClick={reset}><RotateCcw size={15}/> Réinitialiser</button><button className="export-wide" onClick={exportCsv}><Download size={15}/> Exporter les hypothèses CSV</button><p className="results-disclaimer">Résultats de présélection. Ne remplace pas une projection fabricant ni une étude thermodynamique détaillée.</p></Card></aside></div>
    </div>}

    {view==='guide'&&<div className="view-stack guide-view">
     <Card className="guide-intro">
      <div className="guide-intro-main"><div className="guide-intro-icon"><BookOpen size={23}/></div><div><div className="eyebrow">CENTRE D’APPRENTISSAGE · GUIDE INTERACTIF</div><h2>Comprendre QatraTherm, étape par étape</h2><p>Suivez ce parcours de quelques minutes pour découvrir le tableau de bord, le procédé, les commandes de simulation et la lecture des résultats.</p></div></div>
      <div className="guide-progress-header"><span>Votre progression</span><strong>{tutorialStep+1} / {guideSteps.length} étapes</strong></div>
      <div className="guide-progress"><i style={{width:(((tutorialStep+1)/guideSteps.length)*100)+'%'}}/></div>
     </Card>
     <div className="guide-layout">
      <Card className="guide-index"><div className="eyebrow">PARCOURS</div>{guideSteps.map((step,i)=><button key={step.title} className={'guide-index-item '+(tutorialStep===i?'current':'')} onClick={()=>setTutorialStep(i)}><span className="guide-index-number">{i<tutorialStep?<Check size={14}/>:String(i+1).padStart(2,'0')}</span><span className="guide-index-copy"><strong>{step.title}</strong><small>{step.duration}</small></span>{tutorialStep===i&&<span className="guide-index-active"/>}</button>)}<div className="guide-index-note"><ShieldCheck size={15}/><span>Ce guide explique le prototype. Il ne constitue pas une procédure d’exploitation industrielle.</span></div></Card>
      <Card className="guide-lesson">
       <div className="guide-lesson-top"><div className="guide-step-label"><span>ÉTAPE {String(tutorialStep+1).padStart(2,'0')}</span><i/> {guideSteps[tutorialStep].duration}</div><span className="guide-lesson-badge">TUTORIEL</span></div>
       <div className="guide-lesson-icon">{(()=>{const Icon=guideSteps[tutorialStep].icon;return <Icon size={24}/>})()}</div>
       <h2>{guideSteps[tutorialStep].title}</h2>
       <p className="guide-summary">{guideSteps[tutorialStep].summary}</p>
       <div className="guide-points"><h3>Ce qu’il faut comprendre</h3>{guideSteps[tutorialStep].points.map((point,i)=><div className="guide-point" key={point}><span>{String(i+1).padStart(2,'0')}</span><p>{point}</p></div>)}</div>
       <div className="guide-takeaway"><span>À RETENIR</span><p>{guideSteps[tutorialStep].takeaway}</p></div>
       <div className="guide-caution"><ShieldCheck size={17}/><p>{guideSteps[tutorialStep].caution}</p></div>
       <div className="guide-actions"><button className="guide-explore" onClick={()=>changeView(guideSteps[tutorialStep].target)}><span>{guideSteps[tutorialStep].action}</span><ArrowUpRight size={16}/></button><div className="guide-step-buttons"><button className="guide-prev" onClick={()=>setTutorialStep(v=>Math.max(0,v-1))} disabled={tutorialStep===0}><ChevronLeft size={15}/> Précédent</button><button className="guide-next" onClick={()=>setTutorialStep(v=>v===guideSteps.length-1?0:v+1)}>{tutorialStep===guideSteps.length-1?'Recommencer':'Suivant'} <ChevronRight size={15}/></button></div></div>
       {tutorialStep===guideSteps.length-1&&<button className="guide-export-example" onClick={exportCsv}><Download size={15}/> Télécharger un exemple CSV du scénario courant</button>}
      </Card>
     </div>
     <div className="guide-bottom-tip"><div><CheckCircle2 size={17}/><strong>Conseil</strong></div><p>Pour découvrir la plateforme librement, modifiez une seule hypothèse à la fois, observez le changement des résultats, puis revenez aux paramètres initiaux avec « Réinitialiser ».</p><button onClick={()=>{reset();setTutorialStep(0);changeView('overview')}}><RotateCcw size={14}/> Repartir du scénario initial</button></div>
    </div>}
    {view==='validation'&&<div className="view-stack">
     <Card className="validation-hero"><div className="validation-shield"><ShieldCheck size={25}/></div><div><div className="eyebrow">TRANSPARENCE TECHNIQUE</div><h2>Un modèle exploratoire, pas une installation validée</h2><p>Les calculs doivent être consolidés par des données de site, des fiches constructeurs et des essais. Aucune mesure réelle de Tendla n’est intégrée par défaut.</p></div></Card>
     <div className="validation-grid">
      {[
       ['Données du site','À obtenir','Analyse complète de l’eau souterraine, essai de pompage, niveau dynamique du forage et profil météo local.','blue'],
       ['Modules PV/T','À confirmer','Référence des modules, compatibilité des canaux arrière, garantie et essais thermiques instrumentés.','amber'],
       ['Osmose inverse','À dimensionner','Projection fabricant basée sur composition réelle, température corrigée et débit d’alimentation.','cyan'],
       ['Eau potable','À analyser','Traitement final, reminéralisation si nécessaire, désinfection et analyses de conformité.','teal'],
       ['Collecteur & turbine','À étudier','DNI local, courbes collecteur, états thermodynamiques, rendements, auxiliaires et protections électriques.','violet'],
       ['Saumure & sels','À caractériser','Bilan d’évaporation, composition ionique, essais de cristallisation et gestion environnementale.','green'],
       ['Supervision intelligente','À concevoir','Capteurs, stratégie de commande, limites de sécurité et interverrouillages indépendants.','blue'],
       ['Économie du pilote','À chiffrer','Devis fournisseurs, génie civil, instrumentation, énergie auxiliaire et maintenance.','amber']
      ].map(([title,status,desc,tone])=><Card className="validation-item" key={title}><span className={'validation-icon '+tone}><ClipboardList size={17}/></span><div><div className="validation-status">{status}</div><h3>{title}</h3><p>{desc}</p></div></Card>)}
     </div>
     <Card className="method-card"><div className="eyebrow">MÉTHODE DE LECTURE</div><h2>Traçabilité des valeurs</h2><div className="method-grid"><div><i className="method-dot measured"/><strong>Mesuré</strong><p>Valeur issue d’un capteur ou d’une campagne documentée. Aucun relevé de Tendla n’est fourni ici.</p></div><div><i className="method-dot assumption"/><strong>Hypothèse</strong><p>Paramètre d’entrée modifiable utilisé pour explorer un scénario.</p></div><div><i className="method-dot simulated"/><strong>Simulé</strong><p>Résultat calculé à partir des équations simplifiées et des hypothèses sélectionnées.</p></div><div><i className="method-dot pending"/><strong>À valider</strong><p>Point nécessitant données de terrain, documentation constructeur ou essai.</p></div></div></Card>
     <div className="technical-note"><CheckCircle2 size={17}/><p><strong>Limite du modèle :</strong> le bilan turbine est une estimation simplifiée, sans cycle thermodynamique complet ni calcul de puissance nette. La cristallisation n’est pas simulée faute d’analyse ionique détaillée. Les contrôles de sécurité ne sont pas exécutés par cette interface.</p></div>
    </div>}
    <footer className="page-footer"><span>QatraTherm · Jumeau numérique conceptuel · SEM’INNOV 2026</span><span><i/> Modèle local · aucune connexion à une installation réelle</span></footer>
   </div>
  </main>
 </div>;
}
