import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { fetchCountriesData, fetchPlacesData } from './services/globeDataService';
import Logo from './components/Logo'
import BottomMenu from './components/BottomMenu'
import GlobeDynamic from './components/GlobeDynamic';
import NewsScroll from './components/NewsScroll'; // Import our new component

function App() {
  // State to manage submenu opening
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    // State to track the active title for scrolling
    const [activeNewsTitle, setActiveNewsTitle] = useState(null);
  
  // New state to track selected coordinates for the globe
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);


  // Sample news events data
  const newsEvents = [
      {
        "title": "Au procès Sarkozy-Kadhafi",
        "subtitle": "le parquet requiert sept ans de prison et 300 000 euros d'amende contre l'ancien président",
        "description": "Nicolas Sarkozy a dénoncé l'outrance de la peine réclamée par les procureurs, qui l'ont dépeint en commanditaire d'un pacte de corruption inconcevable, inouï, indécent noué avec l'ex-dictateur Mouammar Kadhafi. Des peines de prison ont aussi été requises contre Claude Guéant, Brice Hortefeux et Eric Woerth.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "society",
        "themeTags": ["justice", "politics", "corruption"],
        "image": "https://img.lemde.fr/2025/03/27/348/0/4208/2104/644/322/60/0/51c3e89_ftp-import-images-1-boqg7ohsn7pg-2025-03-27t162408z-719012113-rc2rldaiyhgi-rtrmadp-3-france-politics-sarkozy-trial.JPG",
        "externalLink": "https://www.lemonde.fr/societe/article/2025/03/27/proces-sarkozy-kadhafi-le-parquet-requiert-sept-ans-de-prison-et-300-000-euros-d-amende-contre-l-ex-president-de-la-republique_6586809_3224.html",
        "date": "Thu, 27 Mar 2025 16:52:20 +0100",
        "location": "Paris",
        "lat": 48.8566,
        "lng": 2.3522,
      },
      {
        "title": "En direct, guerre en Ukraine",
        "subtitle": "Volodymyr Zelensky appelle, depuis Paris, les Etats-Unis à réagir après de nouvelles attaques russes",
        "description": "Le président ukrainien a dénoncé la violation d'un moratoire, assez flou, sur les attaques contre les cibles énergétiques. Il a également estimé que la proposition d'une force de réassurance, annoncée par Emmanuel Macron lors du sommet de la coalition des volontaires, posait beaucoup de questions, mais apportait encore peu de réponses.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "geopolitic",
        "themeTags": ["conflict", "war", "ukraine"],
        "image": "https://img.lemde.fr/2025/03/27/468/0/5616/2808/644/322/60/0/e56429a_ftp-import-images-1-dmdjumc5fzzj-879347bd76da40d5a3f03268cbfa6249-0-35e8da7decf34f079d849f729438f14c.jpg",
        "externalLink": "https://www.lemonde.fr/international/live/2025/03/27/en-direct-guerre-en-ukraine-volodymyr-zelensky-appelle-depuis-paris-les-etats-unis-a-reagir-apres-de-nouvelles-frappes-russes_6584822_3210.html",
        "date": "Thu, 27 Mar 2025 17:48:30 +0100",
        "location": "Paris",
        "lat": 48.8566,
        "lng": 2.3522
      },
      {
        "title": "A Gaza",
        "subtitle": "une nouvelle catastrophe humanitaire pour des habitants exténués par la guerre",
        "description": "Des humanitaires s'alarment du blocus en cours et dénoncent l'entrave à leur travail due à l'absence de garanties de sécurité par Israël, alors que les besoins sont immenses.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "geopolitic",
        "themeTags": ["conflict", "humanitarian", "middle-east"],
        "image": "https://img.lemde.fr/2025/03/26/720/0/8640/4320/644/322/60/0/4bcd026_sirius-fs-upload-1-aecd0vidqss0-1743009027277-199424.jpg",
        "externalLink": "https://www.lemonde.fr/international/article/2025/03/27/a-gaza-une-nouvelle-catastrophe-humanitaire-pour-des-habitants-extenues-par-la-guerre_6586811_3210.html",
        "date": "Thu, 27 Mar 2025 17:00:05 +0100",
        "location": "Gaza",
        "lat": 31.5017,
        "lng": 34.4668
      },
      {
        "title": "Droits de douane américains sur les voitures étrangères",
        "subtitle": "des réactions inquiètes et hostiles dans le monde entier après l'annonce de Trump",
        "description": "Les pays européens envisagent une riposte commerciale alors que le Mexique promet une réponse intégrale. Les constructeurs automobiles, y compris américains, sont très pessimistes.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "economy",
        "themeTags": ["trade", "automotive", "tariffs"],
        "image": "https://img.lemde.fr/2025/03/27/545/0/6540/3270/644/322/60/0/f5fa8df_ftp-import-images-1-9pqjrsmlwgvt-fe16271b85a042dea5ad87fd11f75849-0-e2a881edab094662a266133059444fe3.jpg",
        "externalLink": "https://www.lemonde.fr/economie/article/2025/03/27/droits-de-douane-americains-sur-l-automobile-une-mesure-agressive-deplore-le-ministre-de-l-economie-francais_6586726_3234.html",
        "date": "Thu, 27 Mar 2025 10:13:01 +0100",
        "location": "Washington",
        "lat": 38.9072,
        "lng": -77.0369
      },
      {
        "title": "La future place de la Concorde à Paris",
        "subtitle": "sera en grande partie piétonne, avec de vastes pelouses",
        "description": "La paysagiste Anne-Sylvie Bruel et l'architecte du patrimoine Philippe Prost ont été désignés, jeudi, pour réaménager la plus grande place parisienne. Les travaux sont estimés entre 36 et 38 millions d'euros.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "society",
        "themeTags": ["urban planning", "architecture", "public space"],
        "image": "https://img.lemde.fr/2025/03/27/236/0/2835/1417/644/322/60/0/0d9543f_sirius-fs-upload-1-vfw3x1na0hqx-1743092475017-concorde-vue-aerienne-projet-hd.jpg",
        "externalLink": "https://www.lemonde.fr/economie/article/2025/03/27/a-paris-grandes-pelouses-et-moins-de-voitures-place-de-la-concorde_6586822_3234.html",
        "date": "Thu, 27 Mar 2025 17:49:20 +0100",
        "location": "Paris",
        "lat": 48.8566,
        "lng": 2.3522
      },
      {
        "title": "Pour les Britanniques",
        "subtitle": "la guerre reste de l'histoire ancienne",
        "description": "Les Européens, la guerre et la paix (4/7). Au Royaume-Uni, l'armée jouit du prestige acquis lors des deux guerres mondiales, mais elle s'inquiète d'une menace perçue comme lointaine par l'opinion.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "geopolitic",
        "themeTags": ["defense", "uk", "military"],
        "image": "https://img.lemde.fr/2025/03/26/339/0/4059/2029/644/322/60/0/b89dace_sirius-fs-upload-1-172pddonkssm-1742998274053-ap23316414301534.jpg",
        "externalLink": "https://www.lemonde.fr/international/article/2025/03/27/pour-les-britanniques-la-guerre-demeure-de-l-histoire-ancienne_6586705_3210.html",
        "date": "Thu, 27 Mar 2025 06:00:20 +0100",
        "location": "London",
        "lat": 51.5074,
        "lng": -0.1278
      },
      {
        "title": "L'administration Trump",
        "subtitle": "va supprimer 10 000 postes au ministère de la santé des Etats-Unis",
        "description": "Cette restructuration majeure concerne des agences supervisées par le ministère, notamment celles chargées de la réponse aux épidémies ou de l'approbation de nouveaux médicaments.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "health",
        "themeTags": ["policy", "governance", "public health"],
        "image": "https://img.lemde.fr/2025/03/27/584/0/7040/3520/644/322/60/0/19a7eb4_ftp-import-images-1-fwbuge5h40tf-5437211-01-06.jpg",
        "externalLink": "https://www.lemonde.fr/international/article/2025/03/27/le-ministere-de-la-sante-americain-annonce-10-000-suppressions-d-emplois_6586799_3210.html",
        "date": "Thu, 27 Mar 2025 15:23:37 +0100",
        "location": "Washington",
        "lat": 38.9072,
        "lng": -77.0369
      },
      {
        "title": "En direct, guerre à Gaza",
        "subtitle": "l'ONU prévient que les réserves d'aide alimentaire seront épuisées d'ici à deux semaines",
        "description": "Le Programme alimentaire mondial des Nations unies a prévenu que la faim menaçait de nouveau l'enclave depuis la reprise des bombardements et des opérations militaires israéliennes.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "geopolitic",
        "themeTags": ["humanitarian", "conflict", "middle-east"],
        "image": "https://img.lemde.fr/2025/03/27/408/0/4898/2449/644/322/60/0/06ebdfc_ftp-import-images-1-mum90ggxuj7i-5436579-01-06.jpg",
        "externalLink": "https://www.lemonde.fr/international/live/2025/03/27/en-direct-guerre-a-gaza-l-onu-previent-que-les-reserves-d-aide-alimentaire-seront-epuisees-d-ici-a-deux-semaines_6585700_3210.html",
        "date": "Thu, 27 Mar 2025 17:18:12 +0100",
        "location": "Gaza",
        "lat": 31.5017,
        "lng": 34.4668
      },
      {
        "title": "L'essor de la fortune héritée",
        "subtitle": "génère une classe de non-privilégiés qui, désemparés, finissent par se tourner vers les partis contestataires",
        "description": "Dans les pays riches, l'essor de la fortune héritée génère des inégalités nuisant au capitalisme lui-même et les débats sur le sujet se limitent trop souvent à la seule fiscalité, déplore Marie Charrel, dans sa chronique.",
        "author": "Marie Charrel",
        "newspaper": "Le Monde",
        "theme": "economy",
        "themeTags": ["inequality", "wealth", "social mobility"],
        "image": "https://img.lemde.fr/2025/03/11/500/0/6000/3000/644/322/60/0/13627d5_ftp-import-images-1-ecsszh7n5koo-2025-03-11t110448z-247555622-up1el3b0urumc-rtrmadp-3-horseracing-cheltenham.JPG",
        "externalLink": "https://www.lemonde.fr/idees/article/2025/03/27/l-essor-de-la-fortune-heritee-genere-une-classe-de-non-privilegies-qui-desempares-finissent-par-se-tourner-vers-les-partis-contestataires_6586666_3232.html",
        "date": "Thu, 27 Mar 2025 05:30:06 +0100",
        "location": "Paris",
        "lat": 48.8566,
        "lng": 2.3522
      },
      {
        "title": "Mort du petit Emile",
        "subtitle": "la fin des gardes à vue des proches ne signifie pas l'abandon de la piste familiale, selon le procureur",
        "description": "Les grands-parents, un oncle et une tante ont été relâchés sans poursuite. Les enquêteurs jugent désormais probable l'intervention d'un tiers et privilégient la piste criminelle.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "society",
        "themeTags": ["crime", "investigation", "justice"],
        "image": "https://img.lemde.fr/2025/03/27/885/0/6000/3000/644/322/60/0/5f15101_sirius-fs-upload-1-6r63f6gdevmn-1743062770212-127210.jpg",
        "externalLink": "https://www.lemonde.fr/societe/article/2025/03/27/affaire-du-petit-emile-la-fin-des-gardes-a-vue-ne-signifie-pas-l-abandon-de-la-piste-intrafamiliale-selon-le-procureur_6586792_3224.html",
        "date": "Thu, 27 Mar 2025 14:24:15 +0100",
        "location": "La Bouilladisse",
        "lat": 43.4167,
        "lng": 5.6
      },
      {
        "title": "Procès Depardieu",
        "subtitle": "le parquet requiert dix-huit mois de prison avec sursis contre l'acteur, jugé pour agressions sexuelles",
        "description": "Le procureur a également demandé une amende de 20 000 euros, l'indemnisation des parties civiles, une obligation de soins psychologiques et l'inscription au fichier des auteurs d'infractions sexuelles",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "society",
        "themeTags": ["justice", "sexual assault", "celebrity"],
        "image": "https://img.lemde.fr/2025/03/27/569/0/5176/2588/644/322/60/0/b34f0a8_ftp-import-images-1-qnj30os6bykq-2025-03-27t101508z-1067898863-rc2mldai149n-rtrmadp-3-people-depardieu-trial.JPG",
        "externalLink": "https://www.lemonde.fr/societe/article/2025/03/27/proces-depardieu-le-parquet-requiert-dix-huit-mois-de-prison-avec-sursis-contre-l-acteur-juge-pour-agressions-sexuelles_6586793_3224.html",
        "date": "Thu, 27 Mar 2025 14:27:39 +0100",
        "location": "Paris",
        "lat": 48.8566,
        "lng": 2.3522
      },
      {
        "title": "Attaque au couteau à Amsterdam",
        "subtitle": "au moins cinq personnes blessées, un suspect arrêté et aucune information sur la cause ou le mobile",
        "description": "La police a précisé avoir mis en place un cordon de sécurité autour du lieu de l'incident, près de la place du Dam, dans le centre-ville, jeudi. L'état de santé des blessés n'a pas été communiqué dans l'immédiat.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "society",
        "themeTags": ["crime", "violence", "security"],
        "image": "https://img.lemde.fr/2025/03/27/691/0/8268/4134/644/322/60/0/b27ce34_ftp-import-images-1-s66gmrih3gi6-bc36d11a1c134fd89cf479990e81d0b7-0-e46fe5defe8d4ce88e0a3f31ea294baf.jpg",
        "externalLink": "https://www.lemonde.fr/international/article/2025/03/27/a-amsterdam-au-moins-cinq-personnes-blessees-dans-une-attaque-au-couteau_6586816_3210.html",
        "date": "Thu, 27 Mar 2025 17:20:50 +0100",
        "location": "Amsterdam",
        "lat": 52.3676,
        "lng": 4.9041
      },
      {
        "title": "Comment observer quand on est aveugle",
        "subtitle": "L'ethnographie au-delà de la cécité",
        "description": "La sociologue Anne Bory explique, dans sa Carte blanche au Monde, qu'il y a bien d'autres façons d'observer qu'avec les yeux. Elle appelle à ouvrir la voie à une ethnographie multisensorielle.",
        "author": "Anne Bory",
        "newspaper": "Le Monde",
        "theme": "science",
        "themeTags": ["research", "disability", "sociology"],
        "image": "https://img.lemde.fr/2023/03/30/326/0/4253/2126/644/322/60/0/4903a4d_1680167844315-le-monde-carte-blanche-def-01.jpg",
        "externalLink": "https://www.lemonde.fr/sciences/article/2025/03/27/comment-observer-quand-on-est-aveugle-l-ethnographie-au-dela-de-la-cecite_6586823_1650684.html",
        "date": "Thu, 27 Mar 2025 18:00:05 +0100",
        "location": "Paris",
        "lat": 48.8566,
        "lng": 2.3522
      },
      {
        "title": "Lora Terrade",
        "subtitle": "saké sommelière",
        "description": "A travers des ateliers dégustation chez Sola Cave et Céramiques, à Paris, et des soirées pop-up dans plusieurs établissements de la capitale, la sommelière de 31 ans s'est fixé pour mission de démocratiser le précieux alcool de riz fermenté.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "culture",
        "themeTags": ["food", "beverage", "gastronomy"],
        "image": "https://img.lemde.fr/2025/03/10/156/0/1200/600/644/322/60/0/8d22548_ftp-import-images-1-fpiuqw3p3rzj-373180-3407327.jpg",
        "externalLink": "https://www.lemonde.fr/m-styles/article/2025/03/27/lora-terrade-sake-sommeliere_6586819_4497319.html",
        "date": "Thu, 27 Mar 2025 17:30:14 +0100",
        "location": "Paris",
        "lat": 48.8566,
        "lng": 2.3522
      },
      {
        "title": "Sénégal",
        "subtitle": "le FMI confirme que Macky Sall a laissé 7 milliards de dollars de dettes cachées",
        "description": "Le chef de la division Afrique du FMI, Edward Gemayel, pointe les graves lacunes dans le contrôle budgétaire de la précédente présidence du pays.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "economy",
        "themeTags": ["africa", "debt", "governance"],
        "image": "https://img.lemde.fr/2023/07/03/0/0/2160/1080/644/322/60/0/34bb142_5692562-01-06.jpg",
        "externalLink": "https://www.lemonde.fr/afrique/article/2025/03/27/senegal-le-fmi-confirme-que-macky-sall-a-laisse-7-milliards-de-dollars-de-dettes-cachees_6586825_3212.html",
        "date": "Thu, 27 Mar 2025 18:00:09 +0100",
        "location": "Dakar",
        "lat": 14.7167,
        "lng": -17.4677
      },
      {
        "title": "Le Soudan du Sud au bord de la guerre civile",
        "subtitle": "après le placement en résidence surveillée du vice-président Riek Machar",
        "description": "Après l'intervention des forces du président Salva Kiir, mercredi, l'opposition a annoncé l'abrogation de l'accord de paix de 2018, faisant craindre une reprise du conflit qui avait fait rage durant cinq ans.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "geopolitic",
        "themeTags": ["conflict", "africa", "civil war"],
        "image": "https://img.lemde.fr/2025/03/27/0/0/4000/2000/644/322/60/0/bb39de3_ftp-import-images-1-tt3xwmhbcmsk-5433065-01-06.jpg",
        "externalLink": "https://www.lemonde.fr/afrique/article/2025/03/27/soudan-du-sud-le-placement-en-residence-surveillee-du-vice-president-riek-machar-precipite-le-pays-vers-la-guerre-civile_6586817_3212.html",
        "date": "Thu, 27 Mar 2025 17:29:18 +0100",
        "location": "Juba",
        "lat": 4.85,
        "lng": 31.6
      },
      {
        "title": "A regarder ce soir",
        "subtitle": "Pouvoir, scandale et gros sous : les hors-jeu du PSG, sur France 2",
        "description": "Le magazine Complément d'enquête s'intéresse à l'influent patron du club de football parisien.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "culture",
        "themeTags": ["sports", "media", "investigation"],
        "image": "https://img.lemde.fr/2025/03/13/160/0/1920/960/644/322/60/0/b094b52_sirius-fs-upload-1-ltnahfzl0sjy-1741883368783-frame-1743.jpg",
        "externalLink": "https://www.lemonde.fr/culture/article/2025/03/27/pouvoir-scandale-et-gros-sous-les-hors-jeu-du-psg-sur-france-2-les-cartons-rouges-du-president-nasser-al-khelaifi_6586812_3246.html",
        "date": "Mon, 17 Mar 2025 17:01:11 +0100",
        "location": "Paris",
        "lat": 48.8566,
        "lng": 2.3522
      },
      {
        "title": "En Afrique",
        "subtitle": "ceux qui désinforment ont maintenant le sentiment de pouvoir le faire avec une certaine liberté",
        "description": "La décision de Meta de supprimer son programme de fact-checking aux Etats-Unis inquiète les vérificateurs de faits sur le continent africain, une région très vulnérable aux campagnes de manipulation de l'information.",
        "author": "Le Monde",
        "newspaper": "Le Monde",
        "theme": "society",
        "themeTags": ["media", "disinformation", "technology"],
        "image": "https://img.lemde.fr/2025/03/27/619/0/5432/2716/644/322/60/0/06f0e1f_sirius-fs-upload-1-rw44gps059mk-1743071542990-063-2196626975.jpg",
        "externalLink": "https://www.lemonde.fr/afrique/article/2025/03/27/en-afrique-ceux-qui-desinforment-ont-maintenant-le-sentiment-de-pouvoir-le-faire-avec-une-certaine-liberte_6586783_3212.html",
        "date": "Thu, 27 Mar 2025 13:21:06 +0100",
        "location": "Menlo Park",
        "lat": 37.4529,
        "lng": -122.1817
      }
  ];
  
  console.log("events: ", newsEvents);

  // Handler for when a globe label is clicked
  const handleGlobeLabelClick = (title) => {
    setActiveNewsTitle(title);
  };
  // Function to handle navigation from NewsCard or NewsScroll
  const handleNavigateToArticle = (lat, lng) => {
    setSelectedCoordinates({ lat, lng });
  };

  // Custom event handler for submenu state
  const handleSubmenuToggle = (isOpen) => {
    setIsSubmenuOpen(isOpen);
  };

  return (
    <div className={`app-container  ${isSubmenuOpen ? 'submenu-open' : ''}`}>
      {/* Logo */}
      <Logo/>
      
      
      {/* Our new NewsScroll component */}
      <NewsScroll 
        newsEvents={newsEvents}
        onNavigateToArticle={handleNavigateToArticle}
      />
      
      {/* Globe */}
      <GlobeDynamic 
        newsEvents={newsEvents}
        navigateToCoordinates={selectedCoordinates} 
        onLabelClick={handleGlobeLabelClick}
      />
      
      {/* Menus */}
      <BottomMenu onSubmenuToggle={handleSubmenuToggle} />
      
      {/* Gradient overlay - moved to end to ensure proper layering */}
      <div className="gradient-overlay"></div>
    </div>
  );
}

export default App;